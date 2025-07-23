// Batch DOM operations to minimize reflows
class DOMBatcher {
  constructor() {
    this.operations = [];
    this.scheduled = false;
  }

  schedule(operation) {
    this.operations.push(operation);
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  flush() {
    const reads = [];
    const writes = [];

    this.operations.forEach(op => {
      if (op.type === 'read') reads.push(op);
      else writes.push(op);
    });

    reads.forEach(op => op.execute());
    writes.forEach(op => op.execute());

    this.operations = [];
    this.scheduled = false;
  }
}

const domBatcher = new DOMBatcher();

export function createDOMElement(vdom) {
  if (typeof vdom === "string" || typeof vdom === "number") {
    return document.createTextNode(String(vdom));
  }

  const el = document.createElement(vdom.tag);
  const attrs = vdom.attrs || {};

  // Batch attribute setting to minimize reflows
  const fragment = document.createDocumentFragment();

  // Process attributes in optimal order: non-layout affecting first
  const layoutAttrs = ['className', 'id', 'style'];
  const regularAttrs = [];
  const layoutAffecting = [];

  for (let attr in attrs) {
    if (layoutAttrs.includes(attr)) {
      layoutAffecting.push([attr, attrs[attr]]);
    } else {
      regularAttrs.push([attr, attrs[attr]]);
    }
  }

  // Set non-layout affecting attributes first
  regularAttrs.forEach(([attr, value]) => {
    setElementAttribute(el, attr, value);
  });

  // Then layout-affecting attributes
  layoutAffecting.forEach(([attr, value]) => {
    setElementAttribute(el, attr, value);
  });

  // Build children in DocumentFragment first
  const children = vdom.children || [];
  if (children.length > 0) {
    if (children.length === 1) {
      // Single child - direct append
      el.appendChild(createDOMElement(children[0]));
    } else {
      // Multiple children - use fragment
      children.forEach(child => {
        fragment.appendChild(createDOMElement(child));
      });
      el.appendChild(fragment);
    }
  }

  return el;
}

// Optimized attribute setting
function setElementAttribute(el, attr, value) {
  if (attr.startsWith("on") && typeof value === "function") {
    el[attr] = value;
  } else if (attr === "style" && typeof value === "object") {
    // Batch style updates
    const styleText = Object.entries(value)
      .map(([prop, val]) => `${prop}: ${val}`)
      .join('; ');
    el.style.cssText = styleText;
  } else if (attr === "className") {
    // Use className for better performance
    el.className = value;
  } else if (attr !== "key" && attr in el) {
    el[attr] = value;
  } else if (attr !== "key") {
    el.setAttribute(attr, value);
  }
}

// Optimized attribute updates with minimal DOM touches
function updateAttributes(el, oldAttrs = {}, newAttrs = {}) {
  const operations = [];

  // Collect all attribute changes
  const allKeys = new Set([...Object.keys(oldAttrs), ...Object.keys(newAttrs)]);

  for (let key of allKeys) {
    const oldVal = oldAttrs[key];
    const newVal = newAttrs[key];

    if (oldVal !== newVal) {
      if (!(key in newAttrs)) {
        // Remove attribute
        operations.push(() => removeAttribute(el, key, oldVal));
      } else {
        // Update attribute
        operations.push(() => setElementAttribute(el, key, newVal));
      }
    }
  }

  // Execute all changes at once
  operations.forEach(op => op());
}

function removeAttribute(el, key, oldVal) {
  if (key.startsWith("on")) {
    el[key] = null;
  } else if (key === "style") {
    // More efficient style clearing
    el.style.cssText = '';
  } else if (key === "className") {
    el.className = '';
  } else if (key in el) {
    el[key] = null;
  } else {
    el.removeAttribute(key);
  }
}

// Render with batching and minimal repaints
let currentVDOM = null;

export function render(...args) {
  // Last argument should be the container
  const container = args[args.length - 1];
  // All other arguments are VDOM elements
  const vdomElements = args.slice(0, -1);
  
  // if (!container) throw new Error("container is required");
  
  if (!currentVDOM) {
    // Initial render - immediate
    container.innerHTML = '';
    vdomElements.forEach(vdom => {
      if (vdom) { // Skip null/undefined elements
        const el = createDOMElement(vdom);
        container.appendChild(el);
      }
    });
    currentVDOM = vdomElements;
  } else {
    // Update render - use diff for better performance
    diffMultiple(currentVDOM, vdomElements, container);
    currentVDOM = vdomElements;
  }
}

function diffMultiple(oldVdomArray, newVdomArray, container) {
  const maxLength = Math.max(oldVdomArray.length, newVdomArray.length);
  
  for (let i = 0; i < maxLength; i++) {
    const oldVdom = oldVdomArray[i];
    const newVdom = newVdomArray[i];
    diff(oldVdom, newVdom, container, i);
  }
}

function diff(oldVdom, newVdom, parent, index = 0) {
  const existingEl = parent.childNodes[index];

  // Remove node
  if (!newVdom) {
    if (existingEl) {
      parent.removeChild(existingEl);
    }
    return;
  }

  // Add node
  if (!oldVdom) {
    const newEl = createDOMElement(newVdom);
    parent.appendChild(newEl);
    return;
  }

  // Replace node if types or tags differ
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

  // Handle text updates
  if (typeof newVdom === "string" || typeof newVdom === "number") {
    const newText = String(newVdom);
    if (existingEl.nodeValue !== newText) {
      existingEl.nodeValue = newText;
    }
    return;
  }

  // Element node: update attributes
  updateAttributes(existingEl, oldVdom.attrs || {}, newVdom.attrs || {});

  // Optimized children diffing with minimal DOM operations
  diffChildren(oldVdom.children || [], newVdom.children || [], existingEl);
}

// Optimized children diffing with better reordering
function diffChildren(oldChildren, newChildren, parent) {
  const oldKeyed = new Map();
  const oldUnkeyed = [];
  const existingNodes = Array.from(parent.childNodes);

  // Build maps for efficient lookup
  existingNodes.forEach((node, i) => {
    const child = oldChildren[i];
    const key = child?.attrs?.key;
    if (key != null) {
      oldKeyed.set(key, { vdom: child, node, index: i });
    } else {
      oldUnkeyed.push({ vdom: child, node, index: i });
    }
  });

  // Track what nodes we want to keep and in what order
  const newNodeOrder = [];
  const nodesToRemove = new Set(existingNodes);

  // Process new children
  newChildren.forEach((newChild, i) => {
    const key = newChild?.attrs?.key;

    if (key != null && oldKeyed.has(key)) {
      // Reuse keyed element
      const { vdom: oldChild, node } = oldKeyed.get(key);
      const currentIndex = existingNodes.indexOf(node);
      diff(oldChild, newChild, parent, currentIndex);
      newNodeOrder.push(node);
      nodesToRemove.delete(node);
      oldKeyed.delete(key);
    } else if (key == null && oldUnkeyed.length > 0) {
      // Reuse unkeyed element
      const { vdom: oldChild, node } = oldUnkeyed.shift();
      const currentIndex = existingNodes.indexOf(node);
      diff(oldChild, newChild, parent, currentIndex);
      newNodeOrder.push(node);
      nodesToRemove.delete(node);
    } else {
      // Create new element
      const newNode = createDOMElement(newChild);
      newNodeOrder.push(newNode);
    }
  });

  // Immediate DOM operations for better responsiveness
  // Remove unused nodes
  nodesToRemove.forEach(node => parent.removeChild(node));

  // Reorder nodes efficiently
  newNodeOrder.forEach((node, i) => {
    const currentNode = parent.childNodes[i];
    if (currentNode !== node) {
      if (node.parentNode !== parent) {
        // New node, insert it
        parent.insertBefore(node, currentNode || null);
      } else {
        // Existing node, move it
        parent.insertBefore(node, currentNode || null);
      }
    }
  });
}

// Export the batcher for advanced use cases
export { domBatcher };