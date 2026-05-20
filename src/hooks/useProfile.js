import { useCallback, useEffect, useRef, useState } from 'react';
import * as profileApi from '../api/profileApi';
import { getViewCache, hasViewCache, setViewCache } from '../lib/viewCache';

const getErrorMessage = (error, fallbackMessage) => error?.message || fallbackMessage;
const PROFILE_CACHE_KEY = 'profile';

export const useProfile = () => {
  const mountedRef = useRef(false);
  const [profile, setProfile] = useState(() => getViewCache(PROFILE_CACHE_KEY) || null);
  const [isLoading, setIsLoading] = useState(() => !hasViewCache(PROFILE_CACHE_KEY));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (mountedRef.current) {
      const cachedProfile = getViewCache(PROFILE_CACHE_KEY);
      if (cachedProfile) {
        setProfile(cachedProfile);
      }
      setIsLoading(!cachedProfile);
      setError(null);
    }

    try {
      const data = await profileApi.getProfile();
      setViewCache(PROFILE_CACHE_KEY, data);

      if (mountedRef.current) {
        setProfile(data);
      }

      return data;
    } catch (refetchError) {
      const message = getErrorMessage(refetchError, 'Не удалось загрузить профиль.');

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

  const updateProfile = useCallback(async (data) => {
    try {
      const updatedProfile = await profileApi.updateProfile(data);
      setViewCache(PROFILE_CACHE_KEY, updatedProfile);

      if (mountedRef.current) {
        setProfile(updatedProfile);
      }

      return updatedProfile;
    } catch (updateError) {
      const message = getErrorMessage(updateError, 'Не удалось обновить профиль.');

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
    profile,
    isLoading,
    error,
    updateProfile,
    refetch,
  };
};

export default useProfile;
