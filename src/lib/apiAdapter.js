// API adapter that uses local storage when Supabase is not configured
import { localStorage, STORAGE_KEYS, generateId, getTimestamp } from './localStorage';
import { DEFAULT_USER } from './demoData';
import { getSupabaseConfigStatus } from './supabaseClient';

let authListeners = [];

const isLocalMode = () => {
  const config = getSupabaseConfigStatus();
  return !config.hasUrl || !config.hasAnonKey;
};

const createLocalSession = (user) => ({
  access_token: 'local-token-' + Date.now(),
  refresh_token: 'local-refresh-' + Date.now(),
  expires_at: Date.now() + 86400000,
  expires_in: 86400,
  token_type: 'bearer',
  user,
});

const getCurrentLocalUser = () => localStorage.get(STORAGE_KEYS.USER) || DEFAULT_USER;
const getCurrentLocalUserId = () => getCurrentLocalUser()?.id || DEFAULT_USER.id;
const belongsToCurrentUser = (item) => item?.user_id === getCurrentLocalUserId();
const getWorkspaceProjectId = () => {
  const userId = getCurrentLocalUserId();
  const projects = localStorage.get(STORAGE_KEYS.PROJECTS) || [];
  const existingProject = projects.find((project) => (
    project.user_id === userId && project.name === 'Workspace'
  ));

  if (existingProject) {
    return existingProject.id;
  }

  const workspaceProject = {
    id: generateId(),
    user_id: userId,
    name: 'Workspace',
    description: 'Internal workspace for standalone tasks.',
    color: '#4A90D9',
    status: 'active',
    priority: 'medium',
    created_at: getTimestamp(),
    updated_at: getTimestamp(),
  };

  localStorage.set(STORAGE_KEYS.PROJECTS, [...projects, workspaceProject]);
  return workspaceProject.id;
};

export const notifyAuthListeners = (event, session) => {
  authListeners.forEach(({ callback }) => {
    try {
      callback(event, session);
    } catch (e) {
      console.error('Auth listener error:', e);
    }
  });
};

// Local Auth API
export const localAuthApi = {
  signUp: async ({ email, password, options }) => {
    const users = localStorage.get(STORAGE_KEYS.USERS) || [];
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const user = {
      id: generateId(),
      email,
      user_metadata: {
        full_name: options?.data?.full_name || email.split('@')[0],
      },
      password,
      created_at: getTimestamp(),
    };

    const session = createLocalSession(user);

    localStorage.set(STORAGE_KEYS.USERS, [...users, user]);
    localStorage.set(STORAGE_KEYS.USER, user);
    localStorage.set(STORAGE_KEYS.SESSION, session);
    notifyAuthListeners('SIGNED_IN', session);

    return { user, session };
  },

  signInWithPassword: async ({ email, password }) => {
    const users = localStorage.get(STORAGE_KEYS.USERS) || [];
    const currentUser = localStorage.get(STORAGE_KEYS.USER);
    const user = users.find((storedUser) => storedUser.email === email) ||
      (currentUser?.email === email ? currentUser : null);
    
    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    if (user.email !== email) {
      throw new Error('Неверный email или пароль');
    }

    if (user.password && user.password !== password) {
      throw new Error('Неверный email или пароль');
    }

    const session = createLocalSession(user);
    localStorage.set(STORAGE_KEYS.SESSION, session);
    localStorage.set(STORAGE_KEYS.USER, user);
    notifyAuthListeners('SIGNED_IN', session);

    return { user, session };
  },

  signOut: async () => {
    localStorage.remove(STORAGE_KEYS.SESSION);
    notifyAuthListeners('SIGNED_OUT', null);
  },

  getSession: async () => localStorage.get(STORAGE_KEYS.SESSION),
  getUser: async () => getCurrentLocalUser(),

  updateUser: async ({ data }) => {
    const user = localStorage.get(STORAGE_KEYS.USER);
    if (!user) throw new Error('Пользователь не авторизован');

    const updatedUser = {
      ...user,
      user_metadata: { ...user.user_metadata, ...data },
    };

    const users = localStorage.get(STORAGE_KEYS.USERS) || [];
    localStorage.set(
      STORAGE_KEYS.USERS,
      users.map((storedUser) => (storedUser.id === updatedUser.id ? updatedUser : storedUser)),
    );
    localStorage.set(STORAGE_KEYS.USER, updatedUser);
    const session = localStorage.get(STORAGE_KEYS.SESSION);
    if (session) localStorage.set(STORAGE_KEYS.SESSION, { ...session, user: updatedUser });

    notifyAuthListeners('USER_UPDATED', updatedUser);
    return updatedUser;
  },

  onAuthStateChange: (callback) => {
    const id = Date.now().toString();
    authListeners.push({ id, callback });
    return { unsubscribe: () => { authListeners = authListeners.filter((l) => l.id !== id); } };
  },
};

// Local Projects API
export const localProjectsApi = {
  getUser: async () => getCurrentLocalUser(),

  getProjects: async () => {
    const projects = localStorage.get(STORAGE_KEYS.PROJECTS) || [];
    return projects.filter((project) => belongsToCurrentUser(project) && project.status !== 'archived');
  },

  getProject: async (id) => {
    const projects = localStorage.get(STORAGE_KEYS.PROJECTS) || [];
    const project = projects.find((item) => item.id === id && belongsToCurrentUser(item));
    if (!project) throw new Error('Проект не найден');

    const tasks = localStorage.get(STORAGE_KEYS.TASKS) || [];
    const projectTasks = tasks.filter((task) => task.project_id === id && belongsToCurrentUser(task));

    return {
      ...project,
      tasks: projectTasks,
      taskCount: projectTasks.length,
      completedTaskCount: projectTasks.filter((t) => t.status === 'done').length,
    };
  },

  createProject: async (data) => {
    const projects = localStorage.get(STORAGE_KEYS.PROJECTS) || [];
    const userId = getCurrentLocalUserId();

    const newProject = {
      id: generateId(),
      ...data,
      user_id: userId,
      status: 'active',
      color: data.color || '#4A90D9',
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    };

    projects.push(newProject);
    localStorage.set(STORAGE_KEYS.PROJECTS, projects);
    return { ...newProject, taskCount: 0, completedTaskCount: 0 };
  },

  updateProject: async (id, data) => {
    const projects = localStorage.get(STORAGE_KEYS.PROJECTS) || [];
    const index = projects.findIndex((project) => project.id === id && belongsToCurrentUser(project));
    if (index === -1) throw new Error('Проект не найден');

    const updated = { ...projects[index], ...data, updated_at: getTimestamp() };
    projects[index] = updated;
    localStorage.set(STORAGE_KEYS.PROJECTS, projects);
    return updated;
  },

  archiveProject: async (id) => localProjectsApi.updateProject(id, { status: 'archived' }),

  deleteProject: async (id) => {
    const projects = localStorage.get(STORAGE_KEYS.PROJECTS) || [];
    localStorage.set(STORAGE_KEYS.PROJECTS, projects.filter((project) => !(project.id === id && belongsToCurrentUser(project))));
    return { id };
  },
};

// Local Tasks API
export const localTasksApi = {
  getTasks: async (projectId, filters = {}) => {
    let tasks = (localStorage.get(STORAGE_KEYS.TASKS) || []).filter(belongsToCurrentUser);

    if (projectId) tasks = tasks.filter((t) => t.project_id === projectId);
    if (filters.status) tasks = tasks.filter((t) => t.status === filters.status);
    if (filters.priority) tasks = tasks.filter((t) => t.priority === filters.priority);
    if (filters.search) {
      const search = filters.search.toLowerCase();
      tasks = tasks.filter(
        (t) => t.title.toLowerCase().includes(search) || (t.description && t.description.toLowerCase().includes(search))
      );
    }

    return tasks;
  },

  getAllTasks: async (filters = {}) => {
    let tasks = (localStorage.get(STORAGE_KEYS.TASKS) || []).filter(belongsToCurrentUser);

    if (filters.status) tasks = tasks.filter((t) => t.status === filters.status);
    if (filters.priority) tasks = tasks.filter((t) => t.priority === filters.priority);
    if (filters.search) {
      const search = filters.search.toLowerCase();
      tasks = tasks.filter(
        (t) => t.title.toLowerCase().includes(search) || (t.description && t.description.toLowerCase().includes(search))
      );
    }

    return tasks;
  },

  getTask: async (taskId) => {
    const tasks = localStorage.get(STORAGE_KEYS.TASKS) || [];
    const task = tasks.find((item) => item.id === taskId && belongsToCurrentUser(item));
    if (!task) throw new Error('Задача не найдена');

    return task;
  },

  createTask: async (projectId, data) => {
    const tasks = localStorage.get(STORAGE_KEYS.TASKS) || [];
    const userId = getCurrentLocalUserId();
    const resolvedProjectId = projectId || getWorkspaceProjectId();

    const tasksInProject = tasks.filter((task) => task.project_id === resolvedProjectId && task.user_id === userId && task.status === (data.status || 'todo'));
    const maxPosition = tasksInProject.reduce((max, t) => Math.max(max, t.position || 0), 0);

    const newTask = {
      id: generateId(),
      project_id: resolvedProjectId,
      user_id: userId,
      title: data.title,
      description: data.description || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      due_date: data.due_date || null,
      position: maxPosition + 1,
      created_at: data.created_at || getTimestamp(),
      completed_at: data.completed_at || null,
    };

    tasks.push(newTask);
    localStorage.set(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  },

  updateTask: async (taskId, data) => {
    const tasks = localStorage.get(STORAGE_KEYS.TASKS) || [];
    const index = tasks.findIndex((task) => task.id === taskId && belongsToCurrentUser(task));
    if (index === -1) throw new Error('Задача не найдена');

    const updated = {
      ...tasks[index],
      ...data,
      completed_at: data.status === 'done' ? getTimestamp() : tasks[index].completed_at,
    };

    tasks[index] = updated;
    localStorage.set(STORAGE_KEYS.TASKS, tasks);
    return updated;
  },

  deleteTask: async (taskId) => {
    const tasks = localStorage.get(STORAGE_KEYS.TASKS) || [];
    const userId = getCurrentLocalUserId();
    localStorage.set(STORAGE_KEYS.TASKS, tasks.filter((task) => !(task.id === taskId && task.user_id === userId)));

    const tags = localStorage.get(STORAGE_KEYS.TASK_TAGS) || [];
    localStorage.set(STORAGE_KEYS.TASK_TAGS, tags.filter((tag) => !(tag.task_id === taskId && tag.user_id === userId)));

    return { id: taskId };
  },

  updateTaskStatus: async (taskId, status) => localTasksApi.updateTask(taskId, {
    status,
    completed_at: status === 'done' ? getTimestamp() : null,
  }),

  updateTaskPosition: async (taskId, position) => localTasksApi.updateTask(taskId, { position }),

  addTag: async (taskId, tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (!normalizedTag) throw new Error('Тег не может быть пустым');
    const userId = getCurrentLocalUserId();
    const tags = localStorage.get(STORAGE_KEYS.TASK_TAGS) || [];
    const existing = tags.find((item) => item.task_id === taskId && item.user_id === userId && item.tag === normalizedTag);
    if (!existing) {
      tags.push({ task_id: taskId, user_id: userId, tag: normalizedTag });
      localStorage.set(STORAGE_KEYS.TASK_TAGS, tags);
    }
    return { task_id: taskId, tag: normalizedTag };
  },

  removeTag: async (taskId, tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    const userId = getCurrentLocalUserId();
    const tags = localStorage.get(STORAGE_KEYS.TASK_TAGS) || [];
    localStorage.set(STORAGE_KEYS.TASK_TAGS, tags.filter((item) => !(item.task_id === taskId && item.user_id === userId && item.tag === normalizedTag)));
    return { taskId, tag: normalizedTag };
  },
};

export { isLocalMode };
