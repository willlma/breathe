// Patch history methods so the content script can detect SPA navigations.
// This runs in the page's JS context (not the content script's isolated world),
// so it patches the same history object that frameworks like React Router use.
['pushState', 'replaceState'].forEach((method) => {
  const original = history[method];
  history[method] = function (...args) {
    original.apply(this, args);
    window.dispatchEvent(new Event('breathe:locationchange'));
  };
});

// Some SPAs use the Navigation API instead of history.pushState/replaceState.
// Dispatch after the entry changes so content.js reads the destination URL.
if ('navigation' in window) {
  navigation.addEventListener('currententrychange', () => {
    window.dispatchEvent(new Event('breathe:locationchange'));
  });
}
