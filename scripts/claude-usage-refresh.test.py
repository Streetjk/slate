import datetime as dt
import importlib.util
import os
from pathlib import Path
import sys
import tempfile
import textwrap
import unittest

spec = importlib.util.spec_from_file_location("claude_usage_refresh",
    Path(__file__).with_name("claude-usage-refresh.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

NOW = dt.datetime(2026, 10, 6, 3, 32, tzinfo=dt.timezone.utc)
SCREEN = """Settings  Status  Config  Usage  Stats
Current session
████▌ 9% used
Resets 3:29pm (Australia/Perth)
Current week (all models)
████████▌ 17% used
Resets Oct 10 at 5:59am (Australia/Perth)
Esc to cancel
"""


class UsageTests(unittest.TestCase):
    def test_observed_real_screen(self):
        quota = module.parse_screen(SCREEN, NOW)
        self.assertEqual(quota["five_hour"]["used_percentage"], 9)
        self.assertEqual(quota["seven_day"]["used_percentage"], 17)
        reset = dt.datetime.fromtimestamp(quota["five_hour"]["reset_at"], dt.timezone.utc)
        self.assertEqual(reset, dt.datetime(2026, 10, 6, 7, 29, tzinfo=dt.timezone.utc))
        self.assertEqual(set(quota), {"fetched_at", "five_hour", "seven_day"})

    def test_pending_and_error_screens_do_not_become_fresh(self):
        for suffix in ["Refreshing…", "Failed to load usage", "Please sign in"]:
            self.assertIsNone(module.parse_screen(SCREEN + suffix, NOW))

    def test_missing_duplicate_or_other_model_window_is_rejected(self):
        for text in [SCREEN.replace("17% used", "unavailable"),
                     SCREEN + "\nCurrent session",
                     SCREEN.replace("Current week (all models)", "Current week (Sonnet)")]:
            self.assertIsNone(module.parse_screen(text, NOW))

    def test_percentage_bounds(self):
        for value in ["101", "-1", "NaN"]:
            self.assertIsNone(module.parse_screen(SCREEN.replace("9% used", value + "% used"), NOW))
        self.assertEqual(module.parse_screen(SCREEN.replace("9% used", "0% used"), NOW)
                         ["five_hour"]["used_percentage"], 0)

    def test_bad_reset_is_rejected(self):
        for reset in ["Resets tomorrow", "Resets 13:59pm (Australia/Perth)",
                      "Resets 3:29pm (Unknown/Zone)", "Resets Oct 31 at 5am (Australia/Perth)"]:
            self.assertIsNone(module.parse_screen(SCREEN.replace(
                "Resets 3:29pm (Australia/Perth)", reset), NOW))

    def test_midnight_and_year_rollover(self):
        now = dt.datetime(2026, 12, 31, 15, 30, tzinfo=dt.timezone.utc)
        reset = module.parse_reset("Resets 1am (Australia/Perth)", now)
        self.assertEqual(dt.datetime.fromtimestamp(reset, dt.timezone.utc).day, 31)
        reset = module.parse_reset("Resets Jan 2 at 5am (Australia/Perth)", now)
        self.assertEqual(dt.datetime.fromtimestamp(reset, dt.timezone.utc).year, 2027)

    def test_terminal_overwrite_uses_final_screen(self):
        import pyte
        screen = pyte.Screen(140, 45)
        stream = pyte.Stream(screen)
        stream.feed("\x1b[2J\x1b[H" + SCREEN.replace("\n", "\r\n"))
        stream.feed("\x1b[3;1H\x1b[2K████▌ 11% used")
        quota = module.parse_screen("\n".join(screen.display), NOW)
        self.assertEqual(quota["five_hour"]["used_percentage"], 11)

    def fake_cli(self, body):
        directory = tempfile.TemporaryDirectory()
        path = Path(directory.name) / "claude"
        path.write_text("#!/usr/bin/env python3\n" + textwrap.dedent(body))
        path.chmod(0o700)
        return directory, str(path)

    def test_no_completed_refresh_is_rejected_and_child_exits(self):
        directory, command = self.fake_cli("""
            import time
            print("Current session", flush=True)
            time.sleep(30)
        """)
        with directory:
            self.assertIsNone(module.collect_usage(command, directory.name, timeout=0.5))

    def test_initial_cached_screen_without_refresh_is_rejected(self):
        # Use valid relative reset times for the runtime clock.
        now = dt.datetime.now(dt.timezone.utc)
        from zoneinfo import ZoneInfo
        local = now.astimezone(ZoneInfo("Australia/Perth"))
        session = local + dt.timedelta(hours=2)
        week = local + dt.timedelta(days=2)
        text = SCREEN.replace("3:29pm", session.strftime("%I:%M%p").lower())
        text = text.replace("Oct 10 at 5:59am",
            week.strftime("%b %d at %I:%M%p").replace("AM", "am").replace("PM", "pm"))
        directory, command = self.fake_cli(
            "import time\nprint(" + repr(text) + ", flush=True)\ntime.sleep(30)\n")
        with directory:
            self.assertIsNone(module.collect_usage(command, directory.name, timeout=0.5))

    def test_completed_refresh_uses_new_screen_and_reaps_child(self):
        import time
        from zoneinfo import ZoneInfo
        local = dt.datetime.now(dt.timezone.utc).astimezone(ZoneInfo("Australia/Perth"))
        text = SCREEN.replace("3:29pm", (local + dt.timedelta(hours=2)).strftime("%I:%M%p").lower())
        text = text.replace("Oct 10 at 5:59am",
            (local + dt.timedelta(days=2)).strftime("%b %d at %I:%M%p").lower().capitalize())
        # Month capitalization above must preserve the lowercase am/pm.
        body = "import os,time,sys\nassert sys.argv[-1] == '/usage'\n"
        body += "open('pid', 'w').write(str(os.getpid()))\n"
        body += "print('\\x1b[2J\\x1b[H' + " + repr(text + "Refreshing…") + ", flush=True)\n"
        body += "time.sleep(0.25)\n"
        body += "print('\\x1b[2J\\x1b[H' + " + repr(text.replace("9% used", "11% used")) + ", flush=True)\n"
        body += "time.sleep(30)\n"
        directory, command = self.fake_cli(body)
        with directory:
            start = time.monotonic()
            result = module.collect_usage(command, directory.name, timeout=4)
            self.assertIsNotNone(result)
            self.assertEqual(result["five_hour"]["used_percentage"], 11)
            self.assertGreater(time.monotonic() - start, 1)
            child = int((Path(directory.name) / "pid").read_text())
            with self.assertRaises(ProcessLookupError):
                os.kill(child, 0)


if __name__ == "__main__":
    unittest.main()
