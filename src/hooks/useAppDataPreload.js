import { useEffect, useRef } from 'react';
import * as analyticsApi from '../api/analyticsApi';
import * as dashboardApi from '../api/dashboardApi';
import * as profileApi from '../api/profileApi';
import * as routinesApi from '../api/routinesApi';
import * as settingsApi from '../api/settingsApi';
import * as tasksApi from '../api/tasksApi';
import { onRoutinesChanged, onTasksChanged } from '../lib/dataEvents';
import { setViewCache } from '../lib/viewCache';

const preloadTasks = async () => {
  const tasks = await tasksApi.getAllTasks();
  setViewCache('tasks:all:{}', tasks);
  return tasks;
};

const preloadRoutines = async () => {
  await routinesApi.generateDueRoutineTasks();
  const routines = await routinesApi.getRoutines();
  setViewCache('routines', routines);
  return routines;
};

const refreshDerivedCaches = async () => {
  await Promise.allSettled([
    preloadTasks(),
    dashboardApi.getDashboardData().then((data) => setViewCache('dashboard', data)),
    analyticsApi.getAnalyticsData().then((data) => setViewCache('analytics', data)),
    routinesApi.getRoutines().then((data) => setViewCache('routines', data)),
  ]);
};

export const useAppDataPreload = () => {
  const didPreloadRef = useRef(false);

  useEffect(() => {
    if (didPreloadRef.current) {
      return;
    }

    didPreloadRef.current = true;

    const preload = async () => {
      await preloadRoutines().catch(() => []);
      const tasksPromise = preloadTasks();

      const independentPreloads = [
        tasksPromise,
        dashboardApi.getDashboardData().then((data) => setViewCache('dashboard', data)),
        analyticsApi.getAnalyticsData().then((data) => setViewCache('analytics', data)),
        profileApi.getProfile().then((data) => setViewCache('profile', data)),
        settingsApi.getSettings().then((data) => setViewCache('settings', data)),
      ];

      await Promise.allSettled(independentPreloads);
    };

    void preload();
  }, []);

  useEffect(() => {
    const unsubscribeTasks = onTasksChanged(() => {
      void refreshDerivedCaches();
    });
    const unsubscribeRoutines = onRoutinesChanged(() => {
      void refreshDerivedCaches();
    });

    return () => {
      unsubscribeTasks();
      unsubscribeRoutines();
    };
  }, []);
};

export default useAppDataPreload;
