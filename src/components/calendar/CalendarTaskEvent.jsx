import { ExclamationTriangleFill } from 'react-bootstrap-icons';
import { getTimeFromDueAt, isTaskOverdue } from '../../utils/deadline';

const priorityClass = {
  low: 'calendar-priority-low',
  medium: 'calendar-priority-medium',
  high: 'calendar-priority-high',
  urgent: 'calendar-priority-urgent',
};

const statusLabel = {
  backlog: 'Очередь',
  todo: 'К выполнению',
  in_progress: 'В работе',
  done: 'Готово',
};

const CalendarTaskEvent = ({ event }) => {
  const task = event.resource;
  const overdue = isTaskOverdue(task);
  const dueTime = getTimeFromDueAt(task.due_at);

  return (
    <div className="calendar-task-event">
      <div className="calendar-task-event__top">
        <span className={`calendar-priority-dot ${priorityClass[task.priority] || priorityClass.medium}`} />
        <span className="calendar-task-event__title">{event.title}</span>
        {overdue && <ExclamationTriangleFill className="calendar-task-event__warning" size={12} />}
      </div>
      <div className="calendar-task-event__meta">
        <span className={`calendar-status-dot calendar-status-${task.status || 'todo'}`} />
        <span>{statusLabel[task.status] || task.status || 'К выполнению'}</span>
        {dueTime && <span>{dueTime}</span>}
      </div>
    </div>
  );
};

export default CalendarTaskEvent;
