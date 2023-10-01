const { alarms, runtime, storage, tabs } = browser;
// don't try to make shared files with constants in it, Chrome and Firefox do imports differently and it's a pain
const timeMultiplier = 0.1; // set to 0.1 for dev, keep in sync with breathe.js

const resetPermissions = async () => {
  const { permittedTabId } = await storage.get('permittedTabId');
  tabs.remove(permittedTabId);

  storage.session.set({
    permittedDomain: null,
    permittedTabId: null,
  });
};

const setPermittedFlags = (domain, tabId) => {
  storage.session.set({
    permittedDomain: domain,
    permittedTabId: tabId,
  });

  return Promise.all([alarms.get('reset-alarm'), storage.session.get('duration')]).then(
    ([alarm, { duration = 10 }]) => {
      // if there's already another procrastinating tab open. Don't extend it.
      if (!alarm) {
        alarms.create('reset-alarm', { delayInMinutes: duration * timeMultiplier });
      }

      return duration;
    }
  );
};

const shouldSkipWait = (duration) => {
  const date = new Date();

  // only skip the wait if you'll procrastinate less than 5 minutes (and not between midnight and 7)
  if (duration > 5 || date.getHours() < 7) return false;

  return storage.local.get('lastSkippedDay').then(({ lastSkippedDay }) => {
    const day = date.getDay();
    if (lastSkippedDay && lastSkippedDay === day) return false;

    storage.local.set({ lastSkippedDay: day });
    return true;
  });
};

alarms.onAlarm.addListener(({ name }) => {
  switch (name) {
    case 'reset-alarm':
      return resetPermissions();
    default:
      return;
  }
});

runtime.onMessage.addListener(async ({ duration, domain, getDomain }, { tab }) => {
  if (duration) {
    storage.session.set({ duration });
    // skip the wait one time if the duration is under 5 mins
    return shouldSkipWait(duration);
  } else if (domain) {
    const duration = await setPermittedFlags(domain, tab.id);
  } else if (getDomain) {
    // using separate if condition to allow for expanding possible messages
    return storage.session
      .get(['permittedDomain', 'permittedTabId'])
      .then(({ permittedDomain, permittedTabId }) => tab.id === permittedTabId && permittedDomain);
  }
});

storage.local.set({ lastSkippedDay: null });
storage.sync.set({
  // keep these values in sync with settings/index.html
  blacklist: 'reddit.com',
  whitelist: 'reddit.com/r/*/comments',
});
