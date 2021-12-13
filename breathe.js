// import { sendMessage } from './services; (we're not in a module env)
const timeMultiplier = 10; // set to 1 for testing

const div = document.createElement('div');
div.id = 'gotta-breathe';
div.append('Focus on something 20 feet away for 20 seconds.');

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
  setTimeout(releaseTheDopamine, 200 * timeMultiplier);
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

  function showContinueButton() {
    div.append(button);
  }

  let timeoutId;
  if (document.hasFocus()) {
    timeoutId = setTimeout(showContinueButton, 2500 * timeMultiplier);
    console.log('breathe', timeoutId);
  }

  // prevent user from checkout out another tab/app while waiting
  const resetTimeout = () => {
    timeoutId = setTimeout(showContinueButton, 2000 * timeMultiplier);
    document.removeEventListener('focus', resetTimeout);
    console.log('breathe reset', timeoutId);
  }


  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') clearTimeout(timeoutId);
    else console.log('breathe visible') || resetTimeout();
  });

  document.addEventListener('blur', () => {
    console.log('breathe blur', timeoutId);
    clearTimeout(timeoutId);
    document.addEventListener('focus', resetTimeout);
  });
});
