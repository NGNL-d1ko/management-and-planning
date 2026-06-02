import { supabase } from '../lib/supabaseClient';
import { isLocalMode } from '../lib/apiAdapter';
import { localSettingsApi } from '../lib/localApis';
import { getSupabaseErrorMessage } from './supabaseErrors';

const OPTIONAL_SETTINGS_COLUMNS = ['language', 'timezone', 'notifications'];
const FALLBACK_SETTINGS_KEY_PREFIX = 'ym_settings_fallback';

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message || 'Не удалось получить текущего пользователя.');
  if (!data.user) throw new Error('Пользователь не авторизован.');
  return data.user.id;
};

const getFallbackSettingsKey = (userId) => `${FALLBACK_SETTINGS_KEY_PREFIX}:${userId}`;

const readFallbackSettings = (userId) => {
  try {
    return JSON.parse(window.localStorage.getItem(getFallbackSettingsKey(userId)) || 'null') || {};
  } catch {
    return {};
  }
};

const writeFallbackSettings = (userId, settings) => {
  try {
    window.localStorage.setItem(getFallbackSettingsKey(userId), JSON.stringify(settings));
  } catch {
    // localStorage may be unavailable in restricted browser modes.
  }
};

const mergeFallbackSettings = (userId, settings) => ({
  ...settings,
  ...readFallbackSettings(userId),
});

const getOptionalSettings = (data = {}) => OPTIONAL_SETTINGS_COLUMNS.reduce((optionalSettings, column) => {
  if (Object.prototype.hasOwnProperty.call(data, column)) {
    return {
      ...optionalSettings,
      [column]: data[column],
    };
  }

  return optionalSettings;
}, {});

const getLegacySettingsPayload = (data = {}) => Object.entries(data).reduce((payload, [key, value]) => {
  if (OPTIONAL_SETTINGS_COLUMNS.includes(key)) {
    return payload;
  }

  return {
    ...payload,
    [key]: value,
  };
}, {});

const isMissingOptionalSettingsColumnError = (error) => {
  const message = error?.message || '';
  return OPTIONAL_SETTINGS_COLUMNS.some((column) => (
    message.includes(`'${column}' column`) ||
    message.includes(`column "${column}"`) ||
    message.includes(`Could not find the '${column}' column`)
  ));
};

const throwIfError = (error, fallbackMessage) => {
  if (error) throw new Error(getSupabaseErrorMessage(error, fallbackMessage));
};

export const getSettings = async () => {
  if (isLocalMode()) return localSettingsApi.getSettings();

  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle();
  throwIfError(error, 'Не удалось загрузить настройки.');

  if (data) {
    return mergeFallbackSettings(userId, data);
  }

  const { data: createdSettings, error: createError } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: false })
    .select()
    .single();
  throwIfError(createError, 'Не удалось создать настройки.');
  return mergeFallbackSettings(userId, createdSettings);
};

export const updateSettings = async (data) => {
  if (isLocalMode()) return localSettingsApi.updateSettings(data);

  const userId = await getCurrentUserId();
  const { data: settings, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...data }, { onConflict: 'user_id' })
    .select()
    .single();

  if (isMissingOptionalSettingsColumnError(error)) {
    const optionalSettings = getOptionalSettings(data);
    writeFallbackSettings(userId, {
      ...readFallbackSettings(userId),
      ...optionalSettings,
    });

    const legacyPayload = getLegacySettingsPayload(data);
    const { data: legacySettings, error: legacyError } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...legacyPayload }, { onConflict: 'user_id' })
      .select()
      .single();

    throwIfError(legacyError, 'Не удалось обновить настройки.');
    return mergeFallbackSettings(userId, legacySettings);
  }

  throwIfError(error, 'Не удалось обновить настройки.');
  return settings;
};
