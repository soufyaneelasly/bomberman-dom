// ========== Internal State ==========
const targetMap = new WeakMap()
const reactiveCache = new WeakMap()
let activeEffect = null
const effectStack = []

// ========== effect ==========
export function effect(fn, options = {}) {
  const wrappedEffect = () => {
    cleanup(wrappedEffect)
    activeEffect = wrappedEffect
    effectStack.push(wrappedEffect)
    try {
      return fn()
    } finally {
      effectStack.pop()
      activeEffect = effectStack[effectStack.length - 1]
    }
  }
  wrappedEffect.deps = []
  wrappedEffect.options = options

  if (!options.lazy) {
    if (options.scheduler) {
      options.scheduler(wrappedEffect)
    } else {
      wrappedEffect()
    }
  }

  return wrappedEffect
}

function cleanup(effectFn) {
  effectFn.deps.forEach(dep => dep.delete(effectFn))
  effectFn.deps.length = 0
}

// ========== track & trigger ==========
export function track(target, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  if (!deps.has(activeEffect)) {
    deps.add(activeEffect)
    activeEffect.deps.push(deps)
  }
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const deps = depsMap.get(key)
  const effectsToRun = new Set()
  
  if (deps) {
    deps.forEach(effect => effectsToRun.add(effect))
  }
  
  // For arrays, also trigger length dependencies when array methods are used
  if (Array.isArray(target)) {
    if (key !== 'length') {
      const lengthDeps = depsMap.get('length')
      if (lengthDeps) {
        lengthDeps.forEach(effect => effectsToRun.add(effect))
      }
    }
    
    // Also trigger index-based dependencies for array mutations
    if (key === 'length' || typeof key === 'number' || key === 'push' || key === 'pop' || key === 'splice' || key === 'unshift' || key === 'shift') {
      // Trigger all numeric indices that might be affected
      for (let [depKey, depSet] of depsMap.entries()) {
        if (typeof depKey === 'number' || depKey === 'length') {
          depSet.forEach(effect => effectsToRun.add(effect))
        }
      }
    }
  }
  
  effectsToRun.forEach(effect => {
    if (effect !== activeEffect) {
      if (effect.options.scheduler) {
        effect.options.scheduler(effect)
      } else {
        effect()
      }
    }
  })
}

export function reactive(obj) {
  if (obj === null || typeof obj !== 'object') return obj

  const existingProxy = reactiveCache.get(obj)
  if (existingProxy) return existingProxy

  const proxy = new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      track(target, key)
      
      // Intercept array mutation methods to ensure proper reactivity
      if (Array.isArray(target) && typeof res === 'function' && ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].includes(key)) {
        return function(...args) {
          const result = res.apply(this, args)
          trigger(target, 'length')
          trigger(target, key)
          return result
        }
      }
      
      if (typeof res === 'object' && res !== null) {
        return reactive(res)
      }
      return res
    },

    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      
      if (oldValue !== value) {
        trigger(target, key)
        
        // For arrays, also trigger length changes
        if (Array.isArray(target) && key !== 'length') {
          trigger(target, 'length')
        }
      }
      return result
    },

    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      const result = Reflect.deleteProperty(target, key)
      if (hadKey && result) {
        trigger(target, key)
        
        // For arrays, also trigger length changes
        if (Array.isArray(target)) {
          trigger(target, 'length')
        }
      }
      return result
    }
  })

  reactiveCache.set(obj, proxy)
  return proxy
}

export function ref(value) {
  const refObject = {
    __isRef: true,
    get value() {
      track(refObject, 'value')
      return value
    },
    set value(newValue) {
      if (newValue !== value) {
        value = newValue
        trigger(refObject, 'value')
      }
    }
  }
  return refObject
}

export function isRef(obj) {
  return obj && typeof obj === 'object' && obj.__isRef === true
}

export function computed(getter) {
  let value
  let dirty = true
  let computedRef

  const runner = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true
        trigger(computedRef, 'value')
      }
    }
  })

  computedRef = {
    __isRef: true,
    get value() {
      if (dirty) {
        value = runner()
        dirty = false
      }
      track(computedRef, 'value')
      return value
    }
  }

  return computedRef
}

function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return
  seen.add(value)
  for (const key in value) {
    traverse(value[key], seen)
  }
  return value
}

export function watch(source, callback, options = {}) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else if (isRef(source)) {
    getter = () => source.value
  } else {
    getter = () => source
  }

  if (options.deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  let oldValue
  const job = () => {
    const newValue = effectFn()
    if (newValue !== oldValue || options.deep) {
      callback(newValue, oldValue)
      oldValue = newValue
    }
  }

  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (options.flush === 'sync') {
        job()
      } else {
        Promise.resolve().then(job)
      }
    }
  })

  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }

  return () => {
    cleanup(effectFn)
  }
}
