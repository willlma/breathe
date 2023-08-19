const { alarms, runtime, storage } = browser;
// fake import. Replace with import { timeMultiplier } from './constants' when modules are set up
const { timeMultiplier } = constants;

const resetPermissions = () =>
  storage.session.set({
    permittedDomain: null,
    permittedTabId: null,
  });

const setPermittedFlags = (domain, tabId) => {
  console.log('domain', domain);
  storage.session.set({
    permittedDomain: domain,
    permittedTabId: tabId,
  });

  return Promise.all([alarms.get('reset-alarm'), storage.session.get('duration')]).then(
    ([alarm, { duration = 25 }]) => {
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

runtime.onMessage.addListener(({ duration, domain, getDomain }, { tab }) => {
  if (duration) {
    storage.session.set({ duration });
    // skip the wait one time if the duration is under 5 mins
    return shouldSkipWait(duration);
  } else if (domain) {
    return setPermittedFlags(domain, tab.id);
  } else if (getDomain) {
    // using separate if condition to allow for expanding possible messages
    return storage.session
      .get(['permittedDomain', 'permittedTabId'])
      .then(({ permittedDomain, permittedTabId }) => tab.id === permittedTabId && permittedDomain);
  }
});

storage.local.set({ lastSkippedDay: null });
