// import { sendMessage } from './services; (we're not in a module env)
const timeMultiplier = 10; // set to 1 for testing

const div = document.createElement('div');
div.id = 'gotta-breathe';

const img = document.createElement('img');
img.src = chrome.runtime.getURL('assets/breathe.gif');
div.append(img);

function releaseTheDopamine() {
  sendMessage({ hostname: location.hostname }).then(() => {
    div.remove();
  }, () => console.log('failed to temporarily whitelist hostname'));
}

function onContinue() {
  button.remove();
  div.append('Dopamine rush incoming...');
  setTimeout(releaseTheDopamine, 1000 * timeMultiplier);
}

const button = document.createElement('button');
button.textContent = 'Continue';
button.addEventListener('click', onContinue);

let intervalId;
const appendElements = () => {
  const { body } = document;
  if (!body) return;

  body.append(div);
  if (intervalId) clearInterval(intervalId);
};

sendMessage({ getHostname: true }).then((hostname) => {
  if (hostname === location.hostname) return;

  document.addEventListener('DOMContentLoaded', appendElements);
  intervalId = setInterval(appendElements, 20);

  function afterTimeout() {
    div.append(button);
  }

  let timeoutId = setTimeout(afterTimeout, 4500 * timeMultiplier);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') clearTimeout(timeoutId);
    else timeoutId = setTimeout(afterTimeout, 4000 * timeMultiplier);
  });
});
