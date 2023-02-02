const color_button = async (target, promise) => {
  const success = await promise_to_bool(promise)
  const color = success ? "green": "red"
  target.style.color = color
  target.style.borderColor = color
}

document.getElementById("refresh_proxy").addEventListener("click",
  ({target}) => color_button(target, refresh_proxy()))

document.getElementById("clear_proxy_cache").addEventListener("click",
  ({target}) => color_button(target, clear_proxy_cache()))

document.getElementById("clear_proxy_settings").addEventListener("click",
  ({target}) => color_button(target, browser.proxy.settings.clear({})))
