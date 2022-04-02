const { runtime, storage } = browser;
const timeMultiplier = 10; // set to 1 for testing

function breathe(html) {
  const div = document.createElement('div');
  div.id = 'gotta-breathe';
  div.innerHTML = html;
  const form = div.querySelector('form');
  const footer = div.querySelector('#breathe-footer');
  const button = footer.querySelector('button');
  div.querySelector('img').src = runtime.getURL('/assets/breathe.gif');

  button.addEventListener('click', () => {
    footer.replaceChildren('Dopamine rush incoming...');
    setTimeout(() => {
      runtime.sendMessage({ hostname: location.hostname }).then(
        () => div.remove(),
        (err) => console.error(`Failed to temporarily whitelist hostname: ${err}`)
      );
    }, 200 * timeMultiplier);
  });
  function showContinueButton() {
    button.style.removeProperty('display');
    footer.replaceChildren(button);
  }

  form.addEventListener('submit', (evt) => {
    evt.preventDefault();

    runtime.sendMessage({ duration: parseInt(form.querySelector('input').value) });
    console.log(
      'div.querySelector(#breathe-focus-message).style',
      div.querySelector('#breathe-focus-message').style
    );
    div.querySelector('#breathe-focus-message').style.removeProperty('visibility');
    form.querySelector('button').textContent = 'Update';
    let timeoutId;
    if (document.hasFocus()) {
      timeoutId = setTimeout(showContinueButton, 3000 * timeMultiplier);
    }

    // prevent user from checking out another tab/app while waiting
    const resetTimeout = () => {
      timeoutId = setTimeout(showContinueButton, 2500 * timeMultiplier);
      footer.replaceChildren('Welcome back 😉\nRestarting countdown');
      document.removeEventListener('focus', resetTimeout);
    };

    // TODO: Switching apps from Chrome not resetting counter
    document.addEventListener('visibilitychange', () => {
      // console.log('visibility change');
      if (document.visibilityState === 'hidden') clearTimeout(timeoutId);
      else resetTimeout();
    });

    document.addEventListener('blur', () => {
      // console.log('blur');
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
}

const listHasMatch = (list) =>
  list
    ?.split('\n')
    .find((site) =>
      location.href.match(
        new RegExp(site.replace(/[-\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '\\w+'))
      )
    );

storage.sync.get(['blacklist', 'whitelist']).then(({ blacklist, whitelist }) => {
  if (listHasMatch(blacklist) && !listHasMatch(whitelist)) {
    runtime.sendMessage({ getHostname: true }).then((hostname) => {
      if (hostname === location.hostname) return;

      fetch(runtime.getURL('/breathe.html'))
        .then((res) => res.text())
        .then(breathe);
    });
  }
});
