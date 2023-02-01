const need_proxy = async () => {
  const options = await storage_get_single(browser.storage.local, StorageKey.OPTIONS)
  console.debug(`Options loaded: "${JSON.stringify(options)}"`)
  const {el_selector = [], el_contains = [], page_contains = []} = options || {}

  for (const i in el_selector) {
    if (document.querySelector(el_selector[i])?.textContent.includes(el_contains[i])) {
      console.debug(`"${el_selector[i]}" contains text "${el_contains[i]}"`)
      return true
    }
  }

  const body_content = document.body.textContent
  for (const text of page_contains)
    if (body_content.includes(text)) {
      console.debug(`Body contains text "${text}"`)
      return true
    }

  return false
}

;(async () => {
  if (await need_proxy()) {
    send_message(Msg.NEED_PROXY)
  }
})()
