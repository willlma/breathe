# breathe

A web extension to delay loading of certain distracting websites

## Installation

Clone this repo, then follow instructions on how to load local extensions on [Chrome](https://developer.chrome.com/docs/extensions/mv2/getstarted/#manifest) and [Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing)<sup>1</sup>.

## How to use it

Add websites you'd rather not waste your time on to `manifest.json`'s `matches` item (using wildcards if you'd like to ignore entire domains), then reload the extension.

## Notes

1. You'll need to use Firefox Developer Edition to keep the extension installed permanently. Then visit [about:config](about:config) and change `xpinstall.signatures.required` to false and download the zip from the [releases page](https://github.com/willlma/breathe/releases).

## Roadmap

Integrate with with pomo script to prevent loading at all during a pomo
