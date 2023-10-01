# breathe

A web extension to delay loading of certain distracting websites

## Out of scope

CSS changes to websites. Use Stylus instead.

## Installation

Clone this repo, then follow instructions on how to load local extensions on [Chrome](https://developer.chrome.com/docs/extensions/mv2/getstarted/#manifest) and [Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing)<sup>1</sup>.

## Development

Run `npm install` to load `browser-polyfill`. `src/browser-polyfill.js` is just symlinks to the node-modules dist folder. If you need to recreate these symlinks, use absolute paths, ie

```
ln -sf ~/projects/breathe/node_modules/webextension-polyfill/dist/browser-polyfill.js ~/projects/breathe/src/browser-polyfill.js
```

There are three main branches:

- `main` for common code
- `firefox`
- `chrome`

`main` does not have a manifest as `firefox` is on manifest v2 and `chrome` is on v3. So

1. develop on the branch corresponding to the browser you're testing on
2. switch to the `main` branch to commit shared changes
3. merge main into the browser branch
4. commit browser-specific changes into the browser branch

Once your feature is ready, merge main into the other browser branch and make whatever changes are necessary to its browser-specific files to get it to work.

## How to use it

Add websites you'd rather not waste your time on to `manifest.json`'s `matches` item (using wildcards if you'd like to ignore entire domains), then reload the extension.

## Testing

Head to constants.js and change the `timeMultiplier` to 0.1 to speed everything up.

1. Head to reddit.com to make sure the overlay shows up
2. If it's your cheat day, you should still see the splash screen every 25 minutes or every new site

## Notes

1. You'll need to use Firefox Developer Edition to keep the extension installed permanently. Then visit [about:config](about:config) and change `xpinstall.signatures.required` to false and download the zip from the [releases page](https://github.com/willlma/breathe/releases).

## Roadmap

- [ ] If I walk off while the breathe animation is going for a few minutes, show a button to start the countdown again
- [x] The content script timeout isn't working. I think maybe JS is getting paused? Use the extension alarm API in the background script to reimplement the feature where an SPA is shut off after the specified time.
- [ ] There's a bug where if I start with a whitelisted URL (a specific tweet) then navigate to blacklisted URL (my Twitter homescreen), it's not picked up as blacklisted. I need to hook into the history pushtate API to detect SPA navigation.
- [ ] Integrate with with pomo script to prevent loading at all during a pomo
