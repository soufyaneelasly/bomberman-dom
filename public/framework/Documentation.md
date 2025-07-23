# Mini Framework Documentation

Welcome to the Mini Framework! This lightweight JavaScript framework provides a simple way to build interactive web applications using a virtual DOM, state management, and routing. This guide will help you understand the framework's features and how to use them effectively.

---

## Table of Contents

1. [Features Overview](#features-overview)
2. [Getting Started](#getting-started)
3. [Creating Elements](#creating-elements)
4. [Nesting Elements](#nesting-elements)
5. [Adding Attributes](#adding-attributes)
6. [Handling Events](#handling-events)
7. [State Management](#state-management)
8. [Routing](#routing)
9. [Design Philosophy](#design-philosophy)

---

## Features Overview

- **Virtual DOM**: Efficiently updates the real DOM by comparing virtual nodes and applying minimal changes.
- **Declarative Element Creation**: Use `createVNode` to describe your UI in a tree-like structure.
- **Event Handling**: Easily attach event handlers to elements.
- **State Management**: Simple global state store with subscription support.
- **Routing**: Basic client-side routing for single-page applications.

---

## Getting Started

Import the core functions from the framework:

```js
import { createVNode, render } from './framework/core.js';
```

---

## Creating Elements

Use `createVNode(tag, attrs, children)` to create virtual DOM elements.

**Example: Creating a `<div>`**

```js
const myDiv = createVNode('div', {}, 'Hello, world!');
```

- `tag`: The HTML tag name (e.g., `'div'`, `'span'`, `'button'`).
- `attrs`: An object of attributes (can be empty).
- `children`: A string, number, or array of child nodes.

---

## Nesting Elements

You can nest elements by passing an array of children.

**Example: Nested Structure**

```js
const nested = createVNode('div', { class: 'container' }, [
  createVNode('h1', {}, 'Title'),
  createVNode('p', {}, 'This is a paragraph.'),
  createVNode('button', {}, 'Click me')
]);
```

---

## Adding Attributes

Attributes are passed as the second argument to `createVNode`.

**Example: Adding Classes, IDs, and Custom Attributes**

```js
const input = createVNode('input', {
  type: 'text',
  id: 'username',
  class: 'input-field',
  placeholder: 'Enter your name'
});
```

---

## Handling Events

Event handlers are added as attributes starting with `on`, such as `onclick`, `oninput`, etc.

**Example: Button with Click Event**

```js
const button = createVNode('button', {
  onclick: () => alert('Button clicked!')
}, 'Click Me');
```

**How it works:**  
The framework sets the event handler directly on the DOM element when rendering.

---

## Rendering to the DOM

Use the `render(vnode, container)` function to render your virtual node tree to a real DOM element.

**Example: Render to `<body>`**

```js
render(myDiv, document.body);
```

---

## State Management

The framework provides a simple global state store.

**Example: Using the Store**

```js
import { store } from './framework/state.js';

// Set initial state
store.setState({ count: 0 });

// Subscribe to state changes
store.subscribe(() => {
  render(App(), document.getElementById('root'));
});

// Update state
store.setState({ count: store.getState().count + 1 });
```

---

## Routing

The framework includes a basic router for single-page applications.

**Example: Setting Up Routes**

```js
import { Router } from './framework/routers.js';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '*', component: NotFound }
];

const router = new Router(routes, document.getElementById('root'));
```

**Creating Links:**

```js
router.link('/about', 'About Page');
```

---

## Design Philosophy

- **Declarative UI**: Describe what you want, not how to do it.
- **Minimal API**: Only a few core functions to learn.
- **Predictable Updates**: Virtual DOM diffing ensures efficient and predictable UI updates.
- **Explicit State**: State is managed in a single store, making data flow easy to reason about.
- **Direct Event Binding**: Events are attached directly to DOM nodes for simplicity.

---

## Why Things Work This Way

- **Virtual DOM**: By using a virtual DOM, the framework minimizes direct DOM manipulations, which are slow. Instead, it calculates the minimal set of changes needed and applies them efficiently.
- **Declarative Creation**: Using `createVNode` makes your UI structure clear and easy to maintain.
- **Direct Event Binding**: Attaching events as attributes keeps your code close to the elements they affect.
- **Global State**: A simple store pattern makes it easy to share and update state across your app.
- **Routing**: The router listens to browser history events and renders the correct component, enabling SPA navigation without full page reloads.

---

## Full Example

```js
import { createVNode, render } from './framework/core.js';
import { store } from './framework/state.js';

function App() {
  const { count } = store.getState();
  return createVNode('div', {}, [
    createVNode('h1', {}, `Count: ${count}`),
    createVNode('button', {
      onclick: () => store.setState({ count: count + 1 })
    }, 'Increment')
  ]);
}

store.subscribe(() => render(App(), document.body));
store.setState({ count: 0 }); // Initial render
```

---

Happy coding! 