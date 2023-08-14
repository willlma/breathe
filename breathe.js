const { runtime, storage } = browser;
// fake import. Replace with import { timeMultiplier } from './constants' when modules are set up
const { timeMultiplier } = constants;

function breathe() {
  fetch(runtime.getURL('/breathe.html'))
    .then((res) => res.text())
    .then((html) => {
      const div = document.createElement('div');
      div.id = 'gotta-breathe';
      div.innerHTML = html;
      const form = div.querySelector('form');
      const footer = div.querySelector('#breathe-footer');
      const continueButton = footer.querySelector('button');
      div.querySelector('img').src = runtime.getURL('/assets/breathe.gif');

      continueButton.addEventListener('click', () => {
        footer.replaceChildren('Dopamine rush incoming...');
        setTimeout(() => {
          runtime.sendMessage({ hostname: location.hostname }).then(
            (duration) => {
              div.remove();
              // starts everything over after the set duration, since the background script only triggers on pageload
              const msInMin = 6e4;
              setTimeout(breathe, duration * msInMin * timeMultiplier);
            },
            (err) => console.error(`Failed to temporarily whitelist hostname: ${err}`)
          );
        }, 2000 * timeMultiplier);
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
          footer.replaceChildren('Welcome back 😉\nRestarting countdown');
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

      function appendElements() {
        const { body } = document;
        if (!body) return;

        body.append(div);
        if (intervalId) clearInterval(intervalId);
      }
      document.addEventListener('DOMContentLoaded', appendElements);
      intervalId = setInterval(appendElements, 20);
    });
}

const listHasMatch = (list) =>
  list
    ?.split('\n')
    .find((site) =>
      location.href.match(
        new RegExp(site.replace(/[-\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '\\w+'))
      )
    );

storage.sync.get(['blacklist', 'whitelist']).then(
  ({ blacklist, whitelist }) => {
    if (listHasMatch(blacklist) && !listHasMatch(whitelist)) {
      runtime.sendMessage({ getHostname: true }).then((hostname) => {
        if (hostname !== location.hostname) breathe();
      });
    }
  },
  () => console.error('failed to get sync storage')
);
