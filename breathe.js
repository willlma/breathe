const div = document.createElement('div');
const background = document.createElement('div');
div.id = 'gotta-breathe';
div.style.position = 'absolute';
background.style.position = 'absolute';
div.style.width = '100vw';
background.style.width = '100%';
div.style.height = '100vh';
background.style.height = '100%';
div.style.background = 'rgb(178, 216, 255)';
// background.style.background = 'rgb(178, 216, 255)';
background.style.background = '#111';
div.style.top = 0;
background.style.top = 0;
div.style.zIndex = 9999999999999;
background.style.zIndex = 9999999999998;
div.style.display = 'flex';
div.style.flexDirection = 'column';
div.style.justifyContent = 'center';
div.style.alignItems = 'center';

const img = document.createElement('img');
img.src = chrome.runtime.getURL('assets/breathe.gif');
div.appendChild(img);

let intervalId;
const appendElements = () => {
  const { body } = document;
  console.log('body', body);
  if (!body) return;

  body.appendChild(background);
  body.appendChild(div);
  if (intervalId) clearInterval(intervalId);
};

document.addEventListener('DOMContentLoaded', appendElements);
intervalId = setInterval(appendElements, 20);

const onContinue = () => setTimeout(() => {
  background.remove();
  div.remove();
}, 10000);

const afterTimeout = () => {
  const button = document.createElement('button');
  button.textContent = 'Continue';
  button.addEventListener('click', onContinue);
  div.appendChild(button);
};

let timeoutId = setTimeout(afterTimeout, 40000);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') clearTimeout(timeoutId);
  else timeoutId = setTimeout(afterTimeout, 35000);
});
