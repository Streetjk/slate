import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("watchdog", Path(__file__).with_name("slate-quota-watchdog.py"))
w = importlib.util.module_from_spec(spec)
spec.loader.exec_module(w)

class WatchdogTest(unittest.TestCase):
    def test_configured_bind_address(self):
        import plistlib
        with tempfile.TemporaryDirectory() as temp:
            home = Path(temp)
            file = home / 'Library/LaunchAgents/com.slate.ai-usage-helper.plist'
            file.parent.mkdir(parents=True)
            file.write_bytes(plistlib.dumps({'EnvironmentVariables':{'SLATE_AI_HELPER_HOST':'100.73.201.113','SLATE_AI_HELPER_PORT':'19091'}}))
            with patch.object(w,'HOME_DIR',home):
                self.assertEqual(w.helper_health_url(),'http://100.73.201.113:19091/healthz')
            file.write_bytes(plistlib.dumps({'EnvironmentVariables':{'SLATE_AI_HELPER_HOST':'0.0.0.0'}}))
            with patch.object(w,'HOME_DIR',home):
                self.assertEqual(w.helper_health_url(),'http://127.0.0.1:19091/healthz')

    def test_freshness(self):
        now = 1791597600
        iso = lambda x: w.datetime.datetime.fromtimestamp(x, w.datetime.timezone.utc).isoformat()
        row = {"authMetadataDetected": True, "quota": {"observedAt": iso(now-10), "windows": [{"resetAt": iso(now+100)}]}}
        self.assertEqual(w.provider_state(row,now), "fresh")
        row["quota"]["observedAt"] = iso(now-1801)
        self.assertEqual(w.provider_state(row,now), "stale")
        row["quota"]["observedAt"] = iso(now+10)
        self.assertEqual(w.provider_state(row,now), "stale")
        row["quota"]["observedAt"] = iso(now-10)
        row["quota"]["windows"][0]["resetAt"] = iso(now-1)
        self.assertEqual(w.provider_state(row,now), "expired")
        row["authMetadataDetected"] = False
        self.assertEqual(w.provider_state(row,now), "sign_in")
        self.assertEqual(w.provider_state(None,now), "missing")

    def simulate(self, responding, prior=None, failing_snapshot=False, stale=False):
        with tempfile.TemporaryDirectory() as temp:
            state = Path(temp)
            if prior: (state/"state.json").write_text(json.dumps(prior))
            now = w.time.time()
            iso = w.datetime.datetime.fromtimestamp(now-10,w.datetime.timezone.utc).isoformat()
            data = {p:{"authMetadataDetected":True,"quota":None if stale else {"observedAt":iso,"windows":[{}]}} for p in w.PROVIDERS}
            with patch.object(w,"STATE_DIR",state), patch.object(w,"local_responding",side_effect=responding), patch.object(w,"restart_helper") as restart, patch.object(w,"snapshot",side_effect=OSError() if failing_snapshot else None,return_value=data) as snapshot, patch.object(w.time,"sleep"), patch.object(w,"ssh",return_value=json.dumps({"renderCount":1,"renderStale":False,"queued":0,"deviceLastSeen":[]})), patch("builtins.print"):
                w.run()
                return restart.call_count, snapshot.call_count, json.loads((state/"latest.json").read_text())

    def test_healthy_no_restart(self):
        r, s, receipt = self.simulate([True])
        self.assertEqual((r,s),(0,1))
        self.assertTrue(all(v=="fresh" for v in receipt["providers"].values()))
    def test_network_failure_no_restart(self):
        self.assertEqual(self.simulate([True],failing_snapshot=True)[0],0)
    def test_stale_retry_no_restart(self):
        r,s,_=self.simulate([True],stale=True)
        self.assertEqual((r,s),(0,2))
    def test_local_failure_restart(self):
        self.assertEqual(self.simulate([False,False])[0],1)
    def test_transient_failure_no_restart(self):
        self.assertEqual(self.simulate([False,True])[0],0)
    def test_cooldown_no_restart(self):
        r,_,receipt=self.simulate([False,False],prior={"lastRestart":w.time.time()})
        self.assertEqual(r,0)
        self.assertEqual(receipt["action"],"restart_cooldown")

if __name__ == "__main__": unittest.main()
