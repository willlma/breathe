const { runtime } = browser;

// don't try to make shared files with constants in it, Chrome and Firefox do imports differently and it's a pain
const timeMultiplier = 0.1; // set to 0.1 for dev, keep in sync with background.js
const messageTimeout = 2000;

const sendDomain = () =>
  runtime
    .sendMessage({ domain: getDomain() })
    .catch((err) => console.error(`Failed to temporarily whitelist domain: ${err}`));
