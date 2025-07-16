//mini-framework/src/dom.js



// ============= events.js - Custom Event System =============

// Global event storage - maps elements to their event handlers
const elementEventMap = new WeakMap();

// Custom event listener implementation
export function addEvent(element, eventType, handler) {
  // Get or create event map for this element
  if (!elementEventMap.has(element)) {
    elementEventMap.set(element, new Map());
  }
  
  const eventMap = elementEventMap.get(element);
  
  // Get or create handler array for this event type
  if (!eventMap.has(eventType)) {
    eventMap.set(eventType, []);
    
    // Set up our custom event handler on the element
    element[`on${eventType}`] = function(event) {
      triggerCustomEvent(element, eventType, event);
    };
  }
  
  // Add the handler to our custom system
  eventMap.get(eventType).push(handler);
  
  // Return removal function
  return () => removeEvent(element, eventType, handler);
}

// Remove specific event handler
export function removeEvent(element, eventType, handler) {
  if (!elementEventMap.has(element)) return;
  
  const eventMap = elementEventMap.get(element);
  if (!eventMap.has(eventType)) return;
  
  const handlers = eventMap.get(eventType);
  const index = handlers.indexOf(handler);
  
  if (index > -1) {
    handlers.splice(index, 1);
    
    // If no more handlers, remove the native event listener
    if (handlers.length === 0) {
      element[`on${eventType}`] = null;
      eventMap.delete(eventType);
    }
  }
}

// Trigger our custom event system
function triggerCustomEvent(element, eventType, nativeEvent) {
  if (!elementEventMap.has(element)) return;
  
  const eventMap = elementEventMap.get(element);
  if (!eventMap.has(eventType)) return;
  
  const handlers = eventMap.get(eventType);
  
  // Create our custom event object
  const customEvent = createCustomEvent(nativeEvent, element);
  
  // Call all handlers for this event type
  handlers.forEach(handler => {
    try {
      handler.call(element, customEvent);
    } catch (error) {
      console.error('Error in event handler:', error);
    }
  });
}

// Create custom event object with additional features
function createCustomEvent(nativeEvent, target) {
  return {
    // Native event properties
    type: nativeEvent.type,
    target: target,
    currentTarget: target,
    timeStamp: nativeEvent.timeStamp || Date.now(),
    
    // Mouse/Touch events
    clientX: nativeEvent.clientX,
    clientY: nativeEvent.clientY,
    pageX: nativeEvent.pageX,
    pageY: nativeEvent.pageY,
    
    // Keyboard events
    key: nativeEvent.key,
    keyCode: nativeEvent.keyCode,
    ctrlKey: nativeEvent.ctrlKey,
    altKey: nativeEvent.altKey,
    shiftKey: nativeEvent.shiftKey,
    
    // Form events
    value: target.value,
    checked: target.checked,
    
    // Custom methods
    preventDefault: () => {
      if (nativeEvent.preventDefault) {
        nativeEvent.preventDefault();
      }
    },
    
    stopPropagation: () => {
      if (nativeEvent.stopPropagation) {
        nativeEvent.stopPropagation();
      }
    },
    
    // Original native event (if needed)
    originalEvent: nativeEvent
  };
}

// Event delegation system (advanced feature)
export function delegate(container, selector, eventType, handler) {
  addEvent(container, eventType, function(e) {
    const target = e.target;
    const delegateTarget = target.closest(selector);
    
    if (delegateTarget && container.contains(delegateTarget)) {
      // Create new event object with delegated target
      const delegatedEvent = {
        ...e,
        target: delegateTarget,
        currentTarget: delegateTarget,
        delegatedFrom: target
      };
      
      handler.call(delegateTarget, delegatedEvent);
    }
  });
}

// ============= dom.js - Updated to use custom event system =============

import { addEvent } from './events.js';

export function createDOMElement(vdom) {
  if (typeof vdom === "string" || typeof vdom === "number") {
    return document.createTextNode(String(vdom));
  }

  const el = document.createElement(vdom.tag);
  
  // Handle attributes and events
  for (let attr in vdom.attrs || {}) {
    if (attr.startsWith("on") && typeof vdom.attrs[attr] === "function") {
      // Use our custom event system instead of addEventListener
      const eventName = attr.slice(2).toLowerCase(); // "onclick" -> "click"
      addEvent(el, eventName, vdom.attrs[attr]);
    } else if (attr in el) {
      el[attr] = vdom.attrs[attr];
    } else {
      el.setAttribute(attr, vdom.attrs[attr]);
    }
  }

  // Handle children
  (vdom.children || []).forEach((child) => {
    el.appendChild(createDOMElement(child));
  });

  return el;
}

// Updated updateAttributes to handle custom events
function updateAttributes(el, oldAttrs = {}, newAttrs = {}) {
  // Remove old attributes and events
  for (let key in oldAttrs) {
    if (!(key in newAttrs)) {
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        // Remove from our custom event system
        removeEvent(el, eventName, oldAttrs[key]);
      } else if (key in el) {
        try {
          el[key] = null;
        } catch (_) {}
      } else {
        el.removeAttribute(key);
      }
    }
  }

  // Add/update new attributes and events
  for (let key in newAttrs) {
    const oldValue = oldAttrs[key];
    const newValue = newAttrs[key];

    if (oldValue !== newValue) {
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        // Remove old handler and add new one
        if (oldValue) {
          removeEvent(el, eventName, oldValue);
        }
        addEvent(el, eventName, newValue);
      } else if (key in el) {
        el[key] = newValue;
      } else {
        el.setAttribute(key, newValue);
      }
    }
  }
}

// Rest of dom.js remains the same...
let currentVDOM = null;

export function render(vdom, container) {
  if (!container) throw new Error("container is required");

  if (!currentVDOM) {
    container.innerHTML = '';
    const el = createDOMElement(vdom);
    container.appendChild(el);
    currentVDOM = vdom;
  } else {
    diff(currentVDOM, vdom, container);
    currentVDOM = vdom;
  }
}

function diff(oldVdom, newVdom, parent, index = 0) {
  const existingEl = parent.childNodes[index];
  
  if (!newVdom) {
    if (existingEl) {
      parent.removeChild(existingEl);
    }
    return;
  }

  if (!oldVdom) {
    const newEl = createDOMElement(newVdom);
    parent.appendChild(newEl);
    return;
  }

  if (
    typeof oldVdom !== typeof newVdom ||
    (typeof newVdom === "string" && oldVdom !== newVdom) ||
    oldVdom.tag !== newVdom.tag
  ) {
    const newEl = createDOMElement(newVdom);
    if (existingEl) {
      parent.replaceChild(newEl, existingEl);
    } else {
      parent.appendChild(newEl);
    }
    return;
  }

  if (typeof newVdom !== "string") {
    updateAttributes(existingEl, oldVdom.attrs || {}, newVdom.attrs || {});

    const oldChildren = oldVdom.children || [];
    const newChildren = newVdom.children || [];

    const maxLen = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLen; i++) {
      diff(oldChildren[i], newChildren[i], existingEl, i);
    }

    // Remove extra child nodes
    while (existingEl.childNodes.length > newChildren.length) {
      existingEl.removeChild(existingEl.lastChild);
    }
  }
}

// ============= Example Usage =============

// Basic usage
const button = createElement('button', {
  onclick: (e) => {
    console.log('Button clicked!', e.target);
    e.preventDefault();
  }
}, ['Click me']);

// Advanced usage with custom event system
const input = createElement('input', {
  oninput: (e) => {
    console.log('Input value:', e.value);
  },
  onkeydown: (e) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed!');
    }
  }
});

// Event delegation example
delegate(document.body, '.dynamic-button', 'click', (e) => {
  console.log('Dynamically added button clicked!');
});

// Manual event binding
const myDiv = createElement('div', {}, ['Hover me']);
addEvent(myDiv, 'mouseenter', (e) => {
  e.target.style.backgroundColor = 'yellow';
});
addEvent(myDiv, 'mouseleave', (e) => {
  e.target.style.backgroundColor = '';
});