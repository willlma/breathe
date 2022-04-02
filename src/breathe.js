const { runtime, storage } = browser;
// fake import. Replace with import { timeMultiplier } from './constants' when modules are set up
const { timeMultiplier } = constants;
const messageTimeout = 2000;

const load = (fileName) =>
  fetch(runtime.getURL(fileName))
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

const breathe = () =>
  load('/breathe.html').then((div) => {
    console.log('breathe');
    const form = div.querySelector('form');
    const footer = div.querySelector('#breathe-footer');
    const continueButton = footer.querySelector('button');
    div.querySelector('img').src = runtime.getURL('/assets/breathe.gif');

    continueButton.addEventListener('click', () => {
      footer.replaceChildren('Dopamine rush incoming...');
      setTimeout(
        () =>
          sendDomain().then((duration) => {
            div.remove();
            // starts everything over after the set duration, since the background script only triggers on pageload
            const msInMin = 6e4;
            setTimeout(breathe, duration * msInMin * timeMultiplier);
          }),
        messageTimeout * timeMultiplier
      );
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
  load('/cheat-day.html').then((div) => {
    sendDomain();
    setTimeout(() => div.remove(), messageTimeout * timeMultiplier);
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

const listHasMatch = (list) =>
  list
    ?.split('\n')
    .find((site) =>
      location.href.match(
        new RegExp(site.replace(/[-\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '\\w+'))
      )
    );

storage.sync.get(['blacklist', 'whitelist', 'cheatDay']).then(
  ({ blacklist, whitelist, cheatDay }) => {
    if (listHasMatch(blacklist) && !listHasMatch(whitelist)) {
      runtime.sendMessage({ getDomain: true }).then((domain) => {
        console.log('domain', domain);
        console.log('getDomain()', getDomain());
        if (domain === getDomain()) return;
        console.log('cheatDay', cheatDay);
        console.log('new Date.getDay()', new Date().getDay());
        (cheatDay === new Date().getDay() ? cheat : breathe)().then(renderElement);
      });
    }
  },
  () => console.error('failed to get sync storage')
);