console.log('document.referrer', document.referrer);
const div = document.createElement('div');
div.id = 'gotta-breathe';

const img = document.createElement('img');
img.src = chrome.runtime.getURL('assets/breathe.gif');
div.append(img);

function onContinue() {
  button.remove();
  div.append('Dopamine rush incoming...');
  setTimeout(() => div.remove(), 10000);
}

const button = document.createElement('button');
button.textContent = 'Continue';
button.addEventListener('click', onContinue);

let intervalId;
const appendElements = () => {
  const { body } = document;
  console.log('body', body);
  if (!body) return;

  body.append(div);
  if (intervalId) clearInterval(intervalId);
};

const start = Date.now();
function onLoad() {
  const loadTime = Date.now() - start;
  console.log('loadTime', loadTime);
  if (loadTime < 800) div.remove();
  else appendElements();
}

document.addEventListener('DOMContentLoaded', onLoad);
intervalId = setInterval(appendElements, 20);

function afterTimeout() {
  div.append(button);
}

let timeoutId = setTimeout(afterTimeout, 40000);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') clearTimeout(timeoutId);
  else timeoutId = setTimeout(afterTimeout, 35000);
});
