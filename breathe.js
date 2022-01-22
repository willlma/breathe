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
      () => console.log('failed to temporarily whitelist hostname')
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
    console.log({ hostname });
    console.log('location.hostname', location.hostname);
    if (hostname === location.hostname) return;

    document.addEventListener('DOMContentLoaded', appendElements);
    intervalId = setInterval(appendElements, 20);

    function showContinueButton() {
      div.append(button);
    }

    let timeoutId;
    if (document.hasFocus()) {
      timeoutId = setTimeout(showContinueButton, 3500 * timeMultiplier);
      console.log('breathe', timeoutId);
    }

    // prevent user from checkout out another tab/app while waiting
    const resetTimeout = () => {
      timeoutId = setTimeout(showContinueButton, 3000 * timeMultiplier);
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
};

const listHasMatch = (list) => list.split('\n').find(site => {
  const regex = new RegExp(site.replace(/\*/g, '\\w+'));
  const match = location.href.match(regex);
  console.log({ regex, match });
  return match;
});

storage.sync.get(['blacklist', 'whitelist']).then(({ blacklist, whitelist }) => {
  console.log({ blacklist, whitelist });

  if (listHasMatch(blacklist) && !listHasMatch(whitelist)) breathe();
});
