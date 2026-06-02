import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, ListGroup, Row, Spinner, Tab, Tabs } from 'react-bootstrap';
import { BoxArrowDown, BoxArrowUp, Check2Square, ClockHistory, Fire, Trash } from 'react-bootstrap-icons';
import ProfileForm from '../components/profile/ProfileForm';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import * as tasksApi from '../api/tasksApi';
import useProfile from '../hooks/useProfile';
import { onTasksChanged } from '../lib/dataEvents';
import { getViewCache, hasViewCache, setViewCache } from '../lib/viewCache';
import { formatTaskDeadline, getTaskDeadlineDateKey, isTaskOverdue } from '../utils/deadline';

const csvColumns = ['title', 'description', 'status', 'priority', 'due_date', 'due_at', 'created_at', 'completed_at'];
const PROFILE_TASKS_CACHE_KEY = 'tasks:all:{}';
const notificationDateFormat = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};
const localeByLanguage = {
  ru: 'ru-RU',
  en: 'en-US',
  kk: 'kk-KZ',
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

const formatDate = (dateString, language, emptyLabel) => {
  if (!dateString) {
    return emptyLabel;
  }

  return new Date(dateString).toLocaleDateString(
    localeByLanguage[language] || localeByLanguage.ru,
    notificationDateFormat,
  );
};

const getLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getToday = () => getLocalDateKey(new Date());

const getTaskHistoryDate = (task) => (
  task.completed_at ||
  task.due_at ||
  (task.due_date ? `${task.due_date}T00:00:00` : '') ||
  task.created_at ||
  ''
);

const getTaskHistoryDateKey = (task) => {
  const value = getTaskHistoryDate(task);
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
};

const isTaskInDateRange = (task, dateFrom, dateTo) => {
  const dateKey = getTaskHistoryDateKey(task);
  if (!dateKey) return false;
  if (dateFrom && dateKey < dateFrom) return false;
  if (dateTo && dateKey > dateTo) return false;
  return true;
};

const getDueTodayCompletionStreak = (tasks) => {
  const completedDueDays = new Set(tasks
    .filter((task) => task.status === 'done' && task.completed_at)
    .filter((task) => {
      const completedDate = new Date(task.completed_at);
      if (Number.isNaN(completedDate.getTime())) return false;

      return getTaskDeadlineDateKey(task) === getLocalDateKey(completedDate);
    })
    .map((task) => getTaskDeadlineDateKey(task))
    .filter(Boolean));
  let streak = 0;
  const cursor = new Date(`${getToday()}T00:00:00`);

  while (completedDueDays.has(getLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const ProfilePage = () => {
  const { language, t } = useLanguage();
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
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({
    search: '',
    type: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [pendingBulkDelete, setPendingBulkDelete] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const formProfile = useMemo(() => ({
    ...profile,
    email: user?.email || '',
  }), [profile, user]);
  const dueTodayCompletionStreak = useMemo(() => getDueTodayCompletionStreak(tasks), [tasks]);
  const historyTasks = useMemo(() => tasks
    .filter((task) => task.status === 'done' || isTaskOverdue(task))
    .sort((first, second) => new Date(second.completed_at || second.due_at || second.due_date || second.created_at || 0) - new Date(first.completed_at || first.due_at || first.due_date || first.created_at || 0)), [tasks]);
  const filteredHistoryTasks = useMemo(() => {
    const search = historyFilters.search.trim().toLowerCase();

    return historyTasks.filter((task) => {
      const overdue = isTaskOverdue(task);
      const completed = task.status === 'done';

      if (historyFilters.type === 'completed' && !completed) return false;
      if (historyFilters.type === 'overdue' && !overdue) return false;
      if ((historyFilters.dateFrom || historyFilters.dateTo) && !isTaskInDateRange(task, historyFilters.dateFrom, historyFilters.dateTo)) {
        return false;
      }
      if (search && !`${task.title || ''} ${task.description || ''}`.toLowerCase().includes(search)) {
        return false;
      }

      return true;
    });
  }, [historyFilters, historyTasks]);
  const dateRangeTasks = useMemo(() => {
    if (!historyFilters.dateFrom && !historyFilters.dateTo) return [];
    return historyTasks.filter((task) => isTaskInDateRange(task, historyFilters.dateFrom, historyFilters.dateTo));
  }, [historyFilters.dateFrom, historyFilters.dateTo, historyTasks]);
  const selectedTaskIdSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds]);
  const selectedTasks = useMemo(() => (
    historyTasks.filter((task) => selectedTaskIdSet.has(task.id))
  ), [historyTasks, selectedTaskIdSet]);
  const allVisibleSelected = filteredHistoryTasks.length > 0 &&
    filteredHistoryTasks.every((task) => selectedTaskIdSet.has(task.id));

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
        text: tasksError.message || t('profile.loadTasksError'),
      });
    } finally {
      setIsTasksLoading(false);
    }
  }, [t]);

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
        text: t('profile.saved'),
      });
    } catch (saveError) {
      setMessage({
        variant: 'danger',
        text: saveError.message || t('profile.saveError'),
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
        text: t('profile.importSuccess', { count: rows.length }),
      });
    } catch (importError) {
      setMessage({
        variant: 'danger',
        text: importError.message || t('profile.importError'),
      });
    } finally {
      event.target.value = '';
    }
  };

  const updateHistoryFilter = (field, value) => {
    setHistoryFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const toggleTaskSelection = (taskId, isSelected) => {
    setSelectedTaskIds((currentIds) => (
      isSelected
        ? [...new Set([...currentIds, taskId])]
        : currentIds.filter((id) => id !== taskId)
    ));
  };

  const toggleVisibleSelection = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredHistoryTasks.map((task) => task.id));
      setSelectedTaskIds((currentIds) => currentIds.filter((id) => !visibleIds.has(id)));
      return;
    }

    setSelectedTaskIds((currentIds) => [
      ...new Set([...currentIds, ...filteredHistoryTasks.map((task) => task.id)]),
    ]);
  };

  const selectTasksByDateRange = () => {
    if (!historyFilters.dateFrom && !historyFilters.dateTo) {
      setMessage({ variant: 'warning', text: t('profile.dateRangeRequired') });
      return;
    }

    if (dateRangeTasks.length === 0) {
      setMessage({ variant: 'warning', text: t('profile.noTasksInDateRange') });
      return;
    }

    setSelectedTaskIds((currentIds) => [
      ...new Set([...currentIds, ...dateRangeTasks.map((task) => task.id)]),
    ]);
  };

  const requestDeleteSelected = () => {
    if (selectedTasks.length === 0) return;

    setPendingBulkDelete({
      ids: selectedTasks.map((task) => task.id),
      title: t('profile.deleteSelectedTitle'),
      message: t('profile.deleteSelectedMessage', { count: selectedTasks.length }),
    });
  };

  const requestDeleteDateRange = () => {
    if (!historyFilters.dateFrom && !historyFilters.dateTo) {
      setMessage({ variant: 'warning', text: t('profile.dateRangeRequired') });
      return;
    }

    if (dateRangeTasks.length === 0) {
      setMessage({ variant: 'warning', text: t('profile.noTasksInDateRange') });
      return;
    }

    setPendingBulkDelete({
      ids: dateRangeTasks.map((task) => task.id),
      title: t('profile.deleteDateRangeTitle'),
      message: t('profile.deleteDateRangeMessage', { count: dateRangeTasks.length }),
    });
  };

  const confirmBulkDelete = async () => {
    if (!pendingBulkDelete?.ids?.length) return;

    const idsToDelete = pendingBulkDelete.ids;
    setIsBulkDeleting(true);
    setMessage(null);

    try {
      await Promise.all(idsToDelete.map((taskId) => tasksApi.deleteTask(taskId)));
      const deletedIds = new Set(idsToDelete);
      const nextTasks = tasks.filter((task) => !deletedIds.has(task.id));
      setViewCache(PROFILE_TASKS_CACHE_KEY, nextTasks);
      setTasks(nextTasks);
      setSelectedTaskIds((currentIds) => currentIds.filter((id) => !deletedIds.has(id)));
      setPendingBulkDelete(null);
      setMessage({
        variant: 'success',
        text: t('profile.bulkDeleteSuccess', { count: idsToDelete.length }),
      });
      await refetchTasks();
    } catch (deleteError) {
      setMessage({
        variant: 'danger',
        text: deleteError.message || t('profile.bulkDeleteError'),
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">{t('profile.loading')}</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 mb-1">{t('profile.title')}</h1>
        <p className="text-muted mb-0">{t('profile.subtitle')}</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {message && (
        <Alert variant={message.variant} dismissible onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Tabs defaultActiveKey="profile" className="mb-4">
        <Tab eventKey="profile" title={t('profile.tabProfile')}>
          <div className="d-grid gap-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-wrapper bg-warning bg-opacity-10">
                      <Fire size={22} className="text-warning" />
                    </div>
                    <div>
                      <div className="small text-muted">{t('profile.dueTodayCompletionStreak')}</div>
                      <div className="h4 mb-0">{dueTodayCompletionStreak} {t('profile.daysShort')}</div>
                    </div>
                  </div>
                  <div className="text-muted small">
                    {t('profile.dueTodayCompletionStreakHint')}
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
                    <h2 className="h5 mb-1">{t('profile.importExportTitle')}</h2>
                    <p className="text-muted mb-0">{t('profile.importExportText')}</p>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Button variant="outline-secondary" onClick={handleExportTasks} disabled={isTasksLoading || tasks.length === 0}>
                      <BoxArrowDown className="me-2" />
                      {t('profile.exportCsv')}
                    </Button>
                    <Form.Label className="btn btn-outline-secondary mb-0">
                      <BoxArrowUp className="me-2" />
                      {t('profile.importCsv')}
                      <Form.Control type="file" accept=".csv,text/csv" className="d-none" onChange={handleImportTasks} />
                    </Form.Label>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Tab>

        <Tab eventKey="history" title={t('profile.tabHistory')}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-bottom">
              <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                <Card.Title className="h5 mb-0 d-flex align-items-center gap-2">
                  <ClockHistory size={20} />
                  {t('profile.historyTitle')}
                </Card.Title>
                <div className="small text-muted">
                  {t('profile.selectedCount', { count: selectedTasks.length })}
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4 border-bottom">
              <Row className="g-3 align-items-end">
                <Col md={6} xl={3}>
                  <Form.Label>{t('tasks.search')}</Form.Label>
                  <Form.Control
                    value={historyFilters.search}
                    onChange={(event) => updateHistoryFilter('search', event.target.value)}
                    placeholder={t('profile.searchHistory')}
                  />
                </Col>
                <Col md={6} xl={2}>
                  <Form.Label>{t('profile.historyType')}</Form.Label>
                  <Form.Select
                    value={historyFilters.type}
                    onChange={(event) => updateHistoryFilter('type', event.target.value)}
                  >
                    <option value="all">{t('profile.allHistory')}</option>
                    <option value="completed">{t('profile.completedOnly')}</option>
                    <option value="overdue">{t('profile.overdueOnly')}</option>
                  </Form.Select>
                </Col>
                <Col sm={6} xl={2}>
                  <Form.Label>{t('profile.dateFrom')}</Form.Label>
                  <Form.Control
                    type="date"
                    value={historyFilters.dateFrom}
                    onChange={(event) => updateHistoryFilter('dateFrom', event.target.value)}
                  />
                </Col>
                <Col sm={6} xl={2}>
                  <Form.Label>{t('profile.dateTo')}</Form.Label>
                  <Form.Control
                    type="date"
                    value={historyFilters.dateTo}
                    onChange={(event) => updateHistoryFilter('dateTo', event.target.value)}
                  />
                </Col>
                <Col xl={3}>
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={toggleVisibleSelection}
                      disabled={filteredHistoryTasks.length === 0}
                    >
                      <Check2Square className="me-2" />
                      {allVisibleSelected ? t('profile.clearSelection') : t('profile.selectVisible')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={selectTasksByDateRange}
                    >
                      {t('profile.selectByDate')}
                    </Button>
                  </div>
                </Col>
              </Row>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <Button
                  type="button"
                  variant="outline-danger"
                  onClick={requestDeleteSelected}
                  disabled={selectedTasks.length === 0 || isBulkDeleting}
                >
                  <Trash className="me-2" />
                  {t('profile.deleteSelected')}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={requestDeleteDateRange}
                  disabled={(!historyFilters.dateFrom && !historyFilters.dateTo) || dateRangeTasks.length === 0 || isBulkDeleting}
                >
                  <Trash className="me-2" />
                  {t('profile.deleteDateRange')}
                </Button>
              </div>
            </Card.Body>
            <Card.Body className="p-0">
              {isTasksLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary" />
                </div>
              ) : historyTasks.length === 0 ? (
                <div className="p-4 text-muted">{t('profile.historyEmpty')}</div>
              ) : filteredHistoryTasks.length === 0 ? (
                <div className="p-4 text-muted">{t('profile.historyFilteredEmpty')}</div>
              ) : (
                <ListGroup variant="flush">
                  {filteredHistoryTasks.map((task) => {
                    const overdue = isTaskOverdue(task);
                    const isSelected = selectedTaskIdSet.has(task.id);

                    return (
                      <ListGroup.Item
                        key={task.id}
                        action
                        className="py-3"
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <Row className="align-items-center g-3">
                          <Col xs="auto">
                            <Form.Check
                              checked={isSelected}
                              onChange={(event) => toggleTaskSelection(task.id, event.target.checked)}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`${isSelected ? t('profile.clearSelection') : t('profile.selectVisible')}: ${task.title}`}
                            />
                          </Col>
                          <Col>
                            <div className="fw-semibold">{task.title}</div>
                            <div className="small text-muted">
                              {t('profile.created')}: {formatDate(task.created_at, language, t('common.noDate'))} · {t('profile.due')}: {formatTaskDeadline(task, { language, noDueLabel: t('tasks.noDueDate') })}
                              {task.completed_at ? ` · ${t('profile.completed')}: ${formatDate(task.completed_at, language, t('common.noDate'))}` : ''}
                            </div>
                          </Col>
                          <Col xs="auto">
                            <Badge bg={overdue ? 'danger' : 'success'}>
                              {overdue ? t('profile.overdue') : t('profile.done')}
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

      <ConfirmDialog
        show={Boolean(pendingBulkDelete)}
        title={pendingBulkDelete?.title}
        message={pendingBulkDelete?.message}
        confirmLabel={isBulkDeleting ? t('common.deleting') : t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        confirmDisabled={isBulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setPendingBulkDelete(null)}
      />
    </div>
  );
};

export default ProfilePage;
