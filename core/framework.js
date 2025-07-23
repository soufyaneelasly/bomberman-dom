import { render, createDOMElement } from "./dom.js"
import { effect, reactive, ref, computed, watch} from "./state.js"
import { addRoute, navigate, onRouteChange, errorHandler } from "./router.js"
import { addEvent } from "./events.js"

function createReactiveStore(initialState) {
  const subscribers = []

  const notify = () => {
    subscribers.forEach(callback => callback())
  }
  const handler = {
    set(target, key, value) {
      if (target[key] !== value) {
        target[key] = value
        notify() 
      }
      return true
    }
}

  const state = new Proxy({ ...initialState }, handler)

  return {
    getState() {
      return state
    },
    subscribe(callback) {
      subscribers.push(callback)
      return () => {
        const index = subscribers.indexOf(callback)
        if (index > -1) subscribers.splice(index, 1)
      }
    }
  }
}


export default {
  // DOM
  render,
  createDOMElement,

  //state management
  createReactiveStore,
  effect,
  
  reactive,
  ref,
  computed,
  watch,

  // Routing
  addRoute,
  navigate,
  onRouteChange,
  errorHandler,
  
  // Events
  addEvent
}