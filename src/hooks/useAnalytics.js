import { useCallback, useEffect, useRef, useState } from 'react';
import * as analyticsApi from '../api/analyticsApi';
import { onProjectsChanged, onTasksChanged } from '../lib/dataEvents';
import { getViewCache, hasViewCache, setViewCache } from '../lib/viewCache';

const getErrorMessage = (error, fallbackMessage) => error?.message || fallbackMessage;
const ANALYTICS_CACHE_KEY = 'analytics';

export const useAnalytics = () => {
  const mountedRef = useRef(false);
  const [analytics, setAnalytics] = useState(() => getViewCache(ANALYTICS_CACHE_KEY) || null);
  const [isLoading, setIsLoading] = useState(() => !hasViewCache(ANALYTICS_CACHE_KEY));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (mountedRef.current) {
      const cachedAnalytics = getViewCache(ANALYTICS_CACHE_KEY);
      if (cachedAnalytics) {
        setAnalytics(cachedAnalytics);
      }
      setIsLoading(!cachedAnalytics);
      setError(null);
    }

    try {
      const data = await analyticsApi.getAnalyticsData();
      setViewCache(ANALYTICS_CACHE_KEY, data);

      if (mountedRef.current) {
        setAnalytics(data);
      }

      return data;
    } catch (refetchError) {
      const message = getErrorMessage(refetchError, 'Не удалось загрузить аналитику.');

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

  useEffect(() => onProjectsChanged(() => {
    void refetch().catch(() => {});
  }), [refetch]);

  return {
    analytics,
    isLoading,
    error,
    refetch,
  };
};

export default useAnalytics;
