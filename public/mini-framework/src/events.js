//mini-framework/src/dom.js

export  function addEvent(element, eventType, handler) {
  element[eventType] = handler;

  return () => {
    element[eventType] = null;
  };
}
