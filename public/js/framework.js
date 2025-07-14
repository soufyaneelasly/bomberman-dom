// Mock Mini-Framework - Vanilla JS Implementation
// This will be replaced with your team's actual framework later

class MockFramework {
    constructor() {
        this.state = {};
        this.components = new Map();
        this.eventHandlers = new Map();
        this.routes = new Map();
        this.currentRoute = '/';
        this.stateSubscribers = new Set();
        this.gameLoop = null;
        this.entities = new Map();
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
    }

    // Enhanced DOM Abstraction with Virtual DOM concepts
    createElement(tag, attrs = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.keys(attrs).forEach(key => {
            if (key === 'className') {
                element.className = attrs[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attrs[key];
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, attrs[key]);
            } else if (key === 'style' && typeof attrs[key] === 'object') {
                // Handle style object
                Object.assign(element.style, attrs[key]);
            } else {
                element[key] = attrs[key];
            }
        });
        
        // Add children
        if (typeof children === 'string') {
            element.textContent = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                    element.appendChild(child);
                }
            });
        }
        
        return element;
    }

    // Virtual DOM-like update with diffing
    updateElement(element, newAttrs = {}) {
        Object.keys(newAttrs).forEach(key => {
            if (key === 'className') {
                element.className = newAttrs[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = newAttrs[key];
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, newAttrs[key]);
            } else if (key === 'style' && typeof newAttrs[key] === 'object') {
                Object.assign(element.style, newAttrs[key]);
            } else {
                element[key] = newAttrs[key];
            }
        });
    }

    // Enhanced State Management with reactive updates
    createState(initialState) {
        Object.assign(this.state, initialState);
        return {
            get: (key) => this.state[key],
            set: (key, value) => this.setState(key, value),
            getAll: () => ({ ...this.state }),
            subscribe: (callback) => this.subscribe(callback),
            update: (updates) => {
                Object.keys(updates).forEach(key => {
                    this.setState(key, updates[key]);
                });
            }
        };
    }

    setState(key, value) {
        this.state[key] = value;
        this.notifySubscribers();
    }

    subscribe(callback) {
        this.stateSubscribers.add(callback);
        return () => this.stateSubscribers.delete(callback);
    }

    notifySubscribers() {
        this.stateSubscribers.forEach(callback => callback(this.state));
    }

    // Enhanced Event Handling with custom event system
    on(element, event, handler) {
        const key = `${element.id || 'anonymous'}_${event}`;
        
        if (!this.eventHandlers.has(key)) {
            this.eventHandlers.set(key, []);
        }
        
        this.eventHandlers.get(key).push(handler);
        
        // Custom event handling wrapper
        const wrappedHandler = (e) => {
            // Add framework context to event
            e.framework = this;
            handler(e);
        };
        
        element.addEventListener(event, wrappedHandler);
        
        // Return unsubscribe function
        return () => {
            const handlers = this.eventHandlers.get(key);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
                element.removeEventListener(event, wrappedHandler);
            }
        };
    }

    // Emit custom events
    emit(element, eventName, data) {
        const customEvent = new CustomEvent(eventName, { detail: data });
        element.dispatchEvent(customEvent);
    }

    // Game-specific methods
    createGameEntity(id, x, y, width, height, type = 'entity') {
        const entity = {
            id,
            x,
            y,
            width,
            height,
            type,
            element: null,
            update: null,
            render: null,
            destroy: () => this.removeEntity(id)
        };
        
        this.entities.set(id, entity);
        return entity;
    }

    removeEntity(id) {
        const entity = this.entities.get(id);
        if (entity && entity.element && entity.element.parentNode) {
            entity.element.parentNode.removeChild(entity.element);
        }
        this.entities.delete(id);
    }

    // Game loop with 60 FPS target
    startGameLoop(container, updateCallback, renderCallback) {
        this.gameLoop = (currentTime) => {
            const deltaTime = currentTime - this.lastFrameTime;
            
            if (deltaTime >= this.frameInterval) {
                this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);
                
                // Update game logic
                if (updateCallback) {
                    updateCallback(deltaTime);
                }
                
                // Update all entities
                this.entities.forEach(entity => {
                    if (entity.update) {
                        entity.update(deltaTime);
                    }
                });
                
                // Render
                if (renderCallback) {
                    renderCallback();
                }
            }
            
            requestAnimationFrame(this.gameLoop);
        };
        
        requestAnimationFrame(this.gameLoop);
    }

    stopGameLoop() {
        if (this.gameLoop) {
            this.gameLoop = null;
        }
    }

    // Routing System
    route(path, component) {
        this.routes.set(path, component);
    }

    navigateTo(path) {
        if (this.routes.has(path)) {
            this.currentRoute = path;
            window.history.pushState({}, '', path);
            this.renderRoute(path);
        }
    }

    renderRoute(path) {
        const component = this.routes.get(path);
        if (component) {
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = '';
                if (typeof component === 'function') {
                    const result = component();
                    if (result instanceof HTMLElement) {
                        app.appendChild(result);
                    }
                } else if (component instanceof HTMLElement) {
                    app.appendChild(component);
                }
            }
        }
    }

    // Initialize routing
    initRouter() {
        window.addEventListener('popstate', () => {
            this.currentRoute = window.location.pathname;
            this.renderRoute(this.currentRoute);
        });
    }

    // Enhanced Component system
    createComponent(name, template, props = {}) {
        const component = {
            name,
            template,
            props,
            state: {},
            render: () => {
                if (typeof template === 'function') {
                    return template(props);
                }
                return template;
            },
            setState: (newState) => {
                Object.assign(component.state, newState);
                // Re-render component if needed
            }
        };
        
        this.components.set(name, component);
        return component;
    }

    // Performance monitoring
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    }

    // FPS monitoring
    getFPS() {
        return this.fps;
    }

    setFPS(targetFPS) {
        this.fps = targetFPS;
        this.frameInterval = 1000 / this.fps;
    }

    // Initialize the framework
    init() {
        this.initRouter();
        console.log('Mock Framework initialized');
    }
}

// Create global instance
const Framework = new MockFramework();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Framework;
}

// Make it globally available
window.Framework = Framework;
window.MockFramework = MockFramework;

// Usage Examples:
/*
// Creating game elements
const gameBoard = Framework.createElement('div', {
    className: 'game-board',
    id: 'game-board',
    style: {
        width: '600px',
        height: '400px',
        position: 'relative'
    }
});

// State management
const gameState = Framework.createState({
    players: [],
    bombs: [],
    gameStatus: 'waiting',
    score: 0
});

// Event handling
Framework.on(gameBoard, 'click', (e) => {
    console.log('Game board clicked!', e.framework);
});

// Game entity
const player = Framework.createGameEntity('player1', 100, 100, 30, 30, 'player');
player.render = (container) => {
    if (!player.element) {
        player.element = Framework.createElement('div', {
            className: 'player',
            style: {
                position: 'absolute',
                width: '30px',
                height: '30px',
                backgroundColor: 'red',
                borderRadius: '50%'
            }
        });
    }
    player.element.style.left = player.x + 'px';
    player.element.style.top = player.y + 'px';
    
    if (!player.element.parentNode) {
        container.appendChild(player.element);
    }
};

// Game loop
Framework.startGameLoop(
    gameBoard,
    (deltaTime) => {
        // Update game logic
        console.log('Game update:', deltaTime);
    },
    () => {
        // Render game
        Framework.entities.forEach(entity => {
            if (entity.render) {
                entity.render(gameBoard);
            }
        });
    }
);

// Routing
Framework.route('/', () => {
    return Framework.createElement('div', {}, 'Welcome Page');
});

Framework.route('/game', () => {
    return gameBoard;
});

// Initialize
Framework.init();
*/