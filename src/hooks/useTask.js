import { useCallback, useEffect, useRef, useState } from 'react';
import * as tasksApi from '../api/tasksApi';
import { onTasksChanged } from '../lib/dataEvents';
import { deleteViewCache, getViewCache, hasViewCache, setViewCache } from '../lib/viewCache';

const getErrorMessage = (error, fallbackMessage) => error?.message || fallbackMessage;
const getTaskCacheKey = (taskId) => `task:${taskId}`;

export const useTask = (taskId) => {
  const mountedRef = useRef(false);
  const [task, setTask] = useState(() => (taskId ? getViewCache(getTaskCacheKey(taskId)) || null : null));
  const [isLoading, setIsLoading] = useState(() => Boolean(taskId) && !hasViewCache(getTaskCacheKey(taskId)));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!taskId) {
      if (mountedRef.current) {
        setTask(null);
        setIsLoading(false);
      }

      return null;
    }

    if (mountedRef.current) {
      const cachedTask = getViewCache(getTaskCacheKey(taskId));
      if (cachedTask) {
        setTask(cachedTask);
      }
      setIsLoading(!cachedTask);
      setError(null);
    }

    try {
      const data = await tasksApi.getTask(taskId);
      setViewCache(getTaskCacheKey(taskId), data);

      if (mountedRef.current) {
        setTask(data);
      }

      return data;
    } catch (refetchError) {
      const message = getErrorMessage(refetchError, 'Не удалось загрузить задачу.');

      if (mountedRef.current) {
        setError(message);
      }

      throw new Error(message);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [taskId]);

  const updateTask = useCallback(async (data) => {
    if (!taskId) {
      throw new Error('Не указана задача для обновления.');
    }

    try {
      const updatedTask = await tasksApi.updateTask(taskId, data);
      setViewCache(getTaskCacheKey(taskId), updatedTask);

      if (mountedRef.current) {
        setTask((currentTask) => ({
          ...currentTask,
          ...updatedTask,
        }));
      }

      return updatedTask;
    } catch (updateError) {
      const message = getErrorMessage(updateError, 'Не удалось обновить задачу.');

      if (mountedRef.current) {
        setError(message);
      }

      throw new Error(message);
    }
  }, [taskId]);

  const deleteTask = useCallback(async () => {
    if (!taskId) {
      throw new Error('Не указана задача для удаления.');
    }

    try {
      const result = await tasksApi.deleteTask(taskId);
      deleteViewCache(getTaskCacheKey(taskId));

      if (mountedRef.current) {
        setTask(null);
      }

      return result;
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'Не удалось удалить задачу.');

      if (mountedRef.current) {
        setError(message);
      }

      throw new Error(message);
    }
  }, [taskId]);

  useEffect(() => {
    mountedRef.current = true;
    void refetch().catch(() => {});

    return () => {
      mountedRef.current = false;
    };
  }, [refetch]);

  useEffect(() => onTasksChanged((detail) => {
    if (!taskId || detail.taskId !== taskId) {
      return;
    }

    if (detail.action === 'delete' && mountedRef.current) {
      deleteViewCache(getTaskCacheKey(taskId));
      setTask(null);
      return;
    }

    if (detail.task) {
      setViewCache(getTaskCacheKey(taskId), detail.task);
      if (mountedRef.current) {
        setTask(detail.task);
      }
    }

    void refetch().catch(() => {});
  }), [taskId, refetch]);

  return {
    task,
    isLoading,
    error,
    updateTask,
    deleteTask,
    refetch,
  };
};

export default useTask;
