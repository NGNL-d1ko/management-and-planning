import { useCallback, useEffect, useRef, useState } from 'react';
import * as settingsApi from '../api/settingsApi';
import { getViewCache, hasViewCache, setViewCache } from '../lib/viewCache';

const getErrorMessage = (error, fallbackMessage) => error?.message || fallbackMessage;
const SETTINGS_CACHE_KEY = 'settings';

export const useSettings = () => {
  const mountedRef = useRef(false);
  const [settings, setSettings] = useState(() => getViewCache(SETTINGS_CACHE_KEY) || null);
  const [isLoading, setIsLoading] = useState(() => !hasViewCache(SETTINGS_CACHE_KEY));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (mountedRef.current) {
      const cachedSettings = getViewCache(SETTINGS_CACHE_KEY);
      if (cachedSettings) {
        setSettings(cachedSettings);
      }
      setIsLoading(!cachedSettings);
      setError(null);
    }

    try {
      const data = await settingsApi.getSettings();
      setViewCache(SETTINGS_CACHE_KEY, data);

      if (mountedRef.current) {
        setSettings(data);
      }

      return data;
    } catch (refetchError) {
      const message = getErrorMessage(refetchError, 'Не удалось загрузить настройки.');

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

  const updateSettings = useCallback(async (data) => {
    try {
      const updatedSettings = await settingsApi.updateSettings(data);
      setViewCache(SETTINGS_CACHE_KEY, updatedSettings);

      if (mountedRef.current) {
        setSettings(updatedSettings);
      }

      return updatedSettings;
    } catch (updateError) {
      const message = getErrorMessage(updateError, 'Не удалось обновить настройки.');

      if (mountedRef.current) {
        setError(message);
      }

      throw new Error(message);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refetch().catch(() => {});

    return () => {
      mountedRef.current = false;
    };
  }, [refetch]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refetch,
  };
};

export default useSettings;
