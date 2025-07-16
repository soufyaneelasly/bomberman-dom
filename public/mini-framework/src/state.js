//mini-framework/src/dom.js


const states = []
let stateIndex = 0
let renderCallback = null

export function useState(initialValue) {
  const currentIndex = stateIndex

  if (states[currentIndex] === undefined) {
    states[currentIndex] = initialValue
  }

  function setState(newValue) {
    states[currentIndex] = newValue
    if (renderCallback) {
      stateIndex = 0
      renderCallback()
    }
  }

  function getState() {
    return states[currentIndex]
  }

  stateIndex++
  return [getState, setState]
}

export function setRenderCallback(cb) {
  renderCallback = cb
}

export function resetIndex() {
  stateIndex = 0
}