import { supabase } from '../lib/supabaseClient';
import { isLocalMode, localAuthApi } from '../lib/apiAdapter';

const normalizeEmail = (email) => email.trim().toLowerCase();

const getSupabaseClient = () => {
  if (!supabase) throw new Error('Не удается получить ответ от сервера.');
  return supabase;
};

const getEmailRedirectTo = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return `${window.location.origin}/login?confirmed=true`;
};

const getPasswordResetRedirectTo = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return `${window.location.origin}/reset-password`;
};

const getErrorMessage = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;
  const message = error.message || fallbackMessage;
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('invalid login credentials')) {
    return 'Неверный email или пароль.';
  }

  if (lowerMessage.includes('email not confirmed')) {
    return 'Email ещё не подтверждён. Проверьте почту и подтвердите аккаунт.';
  }

  if (lowerMessage.includes('user already registered') || lowerMessage.includes('already registered')) {
    return 'Аккаунт с таким email уже существует. Войдите или восстановите пароль.';
  }

  if (lowerMessage.includes('already confirmed') || lowerMessage.includes('email already confirmed')) {
    return 'Email уже подтверждён. Войдите в аккаунт.';
  }

  return message;
};

const isAlreadyRegisteredSignupResult = (data) => (
  data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0
);

const isAlreadyConfirmedError = (error) => {
  const message = error?.message?.toLowerCase() || '';
  return message.includes('already confirmed') || message.includes('email already confirmed');
};

export const register = async ({ fullName, email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  if (isLocalMode()) {
    const data = await localAuthApi.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { user: data.user, session: data.session };
  }

  const { data, error } = await getSupabaseClient().auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: getEmailRedirectTo(),
    },
  });

  if (error) throw new Error(getErrorMessage(error, 'Не удалось зарегистрироваться.'));

  if (isAlreadyRegisteredSignupResult(data)) {
    throw new Error('Аккаунт с таким email уже существует. Войдите или восстановите пароль.');
  }

  return { user: data.user, session: data.session };
};

export const resendSignupConfirmation = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (isLocalMode()) {
    return { email: normalizedEmail };
  }

  const { error } = await getSupabaseClient().auth.resend({
    type: 'signup',
    email: normalizedEmail,
    options: {
      emailRedirectTo: getEmailRedirectTo(),
    },
  });

  if (isAlreadyConfirmedError(error)) {
    return { email: normalizedEmail, alreadyConfirmed: true };
  }

  if (error) throw new Error(getErrorMessage(error, 'Не удалось отправить письмо подтверждения.'));
  return { email: normalizedEmail };
};

export const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  if (isLocalMode()) {
    const data = await localAuthApi.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    return { user: data.user, session: data.session };
  }

  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) throw new Error(getErrorMessage(error, 'Не удалось войти в аккаунт.'));
  return { user: data.user, session: data.session };
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (isLocalMode()) {
    return { email: normalizedEmail };
  }

  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: getPasswordResetRedirectTo(),
  });

  if (error) throw new Error(getErrorMessage(error, 'Не удалось отправить письмо для восстановления пароля.'));
  return { email: normalizedEmail };
};

export const updatePassword = async (password) => {
  if (isLocalMode()) return localAuthApi.updatePassword(password);

  const { data, error } = await getSupabaseClient().auth.updateUser({ password });
  if (error) throw new Error(getErrorMessage(error, 'Не удалось обновить пароль.'));
  return data.user;
};

export const logout = async () => {
  if (isLocalMode()) {
    await localAuthApi.signOut();
    return;
  }

  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw new Error(getErrorMessage(error, 'Не удалось выйти из аккаунта.'));
};

export const getCurrentSession = async () => {
  if (isLocalMode()) return localAuthApi.getSession();

  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw new Error(getErrorMessage(error, 'Не удалось получить текущую сессию.'));
  return data.session;
};

export const getCurrentUser = async () => {
  if (isLocalMode()) return localAuthApi.getUser();

  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error) throw new Error(getErrorMessage(error, 'Не удалось получить текущего пользователя.'));
  return data.user;
};

export const updateUserMetadata = async (metadata) => {
  if (isLocalMode()) return localAuthApi.updateUser({ data: metadata });

  const { data, error } = await getSupabaseClient().auth.updateUser({ data: metadata });
  if (error) throw new Error(getErrorMessage(error, 'Не удалось обновить данные пользователя.'));
  return data.user;
};

export const onAuthStateChange = (callback) => {
  if (isLocalMode() || !supabase) return localAuthApi.onAuthStateChange(callback);

  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
};
