const { runtime, storage } = browser;
// don't try to make shared files with constants in it, Chrome and Firefox do imports differently and it's a pain
const timeMultiplier = 0.1; // set to 0.1 for dev, keep in sync with background.js
const messageTimeout = 2000;

const load = (fileName) =>
  fetch(runtime.getURL(`/src/${fileName}`))
    .then((res) => res.text())
    .then((html) => {
      const div = document.createElement('div');
      div.id = 'gotta-breathe';
      div.innerHTML = html;
      return div;
    });

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

const sendDomain = () =>
  runtime
    .sendMessage({ domain: getDomain() })
    .catch((err) => console.error(`Failed to temporarily whitelist domain: ${err}`));

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
    const form = div.querySelector('form');
    const footer = div.querySelector('#breathe-footer');
    const continueButton = footer.querySelector('button');
    div.querySelector('img').src = runtime.getURL('/src/assets/circle-rope.gif');

    continueButton.addEventListener('click', () => {
      // console.log('on continue click');
      footer.replaceChildren('Dopamine rush incoming...');
      setTimeout(() => sendDomain().then(() => div.remove()), messageTimeout * timeMultiplier);
    });

    function showContinueButton() {
      continueButton.style.removeProperty('display');
      footer.replaceChildren(continueButton);
    }

    form.addEventListener('submit', (evt) => {
      evt.preventDefault();

      let timeoutId;
      runtime
        .sendMessage({ duration: parseInt(form.querySelector('input').value) })
        .then((shouldSkipWait) => {
          if (document.hasFocus()) {
            const timeout = shouldSkipWait ? 0 : 25000;
            timeoutId = setTimeout(showContinueButton, timeout * timeMultiplier);
          }
        });
      div.querySelector('#breathe-focus-message').style.removeProperty('visibility');
      form.querySelector('button').textContent = 'Update';

      // prevent user from checking out another tab/app while waiting
      const resetTimeout = () => {
        timeoutId = setTimeout(showContinueButton, 20000 * timeMultiplier);
        footer.replaceChildren('Welcome back 😉 Restarting countdown');
        document.removeEventListener('focus', resetTimeout);
      };

      // TODO: Switching apps from Chrome not resetting counter
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') clearTimeout(timeoutId);
        else resetTimeout();
      });

      document.addEventListener('blur', () => {
        clearTimeout(timeoutId);
        document.addEventListener('focus', resetTimeout);
      });
    });

    return div;
  });

const cheat = () =>
  load('cheat-day.html').then((div) => {
    sendDomain();
    setTimeout(() => div.remove(), messageTimeout * timeMultiplier);
    return div;
  });

const listHasMatch = (list) =>
  list
    ?.split('\n')
    .find((site) =>
      location.href.match(
        new RegExp(site.replace(/[-\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '\\w+')),
      ),
    );

const main = () => {
  storage.sync.get(['blacklist', 'whitelist', 'cheatDay']).then(
    ({ blacklist, whitelist, cheatDay }) => {
      if (listHasMatch(blacklist) && !listHasMatch(whitelist)) {
        runtime.sendMessage({ getDomain: true }).then((domain) => {
          if (domain === getDomain()) return;
          (parseInt(cheatDay) === new Date().getDay() ? cheat : breathe)().then(renderElement);
        });
      }
    },
    () => console.error('failed to get sync storage'),
  );
};

window.addEventListener('popstate', main);
main();
