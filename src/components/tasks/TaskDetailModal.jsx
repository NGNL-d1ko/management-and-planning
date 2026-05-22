import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import useTask from '../../hooks/useTask';
import { combineDateAndTime, formatTaskDeadline, getTimeFromDueAt } from '../../utils/deadline';
import PriorityBadge from './PriorityBadge';
import TaskStatusBadge from './TaskStatusBadge';

const initialForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
  due_time: '',
};

const formatDateTime = (dateString) => (
  dateString
    ? new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'Нет данных'
);

const TaskDetailModal = ({
  show,
  onHide,
  taskId,
  projectId,
  onUpdated,
}) => {
  const {
    task,
    isLoading,
    error,
    updateTask,
    deleteTask,
  } = useTask(show ? taskId : null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date || '',
        due_time: getTimeFromDueAt(task.due_at),
      });
      setFormError('');
      setMessage('');
    }
  }, [task]);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!form.title.trim()) {
      return 'Название задачи обязательно.';
    }

    if (form.title.trim().length > 200) {
      return 'Название задачи должно содержать не более 200 символов.';
    }

    return '';
  };

  const handleSave = async () => {
    setFormError('');
    setMessage('');

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      await updateTask({
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date || null,
        due_at: combineDateAndTime(form.due_date, form.due_time),
      });
      setMessage('Задача успешно обновлена.');
      onUpdated?.();
    } catch (saveError) {
      setFormError(saveError.message || 'Не удалось обновить задачу.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Удалить эту задачу навсегда?');

    if (!confirmed) {
      return;
    }

    try {
      await deleteTask();
      onUpdated?.();
      onHide();
    } catch (deleteError) {
      setFormError(deleteError.message || 'Не удалось удалить задачу.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Детали задачи</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Загрузка задачи...</span>
            </Spinner>
          </div>
        ) : error || !task ? (
          <Alert variant="danger">{error || 'Задача не найдена.'}</Alert>
        ) : (
          <>
            {(formError || message) && (
              <Alert variant={formError ? 'danger' : 'success'}>
                {formError || message}
              </Alert>
            )}

            <div className="d-flex flex-wrap gap-2 mb-4">
              <TaskStatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>

            <Row className="g-3 mb-4">
              <Col md={4}>
                <div className="small text-muted">Дедлайн</div>
                <div className="fw-semibold">{formatTaskDeadline(task)}</div>
              </Col>
              <Col md={4}>
                <div className="small text-muted">Создана</div>
                <div className="fw-semibold">{formatDateTime(task.created_at)}</div>
              </Col>
              <Col md={4}>
                <div className="small text-muted">Обновлена</div>
                <div className="fw-semibold">{formatDateTime(task.updated_at)}</div>
              </Col>
              <Col md={4}>
                <div className="small text-muted">Завершена</div>
                <div className="fw-semibold">{formatDateTime(task.completed_at)}</div>
              </Col>
            </Row>

            <Form>
              <Form.Group className="mb-3" controlId={`task-detail-title-${projectId || 'default'}`}>
                <Form.Label>Название</Form.Label>
                <Form.Control
                  value={form.title}
                  maxLength={200}
                  onChange={(event) => updateField('title', event.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="task-detail-description">
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
                  <Form.Group className="mb-3" controlId="task-detail-status">
                    <Form.Label>Статус</Form.Label>
                    <Form.Select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                      <option value="backlog">Очередь</option>
                      <option value="todo">К выполнению</option>
                      <option value="in_progress">В работе</option>
                      <option value="done">Готово</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="task-detail-priority">
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
                  <Form.Group className="mb-3" controlId="task-detail-due-date">
                    <Form.Label>Срок выполнения</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.due_date}
                      onChange={(event) => updateField('due_date', event.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="task-detail-due-time">
                    <Form.Label>Время дедлайна</Form.Label>
                    <Form.Control
                      type="time"
                      value={form.due_time}
                      onChange={(event) => updateField('due_time', event.target.value)}
                      disabled={!form.due_date}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-danger" onClick={handleDelete} disabled={!task || isLoading}>
          Удалить задачу
        </Button>
        <Button variant="outline-secondary" onClick={onHide}>
          Закрыть
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!task || isLoading || isSaving}>
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskDetailModal;
