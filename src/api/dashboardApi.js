import { supabase } from '../lib/supabaseClient';
import { isLocalMode } from '../lib/apiAdapter';
import { localDashboardApi } from '../lib/localApis';
import { getSupabaseErrorMessage } from './supabaseErrors';
import { getTaskDeadlineDateKey, isTaskOverdue } from '../utils/deadline';

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message || 'Не удалось получить текущего пользователя.');
  if (!data.user) throw new Error('Пользователь не авторизован.');
  return data.user.id;
};

const throwIfError = (error, fallbackMessage) => {
  if (error) throw new Error(getSupabaseErrorMessage(error, fallbackMessage));
};

const getToday = () => new Date().toISOString().slice(0, 10);
const addDays = (dateString, days) => {
  const date = new Date(dateString + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const getDashboardData = async () => {
  if (isLocalMode()) return localDashboardApi.getDashboardData();

  const userId = await getCurrentUserId();
  const today = getToday();
  const nextSevenDays = addDays(today, 7);

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  throwIfError(tasksError, 'Не удалось загрузить задачи для панели.');

  const cleanTasks = tasks || [];
  const completedTasks = cleanTasks.filter((task) => task.status === 'done');
  const overdueTasks = cleanTasks.filter((task) => isTaskOverdue(task));
  const dueTodayTasks = cleanTasks.filter((task) => getTaskDeadlineDateKey(task) === today && task.status !== 'done');
  const upcomingTasks = cleanTasks.filter((task) => {
    const deadlineDate = getTaskDeadlineDateKey(task);
    return deadlineDate && deadlineDate > today && deadlineDate <= nextSevenDays && task.status !== 'done';
  }).slice(0, 7);

  return {
    totalTasks: cleanTasks.length,
    completedTasks: completedTasks.length,
    overdueTasks: overdueTasks.length,
    dueTodayTasks: dueTodayTasks.length,
    completionRate: cleanTasks.length ? Math.round((completedTasks.length / cleanTasks.length) * 100) : 0,
    tasksDueToday: dueTodayTasks,
    upcomingTasks,
    overdueTaskList: overdueTasks,
  };
};
