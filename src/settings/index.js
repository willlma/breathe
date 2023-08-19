const { storage } = browser;
const fields = ['whitelist', 'blacklist', 'cheatDay'];
const submit = document.querySelector('button');

const form = document.querySelector('form');
const button = form.querySelector('button');

form.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const data = new FormData(form);
  const settings = fields.reduce((acc, key) => ({ ...acc, [key]: data.get(key) }), {});
  console.log('settings', settings);
  storage.sync.set(settings).then(() => {
    button.textContent = 'Saved';
    close(); // Only works in Chrome
  });
});

storage.sync.get(fields).then((settings) => {
  fields.forEach((name) => {
    const input = form.querySelector(`[name="${name}"]`);
    input.addEventListener('input', () => (button.textContent = 'Save'));
    if (settings[name]) input.value = settings[name];
  });
});
