import { localStorage, STORAGE_KEYS } from './localStorage';

const DEFAULT_USER = {
  id: 'demo-user-001',
  email: 'd@gmail.com',
  password: 'Qwerty1#',
  user_metadata: {
    full_name: 'Demo User',
  },
  created_at: '2025-01-01T00:00:00.000Z',
};

const DEFAULT_SESSION = {
  access_token: 'demo-token-' + Date.now(),
  refresh_token: 'demo-refresh-' + Date.now(),
  expires_at: Date.now() + 86400000,
  expires_in: 86400,
  token_type: 'bearer',
  user: DEFAULT_USER,
};

const DEFAULT_PROJECTS = [
  {
    id: 'proj-001',
    user_id: DEFAULT_USER.id,
    name: 'Пример проекта',
    description: 'Демонстрационный проект с примером задач',
    status: 'active',
    color: '#4A90D9',
    created_at: '2025-03-01T00:00:00.000Z',
    updated_at: '2025-04-15T00:00:00.000Z',
  },
  {
    id: 'proj-002',
    user_id: DEFAULT_USER.id,
    name: 'Идеи для реализации',
    description: 'Список идей для будущих проектов',
    status: 'active',
    color: '#7B68EE',
    created_at: '2025-03-15T00:00:00.000Z',
    updated_at: '2025-04-20T00:00:00.000Z',
  },
];

const DEFAULT_TASKS = [
  {
    id: 'task-001',
    project_id: 'proj-001',
    user_id: DEFAULT_USER.id,
    title: 'Настройка окружения разработки',
    description: 'Установить необходимые инструменты и настроить рабочее место',
    status: 'done',
    priority: 'high',
    due_date: '2025-04-10',
    position: 1,
    created_at: '2025-03-01T10:00:00.000Z',
    completed_at: '2025-04-09T15:30:00.000Z',
  },
  {
    id: 'task-002',
    project_id: 'proj-001',
    user_id: DEFAULT_USER.id,
    title: 'Создание базовой структуры проекта',
    description: 'Организовать папки и файлы согласно архитектуре',
    status: 'done',
    priority: 'high',
    due_date: '2025-04-12',
    position: 2,
    created_at: '2025-03-02T09:00:00.000Z',
    completed_at: '2025-04-11T14:20:00.000Z',
  },
  {
    id: 'task-003',
    project_id: 'proj-001',
    user_id: DEFAULT_USER.id,
    title: 'Реализовать основной функционал',
    description: 'Разработать ключевые компоненты приложения',
    status: 'in_progress',
    priority: 'high',
    due_date: '2025-05-01',
    position: 3,
    created_at: '2025-03-05T11:00:00.000Z',
  },
  {
    id: 'task-004',
    project_id: 'proj-001',
    user_id: DEFAULT_USER.id,
    title: 'Написать тесты',
    description: 'Покрыть код unit-тестами',
    status: 'todo',
    priority: 'medium',
    due_date: '2025-05-15',
    position: 4,
    created_at: '2025-03-10T08:00:00.000Z',
  },
  {
    id: 'task-005',
    project_id: 'proj-001',
    user_id: DEFAULT_USER.id,
    title: 'Документация',
    description: 'Написать документацию по API',
    status: 'todo',
    priority: 'low',
    due_date: '2025-05-20',
    position: 5,
    created_at: '2025-03-10T08:30:00.000Z',
  },
  {
    id: 'task-006',
    project_id: 'proj-002',
    user_id: DEFAULT_USER.id,
    title: 'Изучить новый фреймворк',
    description: 'Провести исследование возможностей',
    status: 'in_progress',
    priority: 'medium',
    due_date: '2025-05-10',
    position: 1,
    created_at: '2025-03-20T10:00:00.000Z',
  },
  {
    id: 'task-007',
    project_id: 'proj-002',
    user_id: DEFAULT_USER.id,
    title: 'Создать MVP',
    description: 'Минимальная рабочая версия продукта',
    status: 'todo',
    priority: 'high',
    due_date: '2025-06-01',
    position: 2,
    created_at: '2025-03-21T09:00:00.000Z',
  },
];

const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'ru',
  timezone: 'Asia/Qyzylorda',
  notifications: {
    email: false,
    desktop: true,
    taskReminders: true,
  },
  defaultProjectView: 'board',
  workHoursStart: '09:00',
  workHoursEnd: '18:00',
};

const DEFAULT_PROFILE = {
  user_id: DEFAULT_USER.id,
  full_name: 'Demo User',
  email: 'd@gmail.com',
  avatar_url: null,
  bio: 'Демо-пользователь для локального тестирования',
  phone: '+7 (000) 000-00-00',
  position: 'Разработчик',
};

export const initializeDemoData = () => {
  const existingUser = localStorage.get(STORAGE_KEYS.USER);
  const users = localStorage.get(STORAGE_KEYS.USERS) || [];
  let nextUsers = users;
  if (existingUser && !nextUsers.some((user) => user.email === existingUser.email)) {
    nextUsers = [...nextUsers, existingUser];
  }
  if (!nextUsers.some((user) => user.email === DEFAULT_USER.email)) {
    nextUsers = [...nextUsers, DEFAULT_USER];
  }
  if (nextUsers !== users) {
    localStorage.set(STORAGE_KEYS.USERS, nextUsers);
  }

  const projects = localStorage.get(STORAGE_KEYS.PROJECTS) || [];
  const projectIds = new Set(projects.map((project) => project.id));
  const missingDemoProjects = DEFAULT_PROJECTS.filter((project) => !projectIds.has(project.id));
  if (missingDemoProjects.length) {
    localStorage.set(STORAGE_KEYS.PROJECTS, [...projects, ...missingDemoProjects]);
  }

  const tasks = localStorage.get(STORAGE_KEYS.TASKS) || [];
  const demoTaskIds = new Set(DEFAULT_TASKS.map((task) => task.id));
  let didNormalizeTasks = false;
  const normalizedTasks = tasks.map((task) => {
    if (demoTaskIds.has(task.id) && !task.user_id) {
      didNormalizeTasks = true;
      return { ...task, user_id: DEFAULT_USER.id };
    }

    return task;
  });
  const taskIds = new Set(normalizedTasks.map((task) => task.id));
  const missingDemoTasks = DEFAULT_TASKS.filter((task) => !taskIds.has(task.id));
  if (didNormalizeTasks || missingDemoTasks.length) {
    localStorage.set(STORAGE_KEYS.TASKS, [...normalizedTasks, ...missingDemoTasks]);
  }

  if (!existingUser) {
    localStorage.set(STORAGE_KEYS.USER, DEFAULT_USER);
    localStorage.set(STORAGE_KEYS.SESSION, DEFAULT_SESSION);
    localStorage.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    localStorage.set(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    return true;
  }
  return false;
};

export const resetDemoData = () => {
  localStorage.clear();
  return initializeDemoData();
};

export const getDemoUser = () => localStorage.get(STORAGE_KEYS.USER);
export const getDemoSession = () => localStorage.get(STORAGE_KEYS.SESSION);

export { DEFAULT_USER, DEFAULT_SESSION, DEFAULT_PROJECTS, DEFAULT_TASKS, DEFAULT_SETTINGS, DEFAULT_PROFILE };
