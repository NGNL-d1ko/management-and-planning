import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as tasksApi from '../api/tasksApi';
import { onTasksChanged } from '../lib/dataEvents';
import { getViewCache, getViewCacheEntries, hasViewCache, setViewCache } from '../lib/viewCache';

const getErrorMessage = (error, fallbackMessage) => error?.message || fallbackMessage;
const TASKS_CACHE_PREFIX = 'tasks';

const getApiFilters = (filters = {}) => ({
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.priority ? { priority: filters.priority } : {}),
  ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
  ...(filters.due_from ? { due_from: filters.due_from } : {}),
  ...(filters.due_to ? { due_to: filters.due_to } : {}),
});

const getTasksCacheKey = (projectId, filters = {}) => (
  `${TASKS_CACHE_PREFIX}:${projectId || 'all'}:${JSON.stringify(getApiFilters(filters))}`
);

const matchesFilters = (task, projectId, filters = {}) => {
  if (projectId && task.project_id !== projectId) return false;
  if (filters.status && task.status !== filters.status) return false;
  if (filters.priority && task.priority !== filters.priority) return false;
  if (filters.search?.trim()) {
    const search = filters.search.trim().toLowerCase();
    const title = task.title?.toLowerCase() || '';
    const description = task.description?.toLowerCase() || '';
    if (!title.includes(search) && !description.includes(search)) return false;
  }
  if (filters.due_from && (!task.due_date || task.due_date < filters.due_from)) return false;
  if (filters.due_to && (!task.due_date || task.due_date > filters.due_to)) return false;
  return true;
};

const parseTasksCacheKey = (key) => {
  if (!key.startsWith(`${TASKS_CACHE_PREFIX}:`)) return null;

  const parts = key.split(':');
  if (parts.length < 3) return null;

  try {
    return {
      projectId: parts[1] === 'all' ? undefined : parts[1],
      filters: JSON.parse(parts.slice(2).join(':')) || {},
    };
  } catch {
    return null;
  }
};

const updateTaskCaches = (updater) => {
  getViewCacheEntries().forEach(([key, cachedTasks]) => {
    const cacheMeta = parseTasksCacheKey(key);
    if (!cacheMeta || !Array.isArray(cachedTasks)) return;
    setViewCache(key, updater(cachedTasks, cacheMeta));
  });
};

const upsertTaskInCaches = (task) => {
  updateTaskCaches((cachedTasks, cacheMeta) => {
    const withoutTask = cachedTasks.filter((cachedTask) => cachedTask.id !== task.id);
    return matchesFilters(task, cacheMeta.projectId, cacheMeta.filters)
      ? [...withoutTask, task]
      : withoutTask;
  });
};

const removeTaskFromCaches = (taskId) => {
  updateTaskCaches((cachedTasks) => cachedTasks.filter((task) => task.id !== taskId));
};

export const useTasks = (projectId, filters = {}) => {
  const mountedRef = useRef(false);
  const apiFilters = useMemo(() => getApiFilters(filters || {}), [filters]);
  const filtersKey = useMemo(() => JSON.stringify(apiFilters), [apiFilters]);
  const cacheKey = useMemo(() => getTasksCacheKey(projectId, apiFilters), [projectId, apiFilters]);
  const [tasks, setTasks] = useState(() => getViewCache(cacheKey) || []);
  const [isLoading, setIsLoading] = useState(() => !hasViewCache(cacheKey));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (mountedRef.current) {
      const cachedTasks = getViewCache(cacheKey);
      if (cachedTasks) {
        setTasks(cachedTasks);
      }
      setIsLoading(!cachedTasks);
      setError(null);
    }

    try {
      const parsedFilters = JSON.parse(filtersKey);
      const data = projectId
        ? await tasksApi.getTasks(projectId, parsedFilters)
        : await tasksApi.getAllTasks(parsedFilters);

      if (mountedRef.current) {
        setTasks(data);
      }

      setViewCache(cacheKey, data);
      return data;
    } catch (refetchError) {
      const message = getErrorMessage(refetchError, 'Не удалось загрузить задачи.');

      if (mountedRef.current) {
        setError(message);
      }

      throw new Error(message);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [projectId, filtersKey, cacheKey]);

  const createTask = useCallback(async (data) => {
    try {
      const task = await tasksApi.createTask(projectId, data);
      upsertTaskInCaches(task);

      if (mountedRef.current) {
        setTasks((currentTasks) => (
          !matchesFilters(task, projectId, apiFilters) || currentTasks.some((currentTask) => currentTask.id === task.id)
            ? currentTasks
            : [...currentTasks, task]
        ));
      }

      return task;
    } catch (createError) {
      const message = getErrorMessage(createError, 'Не удалось создать задачу.');

      if (mountedRef.current) {
        setError(message);
      }

      throw new Error(message);
    }
  }, [projectId, apiFilters]);

  const updateTask = useCallback(async (taskId, data) => {
    try {
      const updatedTask = await tasksApi.updateTask(taskId, data);
      upsertTaskInCaches(updatedTask);

      if (mountedRef.current) {
        setTasks((currentTasks) => (
          matchesFilters(updatedTask, projectId, apiFilters)
            ? currentTasks.map((task) => (task.id === taskId ? updatedTask : task))
            : currentTasks.filter((task) => task.id !== taskId)
        ));
      }

      return updatedTask;
    } catch (updateError) {
      const message = getErrorMessage(updateError, 'Не удалось обновить задачу.');

      if (mountedRef.current) {
        setError(message);
      }

      throw new Error(message);
    }
  }, [apiFilters, projectId]);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await tasksApi.deleteTask(taskId);
      removeTaskFromCaches(taskId);

      if (mountedRef.current) {
        setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
      }

      return { id: taskId };
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'Не удалось удалить задачу.');

      if (mountedRef.current) {
        setError(message);
      }

      throw new Error(message);
    }
  }, []);

  const updateStatus = useCallback(async (taskId, status) => {
    try {
      const updatedTask = await tasksApi.updateTaskStatus(taskId, status);
      upsertTaskInCaches(updatedTask);

      if (mountedRef.current) {
        setTasks((currentTasks) => (
          matchesFilters(updatedTask, projectId, apiFilters)
            ? currentTasks.map((task) => (task.id === taskId ? updatedTask : task))
            : currentTasks.filter((task) => task.id !== taskId)
        ));
      }

      return updatedTask;
    } catch (statusError) {
      const message = getErrorMessage(statusError, 'Не удалось обновить статус задачи.');

      if (mountedRef.current) {
        setError(message);
      }

      throw new Error(message);
    }
  }, [apiFilters, projectId]);

  const updatePosition = useCallback(async (taskId, position) => {
    try {
      const updatedTask = await tasksApi.updateTaskPosition(taskId, position);
      upsertTaskInCaches(updatedTask);

      if (mountedRef.current) {
        setTasks((currentTasks) => (
          matchesFilters(updatedTask, projectId, apiFilters)
            ? currentTasks.map((task) => (task.id === taskId ? updatedTask : task))
            : currentTasks.filter((task) => task.id !== taskId)
        ));
      }

      return updatedTask;
    } catch (positionError) {
      const message = getErrorMessage(positionError, 'Не удалось обновить позицию задачи.');

      if (mountedRef.current) {
        setError(message);
      }

      throw new Error(message);
    }
  }, [apiFilters, projectId]);

  useEffect(() => {
    mountedRef.current = true;
    void refetch().catch(() => {});

    return () => {
      mountedRef.current = false;
    };
  }, [refetch]);

  useEffect(() => onTasksChanged((detail) => {
    if (projectId && detail.projectId && detail.projectId !== projectId) {
      return;
    }

    if (detail.action === 'delete' && detail.taskId) {
      removeTaskFromCaches(detail.taskId);
      if (mountedRef.current) {
        setTasks(getViewCache(cacheKey) || []);
      }
    } else if (detail.task) {
      upsertTaskInCaches(detail.task);
      if (mountedRef.current) {
        setTasks(getViewCache(cacheKey) || []);
      }
    }

    void refetch().catch(() => {});
  }), [projectId, refetch, cacheKey]);

  return {
    tasks,
    setTasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    updatePosition,
    refetch,
  };
};

export default useTasks;
