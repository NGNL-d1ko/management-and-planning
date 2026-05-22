import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, ListGroup, Row, Spinner, Tab, Tabs } from 'react-bootstrap';
import { BoxArrowDown, BoxArrowUp, ClockHistory, Fire } from 'react-bootstrap-icons';
import ProfileForm from '../components/profile/ProfileForm';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import { useAuth } from '../context/AuthContext';
import * as tasksApi from '../api/tasksApi';
import useProfile from '../hooks/useProfile';
import { onTasksChanged } from '../lib/dataEvents';
import { getViewCache, hasViewCache, setViewCache } from '../lib/viewCache';
import { formatTaskDeadline, isTaskOverdue } from '../utils/deadline';

const csvColumns = ['title', 'description', 'status', 'priority', 'due_date', 'due_at', 'created_at', 'completed_at'];
const PROFILE_TASKS_CACHE_KEY = 'tasks:all:{}';
const notificationDateFormat = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

const escapeCsvValue = (value) => {
  const stringValue = value == null ? '' : String(value);
  return /[",\n\r]/.test(stringValue)
    ? `"${stringValue.replaceAll('"', '""')}"`
    : stringValue;
};

const splitCsvLine = (line) => {
  const values = [];
  let value = '';
  let isQuoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && isQuoted && nextChar === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      isQuoted = !isQuoted;
    } else if (char === ',' && !isQuoted) {
      values.push(value);
      value = '';
    } else {
      value += char;
    }
  }

  values.push(value);
  return values;
};

const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce((row, header, index) => ({
      ...row,
      [header]: values[index] || '',
    }), {});
  });
};

const formatDate = (dateString) => (
  dateString
    ? new Date(dateString).toLocaleDateString('ru-RU', notificationDateFormat)
    : 'Нет даты'
);

const getToday = () => new Date().toISOString().slice(0, 10);

const getLoginStreak = (tasks) => {
  const createdDays = new Set(tasks
    .map((task) => task.created_at?.slice(0, 10))
    .filter(Boolean));
  let streak = 0;
  const cursor = new Date(`${getToday()}T00:00:00`);

  while (createdDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const ProfilePage = () => {
  const { user, updateUserMetadata } = useAuth();
  const {
    profile,
    isLoading,
    error,
    updateProfile,
  } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [tasks, setTasks] = useState(() => getViewCache(PROFILE_TASKS_CACHE_KEY) || []);
  const [isTasksLoading, setIsTasksLoading] = useState(() => !hasViewCache(PROFILE_TASKS_CACHE_KEY));
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const formProfile = useMemo(() => ({
    ...profile,
    email: user?.email || '',
  }), [profile, user]);
  const loginStreak = useMemo(() => getLoginStreak(tasks), [tasks]);
  const historyTasks = useMemo(() => tasks
    .filter((task) => task.status === 'done' || isTaskOverdue(task))
    .sort((first, second) => new Date(second.completed_at || second.due_at || second.due_date || second.created_at || 0) - new Date(first.completed_at || first.due_at || first.due_date || first.created_at || 0)), [tasks]);

  const refetchTasks = useCallback(async () => {
    const cachedTasks = getViewCache(PROFILE_TASKS_CACHE_KEY);
    if (cachedTasks) {
      setTasks(cachedTasks);
    }
    setIsTasksLoading(!cachedTasks);

    try {
      const taskRows = await tasksApi.getAllTasks();
      setViewCache(PROFILE_TASKS_CACHE_KEY, taskRows);
      setTasks(taskRows);
    } catch (tasksError) {
      setMessage({
        variant: 'danger',
        text: tasksError.message || 'Не удалось загрузить задачи профиля.',
      });
    } finally {
      setIsTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetchTasks();
  }, [refetchTasks]);

  useEffect(() => onTasksChanged((detail) => {
    if (detail.action === 'delete' && detail.taskId) {
      const cachedTasks = (getViewCache(PROFILE_TASKS_CACHE_KEY) || []).filter((task) => task.id !== detail.taskId);
      setViewCache(PROFILE_TASKS_CACHE_KEY, cachedTasks);
      setTasks(cachedTasks);
    } else if (detail.task) {
      const cachedTasks = getViewCache(PROFILE_TASKS_CACHE_KEY) || [];
      const nextTasks = [
        ...cachedTasks.filter((task) => task.id !== detail.task.id),
        detail.task,
      ];
      setViewCache(PROFILE_TASKS_CACHE_KEY, nextTasks);
      setTasks(nextTasks);
    }

    void refetchTasks();
  }), [refetchTasks]);

  const handleSubmit = async (data) => {
    setIsSaving(true);
    setMessage(null);

    try {
      await updateProfile(data);

      await updateUserMetadata({
        full_name: data.full_name,
        name: data.full_name,
        avatar_url: data.avatar_url,
      });

      setMessage({
        variant: 'success',
        text: 'Профиль сохранён.',
      });
    } catch (saveError) {
      setMessage({
        variant: 'danger',
        text: saveError.message || 'Не удалось сохранить профиль.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportTasks = () => {
    const csv = [
      csvColumns.join(','),
      ...tasks.map((task) => csvColumns.map((column) => escapeCsvValue(task[column])).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${getToday()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTasks = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage(null);

    try {
      const text = await file.text();
      const rows = parseCsv(text).filter((row) => row.title?.trim());

      for (const row of rows) {
        await tasksApi.createTask(undefined, {
          title: row.title.trim(),
          description: row.description?.trim() || null,
          status: row.status || 'todo',
          priority: row.priority || 'medium',
          due_date: row.due_date || null,
          due_at: row.due_at || null,
          created_at: row.created_at || undefined,
          completed_at: row.completed_at || undefined,
        });
      }

      await refetchTasks();
      setMessage({
        variant: 'success',
        text: `Импортировано задач: ${rows.length}.`,
      });
    } catch (importError) {
      setMessage({
        variant: 'danger',
        text: importError.message || 'Не удалось импортировать CSV.',
      });
    } finally {
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка профиля...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 mb-1">Профиль</h1>
        <p className="text-muted mb-0">Управляйте данными вашей учётной записи.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {message && (
        <Alert variant={message.variant} dismissible onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Tabs defaultActiveKey="profile" className="mb-4">
        <Tab eventKey="profile" title="Профиль">
          <div className="d-grid gap-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-wrapper bg-warning bg-opacity-10">
                      <Fire size={22} className="text-warning" />
                    </div>
                    <div>
                      <div className="small text-muted">Серия создания задач</div>
                      <div className="h4 mb-0">{loginStreak} дн.</div>
                    </div>
                  </div>
                  <div className="text-muted small">
                    День засчитывается, если создана хотя бы одна задача.
                  </div>
                </div>
              </Card.Body>
            </Card>

            <ProfileForm
              key={profile?.updated_at || profile?.id || user?.id}
              profile={formProfile}
              onSubmit={handleSubmit}
              isSaving={isSaving}
            />

            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <h2 className="h5 mb-1">Импорт и экспорт задач</h2>
                    <p className="text-muted mb-0">CSV поддерживает title, description, status, priority, due_date и due_at.</p>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Button variant="outline-secondary" onClick={handleExportTasks} disabled={isTasksLoading || tasks.length === 0}>
                      <BoxArrowDown className="me-2" />
                      Экспорт CSV
                    </Button>
                    <Form.Label className="btn btn-outline-secondary mb-0">
                      <BoxArrowUp className="me-2" />
                      Импорт CSV
                      <Form.Control type="file" accept=".csv,text/csv" className="d-none" onChange={handleImportTasks} />
                    </Form.Label>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Tab>

        <Tab eventKey="history" title="История">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-bottom">
              <Card.Title className="h5 mb-0 d-flex align-items-center gap-2">
                <ClockHistory size={20} />
                Завершённые и просроченные задачи
              </Card.Title>
            </Card.Header>
            <Card.Body className="p-0">
              {isTasksLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary" />
                </div>
              ) : historyTasks.length === 0 ? (
                <div className="p-4 text-muted">История пока пуста.</div>
              ) : (
                <ListGroup variant="flush">
                  {historyTasks.map((task) => {
                    const overdue = isTaskOverdue(task);

                    return (
                      <ListGroup.Item
                        key={task.id}
                        action
                        className="py-3"
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <Row className="align-items-center g-3">
                          <Col>
                            <div className="fw-semibold">{task.title}</div>
                            <div className="small text-muted">
                              Создана: {formatDate(task.created_at)} · Срок: {formatTaskDeadline(task)}
                              {task.completed_at ? ` · Завершена: ${formatDate(task.completed_at)}` : ''}
                            </div>
                          </Col>
                          <Col xs="auto">
                            <Badge bg={overdue ? 'danger' : 'success'}>
                              {overdue ? 'Просрочено' : 'Готово'}
                            </Badge>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <TaskDetailModal
        show={Boolean(selectedTaskId)}
        taskId={selectedTaskId}
        onHide={() => setSelectedTaskId(null)}
        onUpdated={() => {
          void refetchTasks();
        }}
      />
    </div>
  );
};

export default ProfilePage;
