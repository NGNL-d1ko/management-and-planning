import { isLocalMode } from '../lib/apiAdapter';
import { localSettingsApi } from '../lib/localApis';
import { supabase } from '../lib/supabaseClient';
import { getSupabaseErrorMessage } from './supabaseErrors';

const getCurrentUserId = async () => {
  if (isLocalMode()) {
    return 'demo-user-001';
  }
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message || 'Не удалось получить текущего пользователя.');
  if (!data.user) throw new Error('Пользователь не авторизован.');
  return data.user.id;
};

const throwIfError = (error, fallbackMessage) => {
  if (error) throw new Error(getSupabaseErrorMessage(error, fallbackMessage));
};

export const getSettings = async () => {
  if (isLocalMode()) {
    return localSettingsApi.getSettings();
  }
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle();
  throwIfError(error, 'Не удалось загрузить настройки.');

  if (data) {
    return data;
  }

  const { data: createdSettings, error: createError } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: false })
    .select()
    .single();
  throwIfError(createError, 'Не удалось создать настройки.');
  return createdSettings;
};

export const updateSettings = async (data) => {
  if (isLocalMode()) {
    return localSettingsApi.updateSettings(data);
  }
  const userId = await getCurrentUserId();
  const { data: settings, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...data }, { onConflict: 'user_id' })
    .select()
    .single();
  throwIfError(error, 'Не удалось обновить настройки.');
  return settings;
};
