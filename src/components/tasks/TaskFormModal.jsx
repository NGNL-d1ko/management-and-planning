import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { combineDateAndTime, getTimeFromDueAt } from '../../utils/deadline';

const initialForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
  due_time: '',
};

const TaskFormModal = ({
  show,
  task = null,
  onHide,
  onSubmit,
}) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      setForm(task ? {
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date || '',
        due_time: getTimeFromDueAt(task.due_at),
      } : initialForm);
      setError('');
      setIsSubmitting(false);
    }
  }, [show, task]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date || null,
        due_at: combineDateAndTime(form.due_date, form.due_time),
      };

      await onSubmit(payload);
      onHide();
    } catch (submitError) {
      setError(submitError.message || 'Не удалось сохранить задачу.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{task ? 'Редактировать задачу' : 'Новая задача'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3" controlId="task-title">
            <Form.Label>Название</Form.Label>
            <Form.Control
              value={form.title}
              maxLength={200}
              onChange={(event) => updateField('title', event.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="task-description">
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
              <Form.Group className="mb-3" controlId="task-status">
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
              <Form.Group className="mb-3" controlId="task-priority">
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
              <Form.Group className="mb-3" controlId="task-due-date">
                <Form.Label>Срок выполнения</Form.Label>
                <Form.Control
                  type="date"
                  value={form.due_date}
                  onChange={(event) => updateField('due_date', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="task-due-time">
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
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Сохранение...
              </>
            ) : (
              'Сохранить задачу'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaskFormModal;
