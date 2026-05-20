import { supabase } from '../lib/supabaseClient';
import { isLocalMode, localAuthApi } from '../lib/apiAdapter';
import { initializeDemoData } from '../lib/demoData';

const normalizeEmail = (email) => email.trim().toLowerCase();

const getEmailRedirectTo = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return `${window.location.origin}/login?confirmed=true`;
};

const getErrorMessage = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;
  const message = error.message || fallbackMessage;
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('invalid login credentials')) {
    return 'Неверный email или пароль. Если этот аккаунт был создан до подключения Supabase, зарегистрируйте его заново через Supabase.';
  }

  if (lowerMessage.includes('email not confirmed')) {
    return 'Email ещё не подтверждён. Проверьте почту и подтвердите аккаунт.';
  }

  if (lowerMessage.includes('user already registered') || lowerMessage.includes('already registered')) {
    return 'Пользователь с таким email уже зарегистрирован. Войдите или восстановите пароль в Supabase.';
  }

  return message;
};

export const register = async ({ fullName, email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  if (isLocalMode()) {
    initializeDemoData();
    return localAuthApi.signUp({ email: normalizedEmail, password, options: { data: { full_name: fullName } } });
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: getEmailRedirectTo(),
    },
  });

  if (error) throw new Error(getErrorMessage(error, 'Не удалось зарегистрироваться.'));
  return { user: data.user, session: data.session };
};

export const resendSignupConfirmation = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (isLocalMode()) {
    return { email: normalizedEmail };
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: normalizedEmail,
    options: {
      emailRedirectTo: getEmailRedirectTo(),
    },
  });

  if (error) throw new Error(getErrorMessage(error, 'Не удалось отправить письмо подтверждения.'));
  return { email: normalizedEmail };
};

export const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  if (isLocalMode()) {
    initializeDemoData();
    return localAuthApi.signInWithPassword({ email: normalizedEmail, password });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) throw new Error(getErrorMessage(error, 'Не удалось войти в аккаунт.'));
  return { user: data.user, session: data.session };
};

export const logout = async () => {
  if (isLocalMode()) {
    return localAuthApi.signOut();
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(getErrorMessage(error, 'Не удалось выйти из аккаунта.'));
};

export const getCurrentSession = async () => {
  if (isLocalMode()) {
    initializeDemoData();
    return localAuthApi.getSession();
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(getErrorMessage(error, 'Не удалось получить текущую сессию.'));
  return data.session;
};

export const getCurrentUser = async () => {
  if (isLocalMode()) {
    initializeDemoData();
    return localAuthApi.getUser();
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(getErrorMessage(error, 'Не удалось получить текущего пользователя.'));
  return data.user;
};

export const updateUserMetadata = async (metadata) => {
  if (isLocalMode()) {
    return localAuthApi.updateUser({ data: metadata });
  }

  const { data, error } = await supabase.auth.updateUser({ data: metadata });
  if (error) throw new Error(getErrorMessage(error, 'Не удалось обновить данные пользователя.'));
  return data.user;
};

export const onAuthStateChange = (callback) => {
  if (isLocalMode()) {
    return localAuthApi.onAuthStateChange(callback);
  }

  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
};
