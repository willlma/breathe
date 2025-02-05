const { alarms, runtime, storage, tabs } = browser;
// don't try to make shared files with constants in it, Chrome and Firefox do imports differently and it's a pain
const timeMultiplier = 1; // set to 0.1 for dev, keep in sync with permit.js

const isBefore7am = (date = new Date()) => date.getHours() < 7;

const isCheatDay = async () => {
  if (isBefore7am()) return false;

  const { cheatDay } = await storage.sync.get('cheatDay');
  return parseInt(cheatDay) === new Date().getDay();
};

const closeTabAndReset = async () => {
  const { permittedTabId } = await storage.session.get('permittedTabId');
  if (!(await isCheatDay())) {
    const shouldClose = await tabs.sendMessage(permittedTabId, { close: true });
    if (shouldClose) tabs.remove(permittedTabId);
  }

  storage.session.set({
    permittedDomain: null,
    permittedTabId: null,
  });
};

const redirect = (tabId, url) => {
  try {
    tabs.update(tabId, { url, loadReplace: true });
  } catch {
    // No support for loadReplace on Android
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/update
    tabs.update(tabId, { url });
  }
};

const permitAndNavigate = async (tabId) => {
  const { domainToCheck: domain } = await storage.session.get('domainToCheck');
  const [alarm, { duration = 10, redirectionURL }, _] = await Promise.all([
    alarms.get('reset-alarm'),
    storage.session.get(['duration', 'redirectionURL']),
    storage.session.set({
      domainToCheck: null,
      permittedDomain: domain,
      permittedTabId: tabId,
    }),
  ]);

  // if there's no existing procrastinating tab open, create a new alarm
  if (!alarm) {
    await alarms.create('reset-alarm', { delayInMinutes: duration * timeMultiplier });
  }

  redirect(tabId, redirectionURL);
};

const shouldSkipWait = (duration) => {
  const date = new Date();

  // only skip the wait if you'll procrastinate less than 5 minutes (and not between midnight and 7)
  if (duration > 5 || isBefore7am(date)) return false;

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
      return closeTabAndReset();
    default:
      return;
  }
});

runtime.onMessage.addListener(async ({ domainToCheck, duration, permit }, { tab }) => {
  if (duration) {
    storage.session.set({ duration });
    // skip the wait one time if the duration is under 5 mins
    return shouldSkipWait(duration);

    return result;
  } else if (permit) {
    // await to ensure URL is permitted before redirecting to an otherwise blocked page
    await permitAndNavigate(tab.id);
  } else if (domainToCheck) {
    const { permittedDomain, permittedTabId } = await storage.session.get([
      'permittedDomain',
      'permittedTabId',
    ]);

    if (tab.id === permittedTabId && permittedDomain === domainToCheck) return;

    const fileName = (await isCheatDay()) ? 'cheat-day' : 'form';

    storage.session.set({ redirectionURL: tab.url });
    const url = runtime.getURL(`src/${fileName}.html`);
    redirect(permittedTabId, url);
    storage.session.set({ domainToCheck });
  }
});

runtime.onInstalled.addListener(async ({ reason }) => {
  const settings = await storage.sync.get();

  const defaultSettings = {
    blacklist: 'reddit.com',
    whitelist: 'reddit.com/r/*/comments',
    waitDurationSeconds: 25,
  };

  if (reason === 'install') {
    storage.local.set({ lastSkippedDay: null });
  }

  if (['install', 'update'].includes(reason)) {
    storage.sync.set({ ...defaultSettings, ...settings });
  }
});
