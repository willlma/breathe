const { storage } = browser;
const lists = ['whitelist', 'blacklist'];
const submit = document.querySelector('button');

console.log('options js');

document.querySelector('form').addEventListener('submit', (evt) => {
  evt.preventDefault();

  const data = new FormData(evt.target);
  const settings = lists.reduce((acc, key) => ({ ...acc, [key]: data.get(key) }), {});
  console.log({ settings });
  storage.sync.set(settings).then(window.close);
});

storage.sync.get(lists).then((settings) => {
  lists.forEach(name => {
    if (settings[name]) document.querySelector(`[name="${name}"]`).value = settings[name];
  });
});
