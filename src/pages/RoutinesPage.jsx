import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { ArrowRepeat, CalendarCheck, PauseFill, Pencil, PlayFill, PlusLg, Trash } from 'react-bootstrap-icons';
import useRoutines from '../hooks/useRoutines';
import EmptyState from '../components/ui/EmptyState';
import SkeletonCard from '../components/ui/SkeletonCard';
import { useToast } from '../context/ToastContext';

const todayString = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  title: '',
  description: '',
  schedule: 'daily',
  priority: 'medium',
  start_date: todayString(),
  weekday: 1,
  day_of_month: 1,
  interval_days: 2,
  is_paused: false,
};

const scheduleLabels = {
  daily: 'Каждый день',
  weekdays: 'По будням',
  weekly: 'Раз в неделю',
  monthly: 'Раз в месяц',
  interval: 'Интервал',
};

const weekdayLabels = [
  { value: 1, label: 'Понедельник' },
  { value: 2, label: 'Вторник' },
  { value: 3, label: 'Среда' },
  { value: 4, label: 'Четверг' },
  { value: 5, label: 'Пятница' },
  { value: 6, label: 'Суббота' },
  { value: 0, label: 'Воскресенье' },
];

const formatDate = (dateString) => (
  dateString
    ? new Date(`${dateString}T00:00:00`).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : 'Нет даты'
);

const formatShortDate = (dateString) => (
  dateString
    ? new Date(`${dateString}T00:00:00`).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    })
    : 'Нет даты'
);

const getRoutineStatus = (routine) => {
  if (routine.is_paused) {
    return { label: 'На паузе', bg: 'secondary' };
  }

  if (routine.active_task_id) {
    return { label: 'В задачах', bg: routine.active_due_date < todayString() ? 'danger' : 'info' };
  }

  if (routine.next_due_date <= todayString()) {
    return { label: 'Готова к созданию', bg: 'warning' };
  }

  return { label: 'Запланирована', bg: 'success' };
};

const getScheduleDetails = (routine) => {
  if (routine.schedule === 'weekly') {
    return weekdayLabels.find((day) => day.value === Number(routine.weekday))?.label || scheduleLabels.weekly;
  }

  if (routine.schedule === 'monthly') {
    return `${routine.day_of_month || 1} число месяца`;
  }

  if (routine.schedule === 'interval') {
    return `Каждые ${routine.interval_days || 1} дн.`;
  }

  return scheduleLabels[routine.schedule] || scheduleLabels.daily;
};

const RoutineFormModal = ({
  show,
  routine,
  onHide,
  onSubmit,
}) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!show) {
      return;
    }

    setForm(routine ? {
      title: routine.title || '',
      description: routine.description || '',
      schedule: routine.schedule || 'daily',
      priority: routine.priority || 'medium',
      start_date: routine.start_date || todayString(),
      weekday: Number(routine.weekday ?? 1),
      day_of_month: Number(routine.day_of_month ?? 1),
      interval_days: Number(routine.interval_days ?? 2),
      is_paused: Boolean(routine.is_paused),
    } : initialForm);
    setError('');
    setIsSubmitting(false);
  }, [show, routine]);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Название рутины обязательно.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        weekday: Number(form.weekday),
        day_of_month: Number(form.day_of_month),
        interval_days: Number(form.interval_days),
      });
      onHide();
    } catch (submitError) {
      setError(submitError.message || 'Не удалось сохранить рутину.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{routine ? 'Редактировать рутину' : 'Новая рутина'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3" controlId="routine-title">
            <Form.Label>Название</Form.Label>
            <Form.Control
              value={form.title}
              maxLength={200}
              onChange={(event) => updateField('title', event.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="routine-description">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="routine-schedule">
                <Form.Label>Повторение</Form.Label>
                <Form.Select value={form.schedule} onChange={(event) => updateField('schedule', event.target.value)}>
                  <option value="daily">Каждый день</option>
                  <option value="weekdays">По будням</option>
                  <option value="weekly">Раз в неделю</option>
                  <option value="monthly">Раз в месяц</option>
                  <option value="interval">Свой интервал</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="routine-priority">
                <Form.Label>Приоритет</Form.Label>
                <Form.Select value={form.priority} onChange={(event) => updateField('priority', event.target.value)}>
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="urgent">Срочный</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="routine-start-date">
                <Form.Label>Начать с</Form.Label>
                <Form.Control
                  type="date"
                  value={form.start_date}
                  onChange={(event) => updateField('start_date', event.target.value)}
                />
              </Form.Group>
            </Col>

            {form.schedule === 'weekly' && (
              <Col md={6}>
                <Form.Group className="mb-3" controlId="routine-weekday">
                  <Form.Label>День недели</Form.Label>
                  <Form.Select value={form.weekday} onChange={(event) => updateField('weekday', event.target.value)}>
                    {weekdayLabels.map((day) => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {form.schedule === 'monthly' && (
              <Col md={6}>
                <Form.Group className="mb-3" controlId="routine-month-day">
                  <Form.Label>День месяца</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={31}
                    value={form.day_of_month}
                    onChange={(event) => updateField('day_of_month', event.target.value)}
                  />
                </Form.Group>
              </Col>
            )}

            {form.schedule === 'interval' && (
              <Col md={6}>
                <Form.Group className="mb-3" controlId="routine-interval">
                  <Form.Label>Интервал в днях</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={form.interval_days}
                    onChange={(event) => updateField('interval_days', event.target.value)}
                  />
                </Form.Group>
              </Col>
            )}
          </Row>

          <Form.Check
            type="switch"
            id="routine-paused"
            label="Поставить на паузу"
            checked={form.is_paused}
            onChange={(event) => updateField('is_paused', event.target.checked)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const RoutinesPage = () => {
  const {
    routines,
    isLoading,
    error,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    generateDueTasks,
  } = useRoutines();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeRoutines = useMemo(() => routines.filter((routine) => !routine.is_paused), [routines]);
  const openTasksCount = useMemo(() => routines.filter((routine) => routine.active_task_id).length, [routines]);

  const openCreateModal = () => {
    setEditingRoutine(null);
    setShowModal(true);
  };

  const openEditModal = (routine) => {
    setEditingRoutine(routine);
    setShowModal(true);
  };

  const handleSubmit = async (data) => {
    if (editingRoutine) {
      const routine = await updateRoutine(editingRoutine.id, data);
      showToast('Рутина обновлена.', 'success');
      return routine;
    }

    const routine = await createRoutine(data);
    showToast('Рутина создана.', 'success');
    return routine;
  };

  const handleTogglePause = async (routine) => {
    await updateRoutine(routine.id, { ...routine, is_paused: !routine.is_paused });
    showToast(routine.is_paused ? 'Рутина включена.' : 'Рутина поставлена на паузу.', 'success');
  };

  const handleDelete = async (routine) => {
    const confirmed = window.confirm(`Удалить рутину «${routine.title}»? Уже созданные задачи останутся в истории и списках.`);

    if (!confirmed) {
      return;
    }

    await deleteRoutine(routine.id);
    showToast('Рутина удалена.', 'success');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const generatedTasks = await generateDueTasks();
      showToast(
        generatedTasks.length
          ? `Создано задач: ${generatedTasks.length}.`
          : 'Новых задач по рутинам нет.',
        'success',
      );
    } catch (generateError) {
      showToast(generateError.message || 'Не удалось создать задачи по рутинам.', 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1">Рутины</h1>
          <p className="text-muted mb-0">
            Шаблоны повторяющихся дел создают обычные задачи только тогда, когда они нужны.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="outline-secondary" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <CalendarCheck className="me-2" />
            )}
            Создать на сегодня
          </Button>
          <Button variant="primary" onClick={openCreateModal}>
            <PlusLg className="me-2" />
            Новая рутина
          </Button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="small text-muted mb-1">Всего шаблонов</div>
              <div className="h3 mb-0">{routines.length}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="small text-muted mb-1">Активные</div>
              <div className="h3 mb-0">{activeRoutines.length}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="small text-muted mb-1">Уже в задачах</div>
              <div className="h3 mb-0">{openTasksCount}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoading ? (
        <SkeletonCard variant="row" count={4} />
      ) : routines.length === 0 ? (
        <EmptyState
          icon={ArrowRepeat}
          title="Рутин пока нет"
          description="Создайте шаблон для повторяющихся дел, чтобы не держать их вручную в задачах."
          actionLabel="Новая рутина"
          onAction={openCreateModal}
        />
      ) : (
        <Row className="g-3 align-items-start">
          {routines.map((routine) => {
            const status = getRoutineStatus(routine);

            return (
              <Col key={routine.id} xs={12} lg={6} xl={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div className="min-w-0">
                        <Card.Title className="h5 mb-1 text-truncate">{routine.title}</Card.Title>
                        <div className="small text-muted">{getScheduleDetails(routine)}</div>
                      </div>
                      <Badge bg={status.bg}>{status.label}</Badge>
                    </div>

                    {routine.description && (
                      <p className="text-muted small mb-3">{routine.description}</p>
                    )}

                    <div className="d-grid gap-2 small mb-3">
                      <div className="d-flex justify-content-between gap-3">
                        <span className="text-muted">Следующий срок</span>
                        <span className="fw-semibold">{formatShortDate(routine.active_due_date || routine.next_due_date)}</span>
                      </div>
                      <div className="d-flex justify-content-between gap-3">
                        <span className="text-muted">Стрик</span>
                        <span className="fw-semibold">{routine.streak || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between gap-3">
                        <span className="text-muted">Последнее выполнение</span>
                        <span className="fw-semibold">{routine.last_completed_date ? formatDate(routine.last_completed_date) : 'Нет данных'}</span>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      <Button variant="outline-secondary" size="sm" onClick={() => openEditModal(routine)}>
                        <Pencil className="me-1" />
                        Изменить
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => handleTogglePause(routine)}>
                        {routine.is_paused ? <PlayFill className="me-1" /> : <PauseFill className="me-1" />}
                        {routine.is_paused ? 'Включить' : 'Пауза'}
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(routine)}>
                        <Trash className="me-1" />
                        Удалить
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <RoutineFormModal
        show={showModal}
        routine={editingRoutine}
        onHide={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default RoutinesPage;
