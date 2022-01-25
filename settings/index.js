const { storage } = browser;
const lists = ['whitelist', 'blacklist'];
const submit = document.querySelector('button');

const form = document.querySelector('form');
const button = form.querySelector('button');

form.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const data = new FormData(form);
  const settings = lists.reduce((acc, key) => ({ ...acc, [key]: data.get(key) }), {});
  storage.sync.set(settings).then(() => {
    button.textContent = "Saved";
    close(); // Only works in Chrome
  });
});

storage.sync.get(lists).then((settings) => {
  lists.forEach(name => {
    const input = form.querySelector(`[name="${name}"]`);
    input.addEventListener('input', () => button.textContent = "Save");
    if (settings[name]) input.value = settings[name];
  });
});
