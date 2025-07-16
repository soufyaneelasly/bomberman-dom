//mini-framework/src/dom.js

export function createDOMElement(vdom) {
  if (typeof vdom === "string" || typeof vdom === "number") {
    return document.createTextNode(String(vdom))
  }

  const el = document.createElement(vdom.tag)
  
  for (let attr in vdom.attrs || {}) {
    if (attr.startsWith("on") && typeof vdom.attrs[attr] === "function") {
      el[attr] = vdom.attrs[attr]//el.attr = vdom.attrs[attr] el.addEventListener(attr.slice(2).toLowerCase(), vdom.attrs[attr])
    } else if (attr in el) {
      el[attr] = vdom.attrs[attr]
    } else {
      el.setAttribute(attr, vdom.attrs[attr])
    }
  }

  (vdom.children || []).forEach((child) => {
    el.appendChild(createDOMElement(child))
  })

  return el
}

function updateAttributes(el, oldAttrs = {}, newAttrs = {}) {
  for (let key in oldAttrs) {
    if (!(key in newAttrs)) {
      if (key.startsWith("on")) {
        el[key] = null 
      } else if (key in el) {
        try {
          el[key] = null
        } catch (_) {}
      } else {
        el.removeAttribute(key)
      }
    }
  }

  // Add/update new attributes
  for (let key in newAttrs) {
    const oldValue = oldAttrs[key]
    const newValue = newAttrs[key]

    if (oldValue !== newValue) {
      if (key.startsWith("on")) {
        if (oldValue) {
          el[key] = null 
        }
        el[key] = newValue
      } else if (key in el) {
        el[key] = newValue
      } else {
        el.setAttribute(key, newValue)
      }
    }
  }
}

let currentVDOM = null

export function render(vdom, container) {
  if (!container) throw new Error("container is required")

  if (!currentVDOM) {
    container.innerHTML = ''
    const el = createDOMElement(vdom)
    container.appendChild(el)
    currentVDOM = vdom
  } else {
    diff(currentVDOM, vdom, container)
    currentVDOM = vdom
  }
}

function diff(oldVdom, newVdom, parent, index = 0) {
  const existingEl = parent.childNodes[index]
  
  if (!newVdom) {
    if (existingEl) {
      parent.removeChild(existingEl)
    }
    return
  }

  if (!oldVdom) {
    const newEl = createDOMElement(newVdom)
    parent.appendChild(newEl)
    return
  }

  if (
    typeof oldVdom !== typeof newVdom ||
    (typeof newVdom === "string" && oldVdom !== newVdom) ||
    oldVdom.tag !== newVdom.tag
  ) {
    const newEl = createDOMElement(newVdom)
    if (existingEl) {
      parent.replaceChild(newEl, existingEl)
    } else {
      parent.appendChild(newEl)
    }
    return
  }

  if (typeof newVdom !== "string") {
    updateAttributes(existingEl, oldVdom.attrs || {}, newVdom.attrs || {})

    const oldChildren = oldVdom.children || []
    const newChildren = newVdom.children || []

    const maxLen = Math.max(oldChildren.length, newChildren.length)//TODO need to optimize this
    for (let i = 0; i < maxLen; i++) {
      diff(oldChildren[i], newChildren[i], existingEl, i)
    }

    while (existingEl.childNodes.length > newChildren.length) {
      existingEl.removeChild(existingEl.lastChild)
    }
  }
}