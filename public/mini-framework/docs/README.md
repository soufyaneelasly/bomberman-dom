# MiniFramework Documentation

`MiniFramework` is a lightweight JavaScript framework for building single-page applications with DOM abstraction, state management, event handling, and routing. It inverts control by managing the application lifecycle and calling user-defined functions for rendering and state updates.

## Features

- **DOM Abstraction**: Represents the UI as JavaScript objects, rendered efficiently to the real DOM.
- **State Management**: Provides a reactive store to manage global state and trigger re-renders.
- **Event Handling**: Custom event system for handling user interactions without `addEventListener`.
- **Routing**: Hash-based routing to synchronize app state with the URL.

## Getting Started

1. **Setup**:
   - Place your app in a folder with `index.html`, `src/framework.js`, and `src/app.js`.
   - Include `framework.js` in your app using ES modules:
     ```html
     <script type="module" src="src/app.js"></script>
     ```

2. **Run the App**:
   - Serve the folder using a static server (e.g., `python -m http.server`).
   - Access the app in a browser at `http://localhost:8000`.

## Usage

### Creating an Element

Elements are defined as JavaScript objects with `tag`, `attrs`, and `children` properties.

```javascript
import MiniFramework from './framework.js';
const { render } = MiniFramework;

const element = {
  tag: 'div',
  attrs: { class: 'container' },
  children: [
    { tag: 'h1', children: ['Hello, World!'] },
    { tag: 'p', children: ['This is a paragraph.'] }
  ]
};

render(element, document.getElementById('app'));
```

**Explanation**: The `render` function converts the object into DOM elements and appends them to the specified container. The `tag` specifies the HTML element, `attrs` defines attributes, and `children` can be strings (text nodes) or nested elements.

### Adding Attributes

Attributes are defined in the `attrs` object. Event handlers use the `on` prefix (e.g., `onclick`).

```javascript 
const button = {
  tag: 'button',
  attrs: {
    class: 'btn',
    onclick: () => alert('Clicked!')
  },
  children: ['Click Me']
};
```

**Explanation**: Attributes are applied using `setAttribute`, except for event handlers, which are managed by the framework's event system.

### Nesting Elements

Children can be nested within the `children` array.

```javascript
const nested = {
  tag: 'div',
  attrs: { class: 'parent' },
  children: [
    {
      tag: 'div',
      attrs: { class: 'child' },
      children: ['Nested content']
    }
  ]
};
```

**Explanation**: The framework recursively processes `children`, creating a tree of DOM elements.

### Creating an Event

Events are defined using `on<eventName>` attributes in the `attrs` object.

```javascript
import MiniFramework from './framework.js';
const { render } = MiniFramework;

const element = {
  tag: 'input',
  attrs: {
    type: 'text',
    onkeydown: (e) => {
      if (e.key === 'Enter') {
        console.log('Enter pressed:', e.target.value);
      }
    }
  }
};

render(element, document.getElementById('app'));
```

**Explanation**: The framework uses a custom event system (`on`) that attaches a single global listener to the document and delegates events based on `data-` attributes, avoiding direct `addEventListener` calls.

### State Management

Use `createReactiveStore` to manage global state and `subscribe` to trigger re-renders.

```javascript
import MiniFramework from './framework.js';
const { createReactiveStore, render, setRenderCallback } = MiniFramework;

const store = createReactiveStore({ count: 0 });

function App() {
  const state = store.getState();
  return {
    tag: 'div',
    children: [
      { tag: 'span', children: [`Count: ${state.count}`] },
      {
        tag: 'button',
        attrs: { onclick: () => store.setState({ count: state.count + 1 }) },
        children: ['Increment']
      }
    ]
  };
}

setRenderCallback(() => render(App(), document.getElementById('app')));
store.subscribe(() => render(App(), document.getElementById('app')));
```

**Explanation**: `createReactiveStore` creates a reactive store. `setState` updates the state and notifies subscribers, triggering a re-render.

### Routing

The routing system uses hash-based navigation to synchronize state with the URL.

```javascript
import MiniFramework from './framework.js';
const { addRoute, navigate, initializeRouting, createReactiveStore, render } = MiniFramework;

const store = createReactiveStore({ view: 'home' });

addRoute('#/', () => store.setState({ view: 'home' }));
addRoute('#/about', () => store.setState({ view: 'about' }));

function App() {
  const state = store.getState();
  return {
    tag: 'div',
    children: [
      {
        tag: 'a',
        attrs: { href: '#/', onclick: (e) => { e.preventDefault(); navigate('#/'); } },
        children: ['Home']
      },
      {
        tag: 'a',
        attrs: { href: '#/about', onclick: (e) => { e.preventDefault(); navigate('#/about'); } },
        children: ['About']
      },
      { tag: 'p', children: [`Current view: ${state.view}`] }
    ]
  };
}

render(App(), document.getElementById('app'));
store.subscribe(() => render(App(), document.getElementById('app')));
initializeRouting();
```

**Explanation**: `addRoute` maps hash paths to callbacks that update the state. `navigate` changes the URL hash, and `initializeRouting` handles initial and hash change events.

## Why It Works This Way

- **DOM Abstraction**: Using JavaScript objects simplifies UI declaration and enables efficient rendering by rebuilding only the changed DOM.
- **State Management**: The reactive store centralizes state, ensuring consistency across components and triggering re-renders only when necessary.
- **Event Handling**: The custom `on` function uses a single global listener for performance, delegating events based on `data-` attributes to avoid multiple `addEventListener` calls.
- **Routing**: Hash-based routing is lightweight and works well for single-page apps, syncing state with the URL without server-side changes.

## TodoMVC Example

The TodoMVC app in `src/app.js` demonstrates all features:
- **DOM**: The UI is built using nested element objects.
- **State**: A reactive store manages todos and filter state.
- **Events**: Custom events handle input, clicks, and keypresses.
- **Routing**: Hash routes (`#/`, `#/active`, `#/completed`) toggle the filter state.

Run the app by serving the folder and accessing `index.html`. Click the filter links to toggle views, synchronized with the URL hash.