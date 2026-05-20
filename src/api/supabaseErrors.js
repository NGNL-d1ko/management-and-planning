const missingTablePattern = /Could not find the table 'public\.([^']+)' in the schema cache/i;

export const getSupabaseErrorMessage = (error, fallbackMessage) => {
  if (!error) {
    return fallbackMessage;
  }

  const message = error.message || fallbackMessage;
  const missingTableMatch = message.match(missingTablePattern);

  if (missingTableMatch) {
    return `Таблица public.${missingTableMatch[1]} не найдена в Supabase. Выполните supabase/schema.sql, затем supabase/rls_policies.sql в Supabase SQL Editor.`;
  }

  return message;
};
