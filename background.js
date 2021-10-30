const { runtime } = chrome;
const timeMultiplier = 10; // set to 1 for testing
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
      }, 5 * 360000 * timeMultiplier);
    }
}

function onMessage({ hostname, getHostname }, { tab }, sendResponse) {
  if (hostname) {
    setPermittedFlags(hostname, tab.id);
  } else if (getHostname) {
    // using separate if condition to allow for expanding possible messages
    if (tab.id === permittedTabId) sendResponse(permittedHostname);
  }
}

runtime.onMessage.addListener(onMessage);
