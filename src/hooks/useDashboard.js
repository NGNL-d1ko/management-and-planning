import { useCallback, useEffect, useRef, useState } from 'react';
import * as dashboardApi from '../api/dashboardApi';
import { onTasksChanged } from '../lib/dataEvents';
import { getViewCache, hasViewCache, setViewCache } from '../lib/viewCache';

const getErrorMessage = (error, fallbackMessage) => error?.message || fallbackMessage;
const DASHBOARD_CACHE_KEY = 'dashboard';

export const useDashboard = () => {
  const mountedRef = useRef(false);
  const [dashboard, setDashboard] = useState(() => getViewCache(DASHBOARD_CACHE_KEY) || null);
  const [isLoading, setIsLoading] = useState(() => !hasViewCache(DASHBOARD_CACHE_KEY));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (mountedRef.current) {
      const cachedDashboard = getViewCache(DASHBOARD_CACHE_KEY);
      if (cachedDashboard) {
        setDashboard(cachedDashboard);
      }
      setIsLoading(!cachedDashboard);
      setError(null);
    }

    try {
      const data = await dashboardApi.getDashboardData();
      setViewCache(DASHBOARD_CACHE_KEY, data);

      if (mountedRef.current) {
        setDashboard(data);
      }

      return data;
    } catch (refetchError) {
      const message = getErrorMessage(refetchError, 'Не удалось загрузить данные панели.');

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

  useEffect(() => {
    mountedRef.current = true;
    void refetch().catch(() => {});

    return () => {
      mountedRef.current = false;
    };
  }, [refetch]);

  useEffect(() => onTasksChanged(() => {
    void refetch().catch(() => {});
  }), [refetch]);

  return {
    dashboard,
    isLoading,
    error,
    refetch,
  };
};

export default useDashboard;
