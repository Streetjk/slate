export function createLiveSessionEpochController() {
  let activeEpoch = 0;
  let currentSession;

  return {
    get activeEpoch() {
      return activeEpoch;
    },
    get currentSession() {
      return currentSession;
    },
    begin(epoch) {
      if (!Number.isInteger(epoch) || epoch <= activeEpoch) {
        throw new Error('BRIDGE_PROTOCOL_REJECTED');
      }
      activeEpoch = epoch;
      currentSession = undefined;
    },
    isCurrent(epoch, candidate) {
      return candidate !== undefined && activeEpoch === epoch && currentSession === candidate;
    },
    install(epoch, candidate) {
      if (activeEpoch !== epoch || currentSession !== undefined) return false;
      currentSession = candidate;
      return true;
    },
    clear(epoch, candidate) {
      if (!this.isCurrent(epoch, candidate)) return false;
      currentSession = undefined;
      return true;
    },
    invalidate() {
      const previousEpoch = activeEpoch;
      activeEpoch += 1;
      currentSession = undefined;
      return previousEpoch;
    },
  };
}
