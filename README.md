# Take a breath

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

1. develop on the branch corresponding to the browser you're testing on. Commit browser-specific changes into the browser branch.
2. switch to the `main` branch to commit shared changes
3. merge main into the browser branch

Once your feature is ready, merge main into the other browser branch and make whatever changes are necessary to its browser-specific files to get it to work.

## Build

### Firefox

Update the version in the manifest.json

### Globally

`npx web-ext build`

## How to use it

Add websites you'd rather not waste your time on to `manifest.json`'s `matches` item (using wildcards if you'd like to ignore entire domains), then reload the extension.

## Manual Testing

Head to constants.js and change the `timeMultiplier` to 0.1 to speed everything up.

1. Head to reddit.com to make sure the overlay shows up
2. If it's your cheat day, you should still see the splash screen every 25 minutes or every new site

## Notes

1. You'll need to use Firefox Developer Edition to keep the extension installed permanently. Then visit [about:config](about:config) and change `xpinstall.signatures.required` to false and download the zip from the [releases page](https://github.com/willlma/breathe/releases).

## Roadmap

- [ ] Bug: x.com matches vox.com. Make sure that it can handle any protocol or subdomain but not be too eager
- [ ] Don't allow cheat day id it's between midnight and 6
- [ ] Show cheat day message once every 30 mins
- [ ] Ship with better default sites (facebook, instagram, TikTok)
- Simplify the form
  - [ ] Hide the 5 minute helper if used
  - [ ] Hide the gif once the continue button is ready
- [ ] If I walk off while the breathe animation is going for a few minutes, show a button to start the countdown again
- [ ] Increase wait time with each use (maybe stick to 25s for the first three), and show the wait time
- [ ] Dark theme for settings

## My lists

```
hn.algolia.com
news.ycombinator.com
pinboard.in/popular
reddit.com
https://x.com
```

```
hn.algolia.com/?query=
news.ycombinator.com/item
reddit.com/r/*/comments
https://x.com/*/status
```

## Add-on/Web store information

### Description

This is an anti-procrastination tool that takes a softer approach than most site blocking addons. Those don't work because you eventually just uninstall or disable them to continue your guilty pleasure. Rather than blocking you, this extension slows you down before you can visit time-wasting websites like Twitter, Facebook, Instagram, or Reddit.

When you try to visit one, it asks you how long you'd like to browse it for. Then you must wait 20 seconds before you can gain access. This helps break the dopamine loop associated with easily visiting these websites multiple times a day. When the time you defined is up, the tab closes.

Go to settings to set websites you don't want to visit, like:
https://x.com

If you still want to be able to see certain pages of that website (say someone sends you a tweet), you can whitelist them with wildcards, like this:
https://x.com/*/status

### Chrome

##### Single Purpose

This extension is designed to help you focus by delaying the loading of certain websites.

##### Storage Justification

Stores a list of URLs configured by the user to block/allow websites.

##### Alarms Justification

The user configures how long they would like to spend on a site. After that delay, the tab is closed. The alarms API is needed to trigger the event after the specified delay.

##### Host Permission Justification

The extension needs to be able to block certain websites whenever the URL changes which must use the history popstate API inside a content script loaded into every page.
