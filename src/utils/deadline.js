const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
});

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const combineDateAndTime = (dateString, timeString) => {
  if (!dateString || !timeString) {
    return null;
  }

  return new Date(`${dateString}T${timeString}`).toISOString();
};

export const getTimeFromDueAt = (dueAt) => {
  if (!dueAt) {
    return '';
  }

  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const getDateFromDueAt = (dueAt) => {
  if (!dueAt) {
    return '';
  }

  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

export const getTaskDeadlineDate = (task) => {
  if (task?.due_at) {
    const date = new Date(task.due_at);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (task?.due_date) {
    return new Date(`${task.due_date}T00:00:00`);
  }

  return null;
};

export const getTaskDeadlineDateKey = (task) => {
  const deadlineDate = getTaskDeadlineDate(task);
  if (!deadlineDate) return '';

  const year = deadlineDate.getFullYear();
  const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
  const day = String(deadlineDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTaskDeadlineState = (task, now = new Date()) => {
  if (!task || task.status === 'done') {
    return 'on_time';
  }

  if (task.due_at) {
    const dueAt = new Date(task.due_at);
    if (Number.isNaN(dueAt.getTime())) return 'on_time';
    if (dueAt < now) return 'overdue';
    if (dueAt.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) return 'due_soon';
    return 'on_time';
  }

  if (task.due_date) {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(`${task.due_date}T00:00:00`);
    if (dueDate < today) return 'overdue';
    if (dueDate.getTime() === today.getTime()) return 'due_soon';
  }

  return 'on_time';
};

export const isTaskOverdue = (task, now = new Date()) => (
  getTaskDeadlineState(task, now) === 'overdue'
);

export const formatTaskDeadline = (task, options = {}) => {
  const { short = false } = options;

  if (task?.due_at) {
    const date = new Date(task.due_at);
    if (!Number.isNaN(date.getTime())) {
      return short
        ? `${shortDateFormatter.format(date)}, ${timeFormatter.format(date)}`
        : dateTimeFormatter.format(date);
    }
  }

  if (task?.due_date) {
    const date = new Date(`${task.due_date}T00:00:00`);
    return short ? shortDateFormatter.format(date) : dateFormatter.format(date);
  }

  return 'Без срока';
};
