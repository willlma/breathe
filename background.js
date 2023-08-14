const { alarms, runtime, storage } = browser;
// fake import. Replace with import { timeMultiplier } from './constants' when modules are set up
const { timeMultiplier } = constants;

const resetPermissions = () =>
  storage.session.set({
    permittedHostname: null,
    permittedTabId: null,
  });

const setPermittedFlags = (hostname, tabId) => {
  storage.session.set({
    permittedHostname: hostname,
    permittedTabId: tabId,
  });

  return Promise.all([alarms.get('reset-alarm'), storage.session.get('duration')]).then(
    ([alarm, { duration }]) => {
      // if there's already another procrastinating tab open. Don't extend it.
      if (!alarm) {
        alarms.create('reset-alarm', { delayInMinutes: duration * timeMultiplier });
        alarms.onAlarm.addListener(resetPermissions);
      }

      return duration;
    }
  );
};

const shouldSkipWait = (duration) => {
  const date = new Date();

  // only skip the wait if you'll procrastinate less than 5 minutes (and not after midnight)
  if (duration > 5 || date.getHours() < 7) return false;

  return storage.local.get('lastSkippedDay').then(({ lastSkippedDay }) => {
    const day = date.getDay();
    if (lastSkippedDay && lastSkippedDay === day) return false;

    storage.local.set({ lastSkippedDay: day });
    return true;
  });
};

runtime.onMessage.addListener(({ duration, hostname, getHostname }, { tab }) => {
  if (duration) {
    storage.session.set({ duration });
    // skip the wait one time if the duration is under 5 mins
    return shouldSkipWait(duration);
  } else if (hostname) {
    return setPermittedFlags(hostname, tab.id);
  } else if (getHostname) {
    // using separate if condition to allow for expanding possible messages
    return storage.session
      .get(['permittedHostname', 'permittedTabId'])
      .then(
        ({ permittedHostname, permittedTabId }) => tab.id === permittedTabId && permittedHostname
      );
  }
});

storage.local.set({ lastSkippedDay: null });
