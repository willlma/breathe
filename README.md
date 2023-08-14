# breathe

A web extension to delay loading of certain distracting websites

## Installation

Clone this repo, then follow instructions on how to load local extensions on [Chrome](https://developer.chrome.com/docs/extensions/mv2/getstarted/#manifest) and [Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing)<sup>1</sup>.

## Development

Run `npm install` to load `browser-polyfill`. The files are just symlinks to the node-modules dist folder.

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
2. When you click continue

## Notes

1. You'll need to use Firefox Developer Edition to keep the extension installed permanently. Then visit [about:config](about:config) and change `xpinstall.signatures.required` to false and download the zip from the [releases page](https://github.com/willlma/breathe/releases).

## Roadmap

Integrate with with pomo script to prevent loading at all during a pomo
