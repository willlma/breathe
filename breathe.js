const { runtime, storage } = browser;
const timeMultiplier = 10; // set to 1 for testing

function breathe() {
  const div = document.createElement('div');
  div.id = 'gotta-breathe';
  div.append('Focus on something 20 feet away for 20 seconds.');

  const img = document.createElement('img');
  img.src = runtime.getURL('assets/breathe.gif');
  div.append(img);

  function releaseTheDopamine() {
    runtime.sendMessage({ hostname: location.hostname }).then(
      () => div.remove(),
      err => console.error(`Failed to temporarily whitelist hostname: ${err}`)
    );
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

  runtime.sendMessage({ getHostname: true }).then((hostname) => {
    if (hostname === location.hostname) return;

    document.addEventListener('DOMContentLoaded', appendElements);
    intervalId = setInterval(appendElements, 20);

    function showContinueButton() {
      div.append(button);
    }

    let timeoutId;
    if (document.hasFocus()) {
      timeoutId = setTimeout(showContinueButton, 3500 * timeMultiplier);
    }

    // prevent user from checkout out another tab/app while waiting
    const resetTimeout = () => {
      timeoutId = setTimeout(showContinueButton, 3000 * timeMultiplier);
      document.removeEventListener('focus', resetTimeout);
    }


    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') clearTimeout(timeoutId);
      else resetTimeout();
    });

    document.addEventListener('blur', () => {
      clearTimeout(timeoutId);
      document.addEventListener('focus', resetTimeout);
    });
  });
};

const listHasMatch = (list) => list?.split('\n').find(
  site => location.href.match(
    new RegExp(site.replace(/[-\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '\\w+'))
  )
);

storage.sync.get(['blacklist', 'whitelist']).then(({ blacklist, whitelist }) => {
  if (listHasMatch(blacklist) && !listHasMatch(whitelist)) breathe();
});
