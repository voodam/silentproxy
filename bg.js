importScripts("lib/browser-polyfill.min.js", "lib/txml.min.js", "lib.js", "webext_lib.js", "api.js")

browser.webRequest.onErrorOccurred.addListener(async e => {
  if (e.tabId === -1) return

  const domain = new URL(e.url).host
  // this error code isn't reliable, but I don't know a better way
  if (e.error === "net::ERR_NAME_NOT_RESOLVED" && await is_site_up(domain)) {
    await reload_with_proxy(e, await get_cur_proxy_cfg())
  }
}, {urls: ["<all_urls>"], types: ["main_frame"]})

on_message(Msg.NEED_PROXY, async (payload, {tab: {tabId}, url}) => {
  return reload_with_proxy({tabId, url}, await get_cur_proxy_cfg())
})
