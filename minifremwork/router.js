const routes = new Map()  // path -> callback mapping
const routeListeners = []  // general listeners (for onRouteChange)
let currentPath = window.location.hash || '#/'

export function addRoute(path, callback) {
  routes.set(path, callback)
}

export function navigate(path) {
  if (path !== currentPath) {
    currentPath = path
    window.location.hash = path
    notifyRouteListeners()
    executeRouteHandler(path)
  }
}

export function onRouteChange(callback) {
  routeListeners.push(callback)
  callback(currentPath)
}

function executeRouteHandler(path) {
  const handler = routes.get(path)
  if (handler) {
    handler()
  }
}

function notifyRouteListeners() {
  routeListeners.forEach(callback => callback(currentPath))
}

window.onhashchange = () => {
  currentPath = window.location.hash || '#/'
  notifyRouteListeners()
  executeRouteHandler(currentPath)
}

window.onload = () => {
  currentPath = window.location.hash || '#/'
  notifyRouteListeners()
  executeRouteHandler(currentPath)
}