import { supabase } from '../lib/supabaseClient';
import { isLocalMode } from '../lib/apiAdapter';
import { localAnalyticsApi } from '../lib/localApis';
import { getSupabaseErrorMessage } from './supabaseErrors';
import { isTaskOverdue } from '../utils/deadline';

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message || 'Не удалось получить текущего пользователя.');
  if (!data.user) throw new Error('Пользователь не авторизован.');
  return data.user.id;
};

const throwIfError = (error, fallbackMessage) => {
  if (error) throw new Error(getSupabaseErrorMessage(error, fallbackMessage));
};

const toDateKey = (date) => date.toISOString().slice(0, 10);

const getLast14Days = () => {
  const days = [];
  for (let index = 13; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    days.push(toDateKey(date));
  }
  return days;
};

const countByField = (items, field) => items.reduce((acc, item) => {
  const key = item[field] || 'unknown';
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

export const getAnalyticsData = async () => {
  if (isLocalMode()) return localAnalyticsApi.getAnalyticsData();

  const userId = await getCurrentUserId();
  const days = getLast14Days();

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  throwIfError(tasksError, 'Не удалось загрузить задачи для аналитики.');

  const cleanTasks = tasks || [];
  const completedTasks = cleanTasks.filter((task) => task.status === 'done');
  const overdueTasks = cleanTasks.filter((task) => isTaskOverdue(task));

  const completedByDay = days.map((day) => ({
    date: day,
    count: cleanTasks.filter((task) => task.completed_at?.slice(0, 10) === day).length,
  }));

  const createdByDay = days.map((day) => ({
    date: day,
    count: cleanTasks.filter((task) => task.created_at?.slice(0, 10) === day).length,
  }));

  const completedLast14Days = completedByDay.reduce((total, day) => total + day.count, 0);
  const mostProductiveDay = completedByDay.reduce((bestDay, day) => (day.count > bestDay.count ? day : bestDay), completedByDay[0] || { date: null, count: 0 });

  return {
    totalTasks: cleanTasks.length,
    completedTasks: completedTasks.length,
    overdueTasks: overdueTasks.length,
    tasksByStatus: countByField(cleanTasks, 'status'),
    tasksByPriority: countByField(cleanTasks, 'priority'),
    completedByDay,
    createdByDay,
    completionRate: cleanTasks.length ? Math.round((completedTasks.length / cleanTasks.length) * 100) : 0,
    averageTasksCompletedPerDay: Number((completedLast14Days / days.length).toFixed(2)),
    mostProductiveDay,
  };
};
