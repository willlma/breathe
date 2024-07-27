const { runtime, storage } = browser;

const load = (fileName) =>
  fetch(runtime.getURL(`/src/${fileName}`))
    .then((res) => res.text())
    .then((html) => {
      const div = document.createElement('div');
      div.id = 'gotta-breathe';
      div.innerHTML = html;
      return div;
    });

const renderElement = (div) => {
  let intervalId;

  function appendElements() {
    const { body } = document;
    if (!body) return;

    body.append(div);
    if (intervalId) clearInterval(intervalId);
  }

  document.addEventListener('DOMContentLoaded', appendElements);
  intervalId = setInterval(appendElements, 20);
};

const breathe = () =>
  load('breathe.html').then((div) => {
    return div;
  });

// const cheat = () =>
//   load('cheat-day.html').then((div) => {
//     sendDomain();
//     setTimeout(() => div.remove(), messageTimeout * timeMultiplier);
//     return div;
//   });

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

const main = () => {
  storage.sync.get(['blacklist', 'whitelist']).then(
    ({ blacklist, whitelist }) => {
      if (listHasMatch(blacklist) && !listHasMatch(whitelist)) {
        runtime.sendMessage({ domainToCheck: getDomain() });
      }
    },
    () => console.error('failed to get sync storage'),
  );
};

window.addEventListener('popstate', main);
main();
