import { supabase } from '../lib/supabaseClient';
import { isLocalMode } from '../lib/apiAdapter';
import { localProfileApi } from '../lib/localApis';
import { getSupabaseErrorMessage } from './supabaseErrors';

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message || 'Не удалось получить текущего пользователя.');
  if (!data.user) throw new Error('Пользователь не авторизован.');
  return data.user.id;
};

const throwIfError = (error, fallbackMessage) => {
  if (error) throw new Error(getSupabaseErrorMessage(error, fallbackMessage));
};

export const getProfile = async () => {
  if (isLocalMode()) return localProfileApi.getProfile();

  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  throwIfError(error, 'Не удалось загрузить профиль.');

  if (data) {
    return data;
  }

  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: false })
    .select()
    .single();
  throwIfError(createError, 'Не удалось создать профиль.');
  return createdProfile;
};

export const updateProfile = async (data) => {
  if (isLocalMode()) return localProfileApi.updateProfile(data);

  const userId = await getCurrentUserId();
  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...data }, { onConflict: 'id' })
    .select()
    .single();
  throwIfError(error, 'Не удалось обновить профиль.');
  return profile;
};

export const deleteProfile = async () => {
  if (isLocalMode()) return localProfileApi.deleteProfile();

  const userId = await getCurrentUserId();
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  throwIfError(error, 'Не удалось удалить профиль.');
  return { id: userId };
};
