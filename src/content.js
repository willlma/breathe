const { runtime, storage } = browser;

const listHasMatch = (list) =>
  list
    ?.split('\n')
    .find((site) =>
      location.href.match(
        new RegExp(site.replace(/[-\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '\\w+')),
      ),
    );

// removes the (first portion of the) subdomain if there is one.
// This can't be perfect since the subdomain and tld can both contain several segments
// (eg: a.b.domain.com and a.domain.co.uk become b.domain.com and domain.co.uk)
const getDomain = () => {
  const dot = '.';
  const { hostname } = location;
  const split = hostname.split(dot);
  if (split.length <= 2) return hostname;

  split.shift();
  return split.join(dot);
};

const isSiteBlocked = () =>
  storage.sync.get(['blacklist', 'whitelist']).then(
    ({ blacklist, whitelist }) => listHasMatch(blacklist) && !listHasMatch(whitelist),
    () => console.error('failed to get sync storage'),
  );

const checkDomain = () => {
  isSiteBlocked().then((bool) => bool && runtime.sendMessage({ domainToCheck: getDomain() }));
};

// Content scripts run in an isolated JS world, so they can't intercept
// history.pushState/replaceState calls made by SPAs (e.g. React Router).
// We inject page-script.js into the page's own JS context to patch those
// methods. It must be loaded as a file (not inline) to bypass page CSP.
const script = document.createElement('script');
script.src = runtime.getURL('src/page-script.js');
document.documentElement.appendChild(script);
script.remove();

// page-script.js dispatches this event when pushState/replaceState is called
window.addEventListener('breathe:locationchange', checkDomain);
window.addEventListener('popstate', checkDomain);
checkDomain();

runtime.onMessage.addListener(({ close }) => {
  if (close) return isSiteBlocked();
});
