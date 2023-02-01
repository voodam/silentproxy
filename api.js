const Msg = {
  NEED_PROXY: "need_proxy"
}

const StorageKey = {
  OPTIONS: "options"
}

const reload_with_proxy = async({tabId, url}, config) => {
  console.debug(`Reload "${url}" with proxy "${JSON.stringify(config)}"`)
  const old_settings = await browser.proxy.settings.get({})
  await browser.proxy.settings.set({value: config})
  await browser.tabs.reload(tabId)
  // I don't know why this is required, maybe a bug?
  await sleep(10)
  return browser.proxy.settings.set({value: old_settings.value})
}

const fetch_next_proxy = async () => {
  const [payload = [], left_ms = 60*60*1000] =
    await storage_get_expire(browser.storage.local, "proxy_cache")
  let [next_proxy, ...rest] = payload

  if (!next_proxy) {
    const params = {is_acceptable_proxy: p => p.uptime_pc > 80};
    [next_proxy, ...rest] = await fetch_proxy_list(params)

    if (!rest.length)
      console.debug(`No proxies left. Probably params are too strict?`)
  }

  storage_set_expire(browser.storage.local, "proxy_cache", rest, left_ms)
  return next_proxy
}

const clear_proxy_cache = () =>
  browser.storage.local.remove("proxy_cache")

const refresh_proxy = async () => {
  const new_proxy = await fetch_next_proxy()
  storage_set_debug(browser.storage.local, {cur_proxy: new_proxy})
  return new_proxy
}

const get_cur_proxy = async () => {
  const proxy = await storage_get_single(browser.storage.local, "cur_proxy")
  return proxy || await refresh_proxy()
}

const get_cur_proxy_cfg = async () => {
  const proxy = await get_cur_proxy()

  if (!proxy)
    return {mode: "direct"}

  const {host, port, scheme} = proxy
  return {
    mode: "fixed_servers",
    rules: {singleProxy: {host, port, scheme}}
  }
}
