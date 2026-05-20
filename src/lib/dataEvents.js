export const DATA_EVENTS = {
  tasksChanged: 'map:tasks-changed',
  projectsChanged: 'map:projects-changed',
  routinesChanged: 'map:routines-changed',
};

const emit = (eventName, detail = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

const subscribe = (eventName, handler) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const listener = (event) => handler(event.detail || {});
  window.addEventListener(eventName, listener);

  return () => {
    window.removeEventListener(eventName, listener);
  };
};

export const emitTasksChanged = (detail = {}) => emit(DATA_EVENTS.tasksChanged, detail);

export const emitProjectsChanged = (detail = {}) => emit(DATA_EVENTS.projectsChanged, detail);

export const emitRoutinesChanged = (detail = {}) => emit(DATA_EVENTS.routinesChanged, detail);

export const onTasksChanged = (handler) => subscribe(DATA_EVENTS.tasksChanged, handler);

export const onProjectsChanged = (handler) => subscribe(DATA_EVENTS.projectsChanged, handler);

export const onRoutinesChanged = (handler) => subscribe(DATA_EVENTS.routinesChanged, handler);
