import * as tasksApi from './tasksApi';
import { isLocalMode } from '../lib/apiAdapter';
import { emitRoutinesChanged } from '../lib/dataEvents';
import { localStorage, STORAGE_KEYS, generateId, getTimestamp } from '../lib/localStorage';
import { DEFAULT_USER } from '../lib/demoData';
import { supabase } from '../lib/supabaseClient';

const DEFAULT_PRIORITY = 'medium';
const DEFAULT_SCHEDULE = 'daily';
let generationPromise = null;

const getToday = () => new Date().toISOString().slice(0, 10);

const toDate = (dateString) => new Date(`${dateString}T00:00:00`);

const toDateString = (date) => date.toISOString().slice(0, 10);

const addDays = (dateString, days) => {
  const date = toDate(dateString);
  date.setDate(date.getDate() + days);
  return toDateString(date);
};

const maxDateString = (...dateStrings) => dateStrings
  .filter(Boolean)
  .sort()
  .at(-1);

const getDaysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();

const getMonthlyDate = (year, monthIndex, dayOfMonth) => {
  const date = new Date(year, monthIndex, Math.min(dayOfMonth, getDaysInMonth(year, monthIndex)));
  return toDateString(date);
};

const getLocalUserId = () => (localStorage.get(STORAGE_KEYS.USER) || DEFAULT_USER)?.id || DEFAULT_USER.id;

const getCurrentUserId = async () => {
  if (isLocalMode()) {
    return getLocalUserId();
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message || 'Не удалось получить текущего пользователя.');
  if (!data.user) throw new Error('Пользователь не авторизован.');
  return data.user.id;
};

const getStoredRoutines = () => localStorage.get(STORAGE_KEYS.ROUTINES) || [];

const setStoredRoutines = (routines) => {
  localStorage.set(STORAGE_KEYS.ROUTINES, routines);
};

const matchesSchedule = (routine, dateString) => {
  const date = toDate(dateString);

  if (routine.schedule === 'weekdays') {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  }

  if (routine.schedule === 'weekly') {
    return date.getDay() === Number(routine.weekday ?? 1);
  }

  if (routine.schedule === 'monthly') {
    return Number(dateString.slice(8, 10)) === Math.min(
      Number(routine.day_of_month || 1),
      getDaysInMonth(date.getFullYear(), date.getMonth()),
    );
  }

  return true;
};

const getFirstDueOnOrAfter = (routine, fromDateString) => {
  const startDate = routine.start_date || getToday();

  if (routine.schedule === 'interval') {
    const interval = Math.max(Number(routine.interval_days || 1), 1);
    let dueDate = startDate;

    while (dueDate < fromDateString) {
      dueDate = addDays(dueDate, interval);
    }

    return dueDate;
  }

  if (routine.schedule === 'monthly') {
    const dayOfMonth = Number(routine.day_of_month || toDate(startDate).getDate());
    const fromDate = toDate(fromDateString > startDate ? fromDateString : startDate);
    const currentMonthDue = getMonthlyDate(fromDate.getFullYear(), fromDate.getMonth(), dayOfMonth);

    if (currentMonthDue >= fromDateString && currentMonthDue >= startDate) {
      return currentMonthDue;
    }

    return getMonthlyDate(fromDate.getFullYear(), fromDate.getMonth() + 1, dayOfMonth);
  }

  let dueDate = fromDateString > startDate ? fromDateString : startDate;
  for (let day = 0; day < 370; day += 1) {
    if (matchesSchedule(routine, dueDate)) {
      return dueDate;
    }
    dueDate = addDays(dueDate, 1);
  }

  return dueDate;
};

const getFirstDueAfter = (routine, fromDateString) => (
  getFirstDueOnOrAfter(routine, addDays(fromDateString, 1))
);

const getNextDueAfter = (routine, dueDateString) => {
  if (routine.schedule === 'interval') {
    return addDays(dueDateString, Math.max(Number(routine.interval_days || 1), 1));
  }

  if (routine.schedule === 'monthly') {
    const date = toDate(dueDateString);
    return getMonthlyDate(
      date.getFullYear(),
      date.getMonth() + 1,
      Number(routine.day_of_month || date.getDate()),
    );
  }

  let nextDate = addDays(dueDateString, routine.schedule === 'weekly' ? 7 : 1);

  if (routine.schedule === 'weekdays') {
    while (!matchesSchedule(routine, nextDate)) {
      nextDate = addDays(nextDate, 1);
    }
  }

  return nextDate;
};

const normalizeRoutine = (data, userId, currentRoutine = null) => {
  const now = getTimestamp();
  const startDate = data.start_date || currentRoutine?.start_date || getToday();
  const schedule = data.schedule || currentRoutine?.schedule || DEFAULT_SCHEDULE;
  const defaultWeekday = toDate(startDate).getDay() || 1;
  const routine = {
    ...currentRoutine,
    ...data,
    id: currentRoutine?.id || generateId(),
    user_id: userId,
    title: data.title?.trim() || currentRoutine?.title || '',
    description: data.description?.trim() || '',
    schedule,
    priority: data.priority || currentRoutine?.priority || DEFAULT_PRIORITY,
    start_date: startDate,
    weekday: Number(data.weekday ?? currentRoutine?.weekday ?? defaultWeekday),
    day_of_month: Number(data.day_of_month ?? currentRoutine?.day_of_month ?? toDate(startDate).getDate()),
    interval_days: Math.max(Number(data.interval_days ?? currentRoutine?.interval_days ?? 1), 1),
    is_paused: Boolean(data.is_paused ?? currentRoutine?.is_paused ?? false),
    active_task_id: currentRoutine?.active_task_id || null,
    active_due_date: currentRoutine?.active_due_date || null,
    streak: currentRoutine?.streak || 0,
    last_completed_date: currentRoutine?.last_completed_date || null,
    created_at: currentRoutine?.created_at || now,
    updated_at: now,
  };

  return {
    ...routine,
    next_due_date: routine.active_task_id
      ? routine.next_due_date
      : getFirstDueOnOrAfter(routine, currentRoutine?.next_due_date || startDate),
  };
};

const updateRoutineCompletion = (routine, task) => {
  const completedDate = task.completed_at?.slice(0, 10) || getToday();
  const previousDueDate = routine.active_due_date || task.due_date || routine.next_due_date || completedDate;
  const nextScheduleBaseDate = maxDateString(previousDueDate, completedDate);
  const expectedPreviousCompletion = routine.last_completed_date
    ? getNextDueAfter(routine, routine.last_completed_date)
    : null;
  const keepsStreak = !routine.last_completed_date || expectedPreviousCompletion === previousDueDate;

  return {
    ...routine,
    active_task_id: null,
    active_due_date: null,
    last_completed_date: previousDueDate,
    last_completed_at: task.completed_at || getTimestamp(),
    streak: keepsStreak ? (routine.streak || 0) + 1 : 1,
    next_due_date: getFirstDueAfter(routine, nextScheduleBaseDate),
    updated_at: getTimestamp(),
  };
};

export const getRoutines = async () => {
  const userId = await getCurrentUserId();
  return getStoredRoutines()
    .filter((routine) => routine.user_id === userId)
    .sort((first, second) => (first.next_due_date || '').localeCompare(second.next_due_date || ''));
};

export const createRoutine = async (data) => {
  const userId = await getCurrentUserId();
  const routines = getStoredRoutines();
  const routine = normalizeRoutine(data, userId);

  if (!routine.title) {
    throw new Error('Название рутины обязательно.');
  }

  setStoredRoutines([...routines, routine]);
  emitRoutinesChanged({ action: 'create', routineId: routine.id });
  return routine;
};

export const updateRoutine = async (routineId, data) => {
  const userId = await getCurrentUserId();
  const routines = getStoredRoutines();
  const currentRoutine = routines.find((routine) => routine.id === routineId && routine.user_id === userId);

  if (!currentRoutine) {
    throw new Error('Рутина не найдена.');
  }

  const updatedRoutine = normalizeRoutine(data, userId, {
    ...currentRoutine,
    next_due_date: currentRoutine.active_task_id ? currentRoutine.next_due_date : null,
  });

  if (!updatedRoutine.title) {
    throw new Error('Название рутины обязательно.');
  }

  setStoredRoutines(routines.map((routine) => (routine.id === routineId ? updatedRoutine : routine)));
  emitRoutinesChanged({ action: 'update', routineId });
  return updatedRoutine;
};

export const deleteRoutine = async (routineId) => {
  const userId = await getCurrentUserId();
  const routines = getStoredRoutines();
  setStoredRoutines(routines.filter((routine) => !(routine.id === routineId && routine.user_id === userId)));
  emitRoutinesChanged({ action: 'delete', routineId });
  return { id: routineId };
};

const generateDueRoutineTasksInternal = async () => {
  const userId = await getCurrentUserId();
  const today = getToday();
  const routines = getStoredRoutines();
  const userRoutines = routines.filter((routine) => routine.user_id === userId);
  const tasks = await tasksApi.getAllTasks();
  const nextRoutines = [...routines];
  const generatedTasks = [];

  for (const routine of userRoutines) {
    const routineIndex = nextRoutines.findIndex((item) => item.id === routine.id);
    let nextRoutine = { ...routine };

    if (nextRoutine.is_paused) {
      continue;
    }

    if (nextRoutine.active_task_id) {
      const activeTask = tasks.find((task) => task.id === nextRoutine.active_task_id);

      if (activeTask?.status !== 'done' && activeTask) {
        continue;
      }

      if (activeTask?.status === 'done') {
        nextRoutine = updateRoutineCompletion(nextRoutine, activeTask);
      } else {
        const skippedDueDate = nextRoutine.active_due_date || nextRoutine.next_due_date || today;
        const nextScheduleBaseDate = maxDateString(skippedDueDate, today);
        nextRoutine = {
          ...nextRoutine,
          active_task_id: null,
          active_due_date: null,
          next_due_date: getFirstDueAfter(nextRoutine, nextScheduleBaseDate),
          updated_at: getTimestamp(),
        };
      }
    }

    if (!nextRoutine.next_due_date) {
      nextRoutine.next_due_date = getFirstDueOnOrAfter(nextRoutine, today);
    }

    if (nextRoutine.next_due_date <= today) {
      const dueDate = nextRoutine.next_due_date;
      const task = await tasksApi.createTask(undefined, {
        title: nextRoutine.title,
        description: nextRoutine.description || null,
        status: 'todo',
        priority: nextRoutine.priority || DEFAULT_PRIORITY,
        due_date: dueDate,
      });

      generatedTasks.push(task);
      nextRoutine = {
        ...nextRoutine,
        active_task_id: task.id,
        active_due_date: dueDate,
        next_due_date: getNextDueAfter(nextRoutine, dueDate),
        updated_at: getTimestamp(),
      };
    }

    nextRoutines[routineIndex] = nextRoutine;
  }

  if (generatedTasks.length > 0 || JSON.stringify(nextRoutines) !== JSON.stringify(routines)) {
    setStoredRoutines(nextRoutines);
    emitRoutinesChanged({ action: 'generate', generatedCount: generatedTasks.length });
  }

  return generatedTasks;
};

export const generateDueRoutineTasks = async () => {
  if (generationPromise) {
    return generationPromise;
  }

  generationPromise = generateDueRoutineTasksInternal().finally(() => {
    generationPromise = null;
  });

  return generationPromise;
};
