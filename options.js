const form = document.getElementById("form")
const form_ctr = form.firstElementChild
const cond_options = document.getElementById("cond_options")

const add_cond = (name, values = []) => {
  const div = append_element(form_ctr, "div")

  const append_labeled_input = (label, name, value) => {
    const lbl = append_element(div, "label")
    const span = append_element(lbl, "span")
    span.textContent = label
    return append_element(lbl, "input", {type: "text", name, value, required: true})
  }

  switch (name) {
  case "page_contains":
    append_labeled_input("Text on a whole page", name, values[0])
    break
  case "el_contains":
    append_labeled_input("Element selector", "el_selector", values[0])
    append_labeled_input("Text in an element", name, values[1])
    break
  }

  append_element(div, "input", {type: "button", value: "X", class: "rm-cond"})
}

const save_form = e => {
  e.preventDefault()
  const form_data = new FormData(form)
  const obj = form_data_to_obj(form_data)

  console.assert(obj.el_selector.length === obj.el_contains.length)

  return storage_set_debug(browser.storage.local, {[StorageKey.OPTIONS]: obj})
}

const load_form = obj => {
  for (const value of obj.page_contains || [])
    add_cond("page_contains", [value])

  for (const i in obj.el_contains || [])
    add_cond("el_contains", [obj.el_selector[i], obj.el_contains[i]])
}

;(async () => {
  document.getElementById("add_cond_option").addEventListener("click", () => add_cond(cond_options.value))
  form.addEventListener("submit", save_form)

  const obj = await storage_get_single(browser.storage.local, StorageKey.OPTIONS) || {}
  load_form(obj)

  document.querySelectorAll(".rm-cond").forEach(button =>
    button.addEventListener("click", ({target}) => target.parentNode.remove()))
})()
