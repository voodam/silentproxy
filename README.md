# silentproxy

Browser extension that automatically enables browser proxy according to custom rules.

Proof of concept stage.

## Install
* https://stackoverflow.com/a/24577660
* Open options, add conditions indicating when a proxy should be enabled.

## Usage
* Open a service worker console.
* Type `refresh_proxy()` to set up a new proxy (only required if proxy become dead).
* Type `browser.storage.local.clear()` and `browser.proxy.settings.clear({})` if something goes wrong.

## Supported browsers
* Chrome (tested on 109.0.5414.119 version)

## Roadmap
* Add proxy refreshing button.
* Publish in stores.
* Test on Firefox. Now Firefox haven't support of the service workers, but they plan to add it, so we have to wait.
* Test on another browsers.
