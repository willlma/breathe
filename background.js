const { runtime } = chrome;
let permittedHostname;
let permittedTabId;

function onMessage({ hostname, getHostname }, { tab }, sendResponse) {
  if (hostname) {
    permittedHostname = hostname;
    permittedTabId = tab.id;
  } else if (getHostname) {
    // using separate if condition to allow for expanding possible messages
    if (tab.id === permittedTabId) sendResponse(permittedHostname);
  }
}

runtime.onMessage.addListener(onMessage);

setTimeout(() => {
  permittedHostname = null;
  permittedTabId = null;
}, 5 * 3600000);
