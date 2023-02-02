const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms))

const promise_to_bool = async promise => {
  try {
    const r = await promise
    console.debug(`Promise success: "${r}"`)
    return true
  } catch (e) {
    console.debug(`Promise failed: ${e.stack}`)
    return false
  }
}

const append_element = (container, tag_name, attributes = {}) => {
  const el = document.createElement(tag_name)

  for (const [name, value] of Object.entries(attributes)) {
    if (value)
      el.setAttribute(name, value)
  }

  container.appendChild(el)
  return el
}

const form_data_to_obj = form_data => {
  const obj = {}
  form_data.forEach((value, key) => {
    (obj[key] || (obj[key] = [])).push(value)
  })
  return obj
}

const is_site_up = async domain => {
  const url = `https://www.isitdownrightnow.com/check.php?domain=${domain}`
  const response = await fetch(url)
  const text = await response.text()
  const is_up = text.includes("is UP and reachable")
  if (!is_up)
    console.assert(text.includes("is DOWN  for everyone"))
  return is_up
}

const Scheme = {
  ALL: "all",
  HTTP: "http",
  HTTPS: "https",
  SOCKS: "socks",
  SOCKS4: "socks4",
  SOCKS5: "socks5"
}

const OrderBy = {
  SPEED: "speed",
  UPTIME: "uptime",
  PING: "ping",
  DATE: "date"
}

const Level = {
  ALL: "all",
  LEVEL1: "level1",
  LEVEL2: "level2",
  LEVEL3: "level3"
}

const fetch_proxy_list = async ({is_acceptable_proxy = proxy_info => true, country = "all",
                                 scheme = Scheme.ALL, order_by = OrderBy.PING, level = Level.ALL,
                                 limit = Number.MAX_SAFE_INTEGER} = {}) => {
  const get_proxy_info = tr => {
    const rows = tr.children
    if (rows.length < 10) return null

    const ip_re = /document\.write\(Base64\.decode\("(.+)"\)\)/
    return {
      host: atob(rows[0].children[0].children[0].match(ip_re)[1]),
      port: parseInt(rows[1].children[0].children[0]),
      scheme: rows[2].children[0].children[0].toLowerCase(),
      speed_kbs: parseInt(rows[7].children[0].children[0]),
      uptime_pc: parseFloat(rows[8].children[0].children[0]),
      ping_ms: parseInt(rows[9].children[0].children[0].children[0]),
      last_checked_hours: parseInt(rows[10].children[0].children[0]),
    }
  }

  const url = `http://free-proxy.cz/en/proxylist/country/${country}/${scheme}/${order_by}/${level}`
  console.debug(`Fetching url "${url}"`)
  const response = await fetch(url)
  const text = await response.text()
  const xml = txml.parse(text)
  const body_w = xml[1].children[1].children[1].children[1]
  console.assert(body_w.attributes["class"] === "body_w")

  if (body_w.children.length < 10) {
    console.debug("Proxies not found")
    return []
  }

  const table = body_w.children[10]
  console.assert(table.tagName === "table" && table.attributes.id === "proxy_list")
  
  const trs = table.children[1].children
  const list = []
  for (tr of trs) {
    const p = get_proxy_info(tr)

    if (p && is_acceptable_proxy(p))
      list.push(p)

    if (list.length >= limit)
      break
  }
  return list
}
