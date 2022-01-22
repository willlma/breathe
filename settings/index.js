const { storage } = browser;
const lists = ['whitelist', 'blacklist'];
const submit = document.querySelector('button');

console.log('options js');

const setSaveText = (text = "Save") => submit.textContent = text;

document.querySelector('form').addEventListener('submit', (evt) => {
  evt.preventDefault();

  const data = new FormData(evt.target);
  const settings = lists.reduce((acc, key) => ({ ...acc, [key]: data.get(key) }), {});
  console.log({ settings });
  storage.sync.set(settings);

  setSaveText("Saved");
});

storage.sync.get(lists).then((settings) => {
  lists.forEach(name => {
    const textarea = document.querySelector(`[name="${name}"]`);
    textarea.addEventListener('input', () => setSaveText());
    if (settings[name]) textarea.value = settings[name];
  });
});
