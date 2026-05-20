// Local storage service for offline/demo mode
const STORAGE_KEYS = {
  USERS: 'local_users',
  USER: 'local_user',
  SESSION: 'local_session',
  PROJECTS: 'local_projects',
  TASKS: 'local_tasks',
  ROUTINES: 'local_routines',
  TASK_TAGS: 'local_task_tags',
  SETTINGS: 'local_settings',
  PROFILE: 'local_profile',
};

export const localStorage = {
  get: (key) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove: (key) => {
    window.localStorage.removeItem(key);
  },

  clear: () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
  },
};

export { STORAGE_KEYS };

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const getTimestamp = () => new Date().toISOString();
