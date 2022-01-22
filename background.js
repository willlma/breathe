const { runtime, storage } = browser;
const timeMultiplier = 10; // set to 1 for dev, keep in sync with breathe.js
let permittedHostname;
let permittedTabId;
let timeoutId;

function setPermittedFlags(hostname, tabId) {
    permittedHostname = hostname;
    permittedTabId = tabId;

    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        permittedHostname = null;
        permittedTabId = null;
        timeoutId = null;
      }, 5 * 6000 * timeMultiplier);
    }
}

runtime.onMessage.addListener(({ hostname, getHostname }, { tab }) => {
  console.log({ hostname, getHostname });
  if (hostname) {
    setPermittedFlags(hostname, tab.id);
  } else if (getHostname) {
    // using separate if condition to allow for expanding possible messages
    if (tab.id === permittedTabId) return permittedHostname;
  }
});
