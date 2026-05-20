import { localStorage, STORAGE_KEYS } from './localStorage';
import { getDemoUser, DEFAULT_PROFILE, DEFAULT_SETTINGS, DEFAULT_USER } from './demoData';

const getCurrentUser = () => getDemoUser() || DEFAULT_USER;
const getCurrentUserId = () => getCurrentUser()?.id || DEFAULT_USER.id;
const belongsToCurrentUser = (item) => item?.user_id === getCurrentUserId();

export const localProfileApi = {
  getProfile: async () => {
    const profile = localStorage.get(STORAGE_KEYS.PROFILE);
    if (profile?.user_id === getCurrentUserId()) {
      return profile;
    }

    const currentUser = getCurrentUser();
    return {
      ...DEFAULT_PROFILE,
      user_id: currentUser.id,
      full_name: currentUser.user_metadata?.full_name || currentUser.email,
      email: currentUser.email,
    };
  },

  updateProfile: async (data) => {
    const current = await localProfileApi.getProfile();
    const updated = { ...current, ...data, user_id: getCurrentUserId() };
    localStorage.set(STORAGE_KEYS.PROFILE, updated);

    const user = getCurrentUser();
    if (user) {
      const updatedUser = {
        ...user,
        user_metadata: { ...user.user_metadata, full_name: data.full_name },
      };
      const users = localStorage.get(STORAGE_KEYS.USERS) || [];
      localStorage.set(
        STORAGE_KEYS.USERS,
        users.map((storedUser) => (storedUser.id === updatedUser.id ? updatedUser : storedUser)),
      );
      localStorage.set(STORAGE_KEYS.USER, updatedUser);
    }

    return updated;
  },

  deleteProfile: async () => {
    localStorage.remove(STORAGE_KEYS.PROFILE);
    return { id: getCurrentUserId() };
  },
};

export const localSettingsApi = {
  getSettings: async () => {
    return localStorage.get(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
  },

  updateSettings: async (data) => {
    const current = localStorage.get(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
    const updated = { ...current, ...data };
    localStorage.set(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },
};

export const localDashboardApi = {
  getDashboardData: async () => {
    const tasks = (localStorage.get(STORAGE_KEYS.TASKS) || []).filter(belongsToCurrentUser);
    const today = new Date().toISOString().slice(0, 10);
    const next7Days = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const completedTasks = tasks.filter((t) => t.status === 'done');
    const overdueTasks = tasks.filter((t) => t.due_date && t.due_date < today && t.status !== 'done');
    const dueTodayTasks = tasks.filter((t) => t.due_date === today && t.status !== 'done');
    const upcomingTasks = tasks
      .filter((t) => t.due_date && t.due_date > today && t.due_date <= next7Days && t.status !== 'done')
      .slice(0, 7);

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      dueTodayTasks: dueTodayTasks.length,
      completionRate: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
      tasksDueToday: dueTodayTasks,
      upcomingTasks,
      overdueTaskList: overdueTasks,
    };
  },
};

export const localAnalyticsApi = {
  getAnalyticsData: async () => {
    const tasks = (localStorage.get(STORAGE_KEYS.TASKS) || []).filter(belongsToCurrentUser);
    const today = new Date().toISOString().slice(0, 10);

    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().slice(0, 10));
    }

    const completedTasks = tasks.filter((t) => t.status === 'done');
    const overdueTasks = tasks.filter((t) => t.due_date && t.due_date < today && t.status !== 'done');

    const countByField = (items, field) => items.reduce((acc, item) => {
      acc[item[field] || 'unknown'] = (acc[item[field] || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    const completedByDay = days.map((day) => ({
      date: day,
      count: tasks.filter((t) => t.completed_at?.slice(0, 10) === day).length,
    }));

    const createdByDay = days.map((day) => ({
      date: day,
      count: tasks.filter((t) => t.created_at?.slice(0, 10) === day).length,
    }));

    const completedLast14Days = completedByDay.reduce((total, day) => total + day.count, 0);
    const mostProductiveDay = completedByDay.reduce((best, day) => (day.count > best.count ? day : best), completedByDay[0] || { date: null, count: 0 });

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      tasksByStatus: countByField(tasks, 'status'),
      tasksByPriority: countByField(tasks, 'priority'),
      completedByDay,
      createdByDay,
      completionRate: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
      averageTasksCompletedPerDay: Number((completedLast14Days / days.length).toFixed(2)),
      mostProductiveDay,
    };
  },
};
