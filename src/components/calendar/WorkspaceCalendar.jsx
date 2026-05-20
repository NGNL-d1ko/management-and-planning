import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { Alert, Card, Spinner } from 'react-bootstrap';
import * as tasksApi from '../../api/tasksApi';
import { onTasksChanged } from '../../lib/dataEvents';
import { getViewCache, hasViewCache, setViewCache } from '../../lib/viewCache';
import TaskDetailModal from '../tasks/TaskDetailModal';
import CalendarTaskEvent from './CalendarTaskEvent';
import TaskCreateFromDateModal from './TaskCreateFromDateModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {},
});

const statusColor = {
  backlog: '#6c757d',
  todo: '#0d6efd',
  in_progress: '#f59f00',
  done: '#198754',
};

const messages = {
  today: 'Сегодня',
  previous: 'Назад',
  next: 'Вперёд',
  month: 'Месяц',
  week: 'Неделя',
  day: 'День',
  agenda: 'Повестка',
  date: 'Дата',
  time: 'Время',
  event: 'Задача',
  noEventsInRange: 'В этом периоде задач нет.',
};

const toDateValue = (date) => format(date, 'yyyy-MM-dd');
const CALENDAR_TASKS_CACHE_KEY = 'tasks:all:{}';

const getTaskDate = (task) => new Date(`${task.due_date}T00:00:00`);

const isOverdue = (task) => {
  if (!task.due_date || task.status === 'done') {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getTaskDate(task) < today;
};

const WorkspaceCalendar = () => {
  const mountedRef = useRef(false);
  const [tasks, setTasks] = useState(() => getViewCache(CALENDAR_TASKS_CACHE_KEY) || []);
  const [isLoading, setIsLoading] = useState(() => !hasViewCache(CALENDAR_TASKS_CACHE_KEY));
  const [error, setError] = useState('');
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const refetch = useCallback(async () => {
    if (mountedRef.current) {
      const cachedTasks = getViewCache(CALENDAR_TASKS_CACHE_KEY);
      if (cachedTasks) {
        setTasks(cachedTasks);
      }
      setIsLoading(!cachedTasks);
      setError('');
    }

    try {
      const taskRows = await tasksApi.getAllTasks();
      setViewCache(CALENDAR_TASKS_CACHE_KEY, taskRows);

      if (mountedRef.current) {
        setTasks(taskRows);
      }
    } catch (fetchError) {
      if (mountedRef.current) {
        setError(fetchError.message || 'Не удалось загрузить данные календаря.');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refetch();

    return () => {
      mountedRef.current = false;
    };
  }, [refetch]);

  useEffect(() => onTasksChanged((detail) => {
    if (detail.action === 'delete' && detail.taskId) {
      const cachedTasks = (getViewCache(CALENDAR_TASKS_CACHE_KEY) || []).filter((task) => task.id !== detail.taskId);
      setViewCache(CALENDAR_TASKS_CACHE_KEY, cachedTasks);
      if (mountedRef.current) {
        setTasks(cachedTasks);
      }
    } else if (detail.task) {
      const cachedTasks = getViewCache(CALENDAR_TASKS_CACHE_KEY) || [];
      const nextTasks = [
        ...cachedTasks.filter((task) => task.id !== detail.task.id),
        detail.task,
      ];
      setViewCache(CALENDAR_TASKS_CACHE_KEY, nextTasks);
      if (mountedRef.current) {
        setTasks(nextTasks);
      }
    }

    void refetch();
  }), [refetch]);

  const events = useMemo(() => tasks
    .filter((task) => task.due_date)
    .map((task) => ({
      title: task.title,
      start: getTaskDate(task),
      end: getTaskDate(task),
      resource: task,
    })), [tasks]);

  const eventPropGetter = (event) => {
    const task = event.resource;
    const overdue = isOverdue(task);

    return {
      className: overdue ? 'calendar-event-overdue' : '',
      style: {
        backgroundColor: statusColor[task.status] || statusColor.todo,
        borderColor: overdue ? '#dc3545' : statusColor[task.status] || statusColor.todo,
      },
    };
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(toDateValue(slotInfo.start));
    setShowCreateModal(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка календаря...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="map-calendar">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              date={date}
              onView={setView}
              onNavigate={setDate}
              onSelectEvent={(event) => setSelectedTask(event.resource)}
              onSelectSlot={handleSelectSlot}
              selectable
              popup
              components={{ event: CalendarTaskEvent }}
              eventPropGetter={eventPropGetter}
              messages={messages}
            />
          </div>
        </Card.Body>
      </Card>

      <TaskDetailModal
        show={Boolean(selectedTask)}
        onHide={() => setSelectedTask(null)}
        taskId={selectedTask?.id}
        onUpdated={() => {
          void refetch();
        }}
      />

      <TaskCreateFromDateModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        selectedDate={selectedDate}
        onCreated={() => {
          void refetch();
        }}
      />
    </>
  );
};

export default WorkspaceCalendar;
