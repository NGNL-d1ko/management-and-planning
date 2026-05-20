import { useCallback, useEffect, useRef, useState } from 'react';
import * as routinesApi from '../api/routinesApi';
import { onRoutinesChanged } from '../lib/dataEvents';
import { getViewCache, hasViewCache, setViewCache } from '../lib/viewCache';

const getErrorMessage = (error, fallbackMessage) => error?.message || fallbackMessage;
const ROUTINES_CACHE_KEY = 'routines';

export const useRoutines = () => {
  const mountedRef = useRef(false);
  const [routines, setRoutines] = useState(() => getViewCache(ROUTINES_CACHE_KEY) || []);
  const [isLoading, setIsLoading] = useState(() => !hasViewCache(ROUTINES_CACHE_KEY));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (mountedRef.current) {
      const cachedRoutines = getViewCache(ROUTINES_CACHE_KEY);
      if (cachedRoutines) {
        setRoutines(cachedRoutines);
      }
      setIsLoading(!cachedRoutines);
      setError(null);
    }

    try {
      const data = await routinesApi.getRoutines();
      setViewCache(ROUTINES_CACHE_KEY, data);

      if (mountedRef.current) {
        setRoutines(data);
      }

      return data;
    } catch (refetchError) {
      const message = getErrorMessage(refetchError, 'Не удалось загрузить рутины.');

      if (mountedRef.current) {
        setError(message);
      }

      throw new Error(message);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const createRoutine = useCallback(async (data) => {
    const routine = await routinesApi.createRoutine(data);
    await refetch();
    return routine;
  }, [refetch]);

  const updateRoutine = useCallback(async (routineId, data) => {
    const routine = await routinesApi.updateRoutine(routineId, data);
    await refetch();
    return routine;
  }, [refetch]);

  const deleteRoutine = useCallback(async (routineId) => {
    const result = await routinesApi.deleteRoutine(routineId);
    await refetch();
    return result;
  }, [refetch]);

  const generateDueTasks = useCallback(async () => {
    const tasks = await routinesApi.generateDueRoutineTasks();
    await refetch();
    return tasks;
  }, [refetch]);

  useEffect(() => {
    mountedRef.current = true;
    void refetch().catch(() => {});

    return () => {
      mountedRef.current = false;
    };
  }, [refetch]);

  useEffect(() => onRoutinesChanged(() => {
    void refetch().catch(() => {});
  }), [refetch]);

  return {
    routines,
    isLoading,
    error,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    generateDueTasks,
    refetch,
  };
};

export default useRoutines;
