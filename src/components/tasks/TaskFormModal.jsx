import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
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
  const { t } = useLanguage();
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
      return t('tasks.titleRequired');
    }

    if (form.title.trim().length > 200) {
      return t('tasks.titleTooLong');
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
      setError(submitError.message || t('tasks.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{task ? t('tasks.editTask') : t('tasks.newTask')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3" controlId="task-title">
            <Form.Label>{t('tasks.titleLabel')}</Form.Label>
            <Form.Control
              value={form.title}
              maxLength={200}
              onChange={(event) => updateField('title', event.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="task-description">
            <Form.Label>{t('tasks.descriptionLabel')}</Form.Label>
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
                <Form.Label>{t('tasks.statusLabel')}</Form.Label>
                <Form.Select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                  <option value="backlog">{t('status.backlog')}</option>
                  <option value="todo">{t('status.todo')}</option>
                  <option value="in_progress">{t('status.in_progress')}</option>
                  <option value="done">{t('status.done')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="task-priority">
                <Form.Label>{t('tasks.priorityLabel')}</Form.Label>
                <Form.Select value={form.priority} onChange={(event) => updateField('priority', event.target.value)}>
                  <option value="low">{t('priority.low')}</option>
                  <option value="medium">{t('priority.medium')}</option>
                  <option value="high">{t('priority.high')}</option>
                  <option value="urgent">{t('priority.urgent')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="task-due-date">
                <Form.Label>{t('tasks.dueDateLabel')}</Form.Label>
                <Form.Control
                  type="date"
                  value={form.due_date}
                  onChange={(event) => updateField('due_date', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="task-due-time">
                <Form.Label>{t('tasks.dueTimeLabel')}</Form.Label>
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
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('common.saving')}
              </>
            ) : (
              t('tasks.saveTask')
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaskFormModal;
