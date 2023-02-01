const send_message = async (type, payload) => {
  await browser.runtime.sendMessage({type, payload})
  console.debug(`Sent message "${type}"`)
}

const on_message = (with_type, listener) => {
  browser.runtime.onMessage.addListener(({type, payload}, sender) => {
    if (type !== with_type) return
    console.debug(`Got message "${type}" with payload "${payload}"`)
    listener(payload, sender)
  })
}

const storage_set_expire = (storage, key, payload, left_ms = 60*60*1000) => {
  const expire_ms = Date.now() + left_ms
  return storage_set_debug(storage, {[key]: {payload, expire_ms}})
}

const storage_get_expire = async (storage, key) => {
  const data = await storage_get_single(storage, key)
  if (!data)
    return []

  const {payload, expire_ms} = data
  const left_ms = expire_ms - Date.now()

  if (left_ms > 0) {
    console.debug(`Left ${left_ms} ms for storage item "${key}"`)
    return [payload, left_ms]
  }

  console.debug(`Storage item "${key}" expired`)
  await storage.remove(key)
  return []
}

const storage_get_single = async (storage, key) =>
  (await storage.get(key))[key]

const storage_set_debug = async (storage, items) => {
  await storage.set(items)
  console.debug(`Storage set: ${JSON.stringify(items)}`)
}
