const main = () => {
  const { alarms, runtime, storage } = browser;
  const timeMultiplier = 10; // set to 1 for dev, keep in sync with breathe.js

  const resetPermissions = () => storage.local.set({
    permittedHostname: null,
    permittedTabId: null,
  });

  resetPermissions();

  function setPermittedFlags(hostname, tabId) {
      storage.local.set({
        permittedHostname: hostname,
        permittedTabId: tabId,
      });

      alarms.get('reset-alarm').then(alarm => {
        if (!alarm) {
          alarms.create('reset-alarm', { delayInMinutes: 0.5 * timeMultiplier });
          alarms.onAlarm.addListener(resetPermissions);
        }
      });
  }

  runtime.onMessage.addListener(({ hostname, getHostname }, { tab }) => {
    if (hostname) {
      setPermittedFlags(hostname, tab.id);
    } else if (getHostname) {
      // using separate if condition to allow for expanding possible messages
      return storage.local.get(['permittedHostname', 'permittedTabId']).then(
        ({ permittedHostname, permittedTabId }) => tab.id === permittedTabId && permittedHostname
      );
    }
  });
}

if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
  // Chrome
  import('./browser-polyfill.js').then(main);
} else {
  main();
}
