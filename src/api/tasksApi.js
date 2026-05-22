import { supabase } from '../lib/supabaseClient';
import { emitTasksChanged } from '../lib/dataEvents';
import { isLocalMode, localTasksApi } from '../lib/apiAdapter';
import { getSupabaseErrorMessage } from './supabaseErrors';

const getErrorMessage = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;
  return getSupabaseErrorMessage(error, fallbackMessage);
};

const WORKSPACE_PROJECT_NAME = 'Workspace';

const normalizeTaskPayload = (data = {}) => {
  const taskData = { ...data };

  if (taskData.due_at) {
    const dueAtDate = new Date(taskData.due_at);

    if (Number.isNaN(dueAtDate.getTime())) {
      throw new Error('Некорректное время дедлайна.');
    }

    taskData.due_at = dueAtDate.toISOString();
    taskData.due_date = taskData.due_date || taskData.due_at.slice(0, 10);
  } else if (Object.prototype.hasOwnProperty.call(taskData, 'due_at')) {
    taskData.due_at = null;
  }

  return taskData;
};

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message || 'Не удалось получить текущего пользователя.');
  if (!data.user) throw new Error('Пользователь не авторизован.');
  return data.user.id;
};

export const getTasks = async (projectId, filters = {}) => {
  if (isLocalMode()) return localTasksApi.getTasks(projectId, filters);

  const userId = await getCurrentUserId();

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', userId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.priority) query = query.eq('priority', filters.priority);
  if (filters.due_from) query = query.gte('due_date', filters.due_from);
  if (filters.due_to) query = query.lte('due_date', filters.due_to);
  if (filters.search?.trim()) {
    const search = filters.search.trim();
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw new Error(getErrorMessage(error, 'Не удалось загрузить задачи.'));
  return data || [];
};

export const getAllTasks = async (filters = {}) => {
  if (isLocalMode()) return localTasksApi.getAllTasks(filters);

  const userId = await getCurrentUserId();

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.priority) query = query.eq('priority', filters.priority);
  if (filters.search?.trim()) {
    const search = filters.search.trim();
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw new Error(getErrorMessage(error, 'Не удалось загрузить задачи.'));
  return data || [];
};

export const getTask = async (taskId) => {
  if (isLocalMode()) return localTasksApi.getTask(taskId);

  const userId = await getCurrentUserId();

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (taskError) throw new Error(getErrorMessage(taskError, 'Не удалось загрузить задачу.'));

  return task;
};

export const createTask = async (projectId, data) => {
  if (isLocalMode()) {
    const task = await localTasksApi.createTask(projectId, normalizeTaskPayload(data));
    emitTasksChanged({ action: 'create', projectId: task.project_id, taskId: task.id, task });
    return task;
  }

  const userId = await getCurrentUserId();
  const resolvedProjectId = projectId || await getOrCreateWorkspaceProjectId(userId);
  const taskData = normalizeTaskPayload(data);
  const status = taskData.status || 'todo';

  const { data: lastTask, error: positionError } = await supabase
    .from('tasks')
    .select('position')
    .eq('project_id', resolvedProjectId)
    .eq('user_id', userId)
    .eq('status', status)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) throw new Error(getErrorMessage(positionError, 'Не удалось рассчитать позицию задачи.'));

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({ ...taskData, project_id: resolvedProjectId, user_id: userId, status, position: (lastTask?.position || 0) + 1 })
    .select()
    .single();

  if (error) throw new Error(getErrorMessage(error, 'Не удалось создать задачу.'));
  emitTasksChanged({ action: 'create', projectId: resolvedProjectId, taskId: task.id, task });
  return task;
};

export const updateTask = async (taskId, data) => {
  if (isLocalMode()) {
    const task = await localTasksApi.updateTask(taskId, normalizeTaskPayload(data));
    emitTasksChanged({ action: 'update', projectId: task.project_id, taskId, task });
    return task;
  }

  const userId = await getCurrentUserId();
  const taskData = normalizeTaskPayload(data);

  const { data: task, error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(getErrorMessage(error, 'Не удалось обновить задачу.'));

  emitTasksChanged({ action: 'update', projectId: task.project_id, taskId, task });
  return task;
};

export const deleteTask = async (taskId) => {
  if (isLocalMode()) {
    const result = await localTasksApi.deleteTask(taskId);
    emitTasksChanged({ action: 'delete', taskId });
    return result;
  }

  const userId = await getCurrentUserId();
  const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId);
  if (error) throw new Error(getErrorMessage(error, 'Не удалось удалить задачу.'));
  emitTasksChanged({ action: 'delete', taskId });
  return { id: taskId };
};

export const updateTaskStatus = async (taskId, status) => updateTask(taskId, {
  status, completed_at: status === 'done' ? new Date().toISOString() : null,
});

export const updateTaskPosition = async (taskId, position) => updateTask(taskId, { position });

async function getOrCreateWorkspaceProjectId(userId) {
  const { data: existingProject, error: existingError } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId)
    .eq('name', WORKSPACE_PROJECT_NAME)
    .maybeSingle();

  if (existingError) {
    throw new Error(getErrorMessage(existingError, 'Не удалось найти рабочее пространство.'));
  }

  if (existingProject?.id) {
    return existingProject.id;
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: WORKSPACE_PROJECT_NAME,
      description: 'Internal workspace for standalone tasks.',
      color: '#4A90D9',
      status: 'active',
      priority: 'medium',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(getErrorMessage(error, 'Не удалось создать рабочее пространство.'));
  }

  return project.id;
}
