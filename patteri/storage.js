export function storeConfig(config) {
  window.localStorage.setItem("config", JSON.stringify(config))
}

export function getConfig() {
  return JSON.parse(window.localStorage.getItem("config"))
}

export function isConfigStored() {
  return window.localStorage.getItem("config") !== null
}

export function clearConfig() {
  window.localStorage.removeItem("config")
}
