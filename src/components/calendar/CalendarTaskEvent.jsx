import { ExclamationTriangleFill } from 'react-bootstrap-icons';
import { useLanguage } from '../../context/LanguageContext';
import { getTimeFromDueAt, isTaskOverdue } from '../../utils/deadline';

const priorityClass = {
  low: 'calendar-priority-low',
  medium: 'calendar-priority-medium',
  high: 'calendar-priority-high',
  urgent: 'calendar-priority-urgent',
};

const CalendarTaskEvent = ({ event }) => {
  const { t } = useLanguage();
  const task = event.resource;
  const overdue = isTaskOverdue(task);
  const dueTime = getTimeFromDueAt(task.due_at);
  const status = task.status || 'todo';

  return (
    <div className="calendar-task-event">
      <div className="calendar-task-event__top">
        <span className={`calendar-priority-dot ${priorityClass[task.priority] || priorityClass.medium}`} />
        <span className="calendar-task-event__title">{event.title}</span>
        {overdue && <ExclamationTriangleFill className="calendar-task-event__warning" size={12} />}
      </div>
      <div className="calendar-task-event__meta">
        <span className={`calendar-status-dot calendar-status-${status}`} />
        <span>{t(`status.${status}`)}</span>
        {dueTime && <span>{dueTime}</span>}
      </div>
    </div>
  );
};

export default CalendarTaskEvent;
