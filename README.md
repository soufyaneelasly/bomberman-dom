# Bomberman DOM (with Custom Mini-Framework)

## Project Overview
This is a multiplayer Bomberman game built **entirely with a custom mini-framework** for the frontend. The project was designed to:
- **Avoid using canvas, WebGL, or any external frameworks** (like React, Vue, etc.).
- Showcase how a homegrown mini-framework can power a real-time, interactive game.
- Meet strict requirements for performance (60fps), reactivity, and maintainability.

---

## How the Mini-Framework is Implemented and Used

### What is the Mini-Framework?
Our mini-framework is a lightweight JavaScript library that provides:
- **Reactive state management** (like a simple Redux or Vuex)
- **Virtual DOM rendering** (like React or Vue)
- **Declarative component structure**
- **Event handling** via virtual DOM attributes

It was designed to replace the need for external frameworks and to meet the project’s requirement of “using your own framework.”

### State Management
- The game’s entire state (UI, players, map, bombs, power-ups, explosions, chat, etc.) is stored in a single **reactive store**:
  ```js
  const store = MiniFramework.createReactiveStore({
    screen: 'nickname',
    nickname: '',
    playerCount: 0,
    players: [],
    mapArray: [],
    bombs: [],
    powerUps: [],
    explosions: [],
    animationTick: 0,
    gameStatus: 'waiting',
    // ...other state
  });
  ```
- **Reactivity:** When you call `store.setState({...})`, the mini-framework automatically triggers a re-render of the UI.

### Virtual DOM and Components
- **Components** are plain JavaScript functions that return a virtual DOM object (a JS object describing the tag, attributes, and children).
- Example:
  ```js
  function PlayerComponent(player) {
    return {
      tag: 'div',
      attrs: { class: 'player', style: '...' },
      children: [/* ... */]
    };
  }
  ```
- The **main app** is composed of components:
  - `App` → `GameScreen` → `MapComponent`, `PlayerComponent`, `BombComponent`, `PowerUpComponent`, `ExplosionComponent`, `PlayerHeaderComponent`, `ChatComponent`, `FpsCounterComponent`, etc.

### Rendering and Diffing
- The mini-framework takes the virtual DOM tree and **renders it to the real DOM**.
- On every state change, it **diffs** the new virtual DOM against the previous one and **updates only what changed** in the real DOM (efficient patching).
- This means you never manually call `document.createElement` or `appendChild` for game entities.

### Event Handling
- **Events** (like `onkeydown`, `onkeyup`, `onclick`) are attached as properties in the virtual DOM:
  ```js
  {
    tag: 'div',
    attrs: {
      onkeydown: handleKeyDown,
      onkeyup: handleKeyUp,
      // ...
    },
    children: [ ... ]
  }
  ```
- The mini-framework attaches these handlers to the real DOM elements when rendering.
- This allows for component-scoped event handling (e.g., only the game canvas listens for keyboard events when active).

### Game Loop & Animation
- The game loop uses `requestAnimationFrame` to update animation state (e.g., player sprite frames) and trigger re-renders via a dummy `animationTick` in the store.
- All rendering is still handled by the mini-framework; the game loop only manages animation state and FPS calculation.

### All Game Entities and UI as Components
- **Map**: Rendered as a grid of `TileComponent` instances, each representing a wall, grass, or destructible block.
- **Players**: Each player is rendered by `PlayerComponent`, which handles sprite animation and nickname display.
- **Bombs, Power-ups, Explosions**: Each is rendered by its own component, positioned and styled according to game state.
- **Header**: The player's stats (bombs, lives, speed, flame/range) are shown in a styled header using icons.
- **Chat**: The chat UI is a component, fully reactive to state changes.
- **FPS Counter**: A component displays the current frames per second in the corner.

### Benefits & Challenges

#### Benefits
- **Full reactivity**: Any change in game state is immediately reflected in the UI.
- **Maintainability**: The codebase is modular, with clear separation of concerns via components.
- **Performance**: The game runs at 60fps, with efficient DOM updates and an FPS counter for monitoring.
- **No external dependencies**: The project is lightweight and easy to audit.

#### Challenges
- **Real-time animation**: Integrating smooth animation with a reactive framework required careful management of animation state and re-render triggers.
- **Event handling**: Ensuring keyboard events worked only when the game was active, and not globally, required focus management.
- **Map rendering**: Optimizing map and entity rendering for performance without canvas or WebGL.

---

## Tips for Future Developers
- Keep all game state in the store for maximum reactivity.
- Use the mini-framework's event system for all UI and game input.
- Use components for every game entity and UI element.
- For performance, avoid unnecessary state updates and keep components as stateless as possible.
- Use the FPS counter to monitor and optimize rendering.

---

**This project demonstrates that even a simple custom framework can power a real-time multiplayer game with modern, maintainable code!** 