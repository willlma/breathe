const form = document.querySelector('form');
const footer = document.querySelector('#breathe-footer');
const continueButton = footer.querySelector('button');

function showContinueButton() {
  continueButton.style.removeProperty('display');
  footer.replaceChildren(continueButton);
}

continueButton.addEventListener('click', () => {
  footer.replaceChildren('Dopamine rush incoming...');
  permit();
});

form.addEventListener('submit', (evt) => {
  evt.preventDefault();

  document.querySelector('#rope-circle-gif-container img').style.opacity = 1;

  let timeoutId;
  runtime
    .sendMessage({ duration: parseInt(form.querySelector('input').value) })
    .then((shouldSkipWait) => {
      if (document.hasFocus()) {
        const timeout = shouldSkipWait ? 0 : 25000;
        timeoutId = setTimeout(showContinueButton, timeout * timeMultiplier);
      }
    });
  document.querySelector('#breathe-focus-message').style.removeProperty('visibility');
  const submit = form.querySelector('button');
  submit.textContent = 'Update';
  submit.disabled = true;
  form.querySelector('input').addEventListener('input', () => {
    submit.disabled = false;
  });

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
