//mini-framework/src/dom.js


import { render, createDOMElement } from "./dom.js"
import { useState, setRenderCallback, resetIndex } from "./state.js"
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
        // console.trace(`State changed: ${key} = ${value}`)
        target[key] = value
        notify() 
      }
      return true
    }
  }

  const state = new Proxy({ ...initialState }, handler)

  return {
    getState() {
      return state;
    },
    setState(newState) {
      Object.entries(newState).forEach(([key, value]) => {
        state[key] = value;
      });
    },
    subscribe(callback) {
      subscribers.push(callback);
      return () => {
        const index = subscribers.indexOf(callback);
        if (index > -1) subscribers.splice(index, 1);
      };
    }
  };
}


export default {
  // DOM
  render,
  createDOMElement,
  
  // State
  useState,
  setRenderCallback,
  resetIndex,
  createReactiveStore,
  
  // Routing
  addRoute,
  navigate,
  onRouteChange,
  errorHandler,
  
  // Events
  addEvent
}