const { storage } = browser;

const form = document.querySelector('form');
const footer = document.querySelector('#breathe-footer');
const continueButton = footer.querySelector('button');
let timeoutId;

const small = document.querySelector('form small');
storage.local.get('lastSkippedDay').then(({ lastSkippedDay }) => {
  const today = new Date().getDay();
  if (lastSkippedDay === today) {
    small.style.display = 'none';
  }
});

function showContinueButton() {
  continueButton.style.removeProperty('display');
  footer.replaceChildren(continueButton);
}

function onContinue() {
  footer.replaceChildren('Dopamine rush incoming...');
  permit();
}

continueButton.addEventListener('click', onContinue);

function setShowContinueButtonTimeout() {
  storage.sync.get('waitDurationSeconds').then(({ waitDurationSeconds }) => {
    timeoutId = setTimeout(showContinueButton, waitDurationSeconds * 1000 * timeMultiplier);
  });
}
const getSubmit = () => form.querySelector('button');

function enableSubmit() {
  const submit = getSubmit();
  submit.style.visibility = 'visible';
  submit.disabled = false;
}

function disableSubmit() {
  const submit = getSubmit();
  submit.disabled = true;
}

function onSubmit() {
  runtime
    .sendMessage({ duration: parseInt(form.querySelector('input').value) })
    .then((shouldSkipWait) => {
      if (document.hasFocus()) {
        if (shouldSkipWait) {
          onContinue();
        } else {
          document.querySelector('#breathe-focus-message').style.removeProperty('visibility');
          document.querySelector('#rope-circle-gif-container img').style.opacity = 1;
          setShowContinueButtonTimeout();
        }
        disableSubmit();
      }
    });
}

onSubmit();

form.querySelector('input').addEventListener('input', enableSubmit);

// prevent user from checking out another tab/app while waiting
const resetTimeout = () => {
  setShowContinueButtonTimeout();
  footer.replaceChildren('Welcome back 😉 Restarting countdown');
  document.removeEventListener('focus', resetTimeout);
};

// TODO: Switching apps from Chrome not resetting counter
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') clearTimeout(timeoutId);
  else resetTimeout();
});

document.addEventListener('blur', () => {
  if (timeoutId) clearTimeout(timeoutId);
  document.addEventListener('focus', resetTimeout);
});

form.addEventListener('submit', (evt) => {
  evt.preventDefault();
  onSubmit();
});
