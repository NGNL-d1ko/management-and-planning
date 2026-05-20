import { useCallback, useEffect, useRef } from 'react';
import * as routinesApi from '../api/routinesApi';
import { onTasksChanged } from '../lib/dataEvents';

export const useRoutineGeneration = () => {
  const isGeneratingRef = useRef(false);

  const generate = useCallback(async () => {
    if (isGeneratingRef.current) {
      return;
    }

    isGeneratingRef.current = true;

    try {
      await routinesApi.generateDueRoutineTasks();
    } catch (error) {
      console.error('Routine generation failed:', error);
    } finally {
      isGeneratingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void generate();
  }, [generate]);

  useEffect(() => onTasksChanged(() => {
    void generate();
  }), [generate]);
};

export default useRoutineGeneration;
