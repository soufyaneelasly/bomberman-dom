//mini-framework/src/dom.js

const routeListeners = []
let currentPath = window.location.hash || '#/'

export function addRoute(path, callback) {
  // This function can be kept for compatibility but isn't needed for the main flow
  routeListeners.push(callback)
}

export function navigate(path) {
  if (path !== currentPath) {
    currentPath = path
    window.location.hash = path
    notifyRouteListeners()
  }
}
export function errorHandler(err) {
  console.error("An error occurred:", err)
  typeof err === 'string' ? alert(err) : alert(`An error occurred: ${err.message || err}`)
}
export function onRouteChange(callback) {
  routeListeners.push(callback)
  callback(currentPath)
}

function notifyRouteListeners() {
  routeListeners.forEach(callback => callback(currentPath))
}

window.onhashchange = () => {
  currentPath = window.location.hash || '#/'
  notifyRouteListeners()
}

window.onload = () => {
  currentPath = window.location.hash || '#/'
  notifyRouteListeners()
}