import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import * as tasksApi from '../../api/tasksApi';

const initialForm = {
  title: '',
  description: '',
  priority: 'medium',
  due_date: '',
};

const TaskCreateFromDateModal = ({
  show,
  onHide,
  selectedDate,
  onCreated,
}) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setForm({
        ...initialForm,
        due_date: selectedDate || '',
      });
      setError('');
    }
  }, [selectedDate, show]);

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

    if (!form.due_date) {
      return 'Срок выполнения обязателен.';
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

    setIsSaving(true);

    try {
      const task = await tasksApi.createTask(undefined, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        due_date: form.due_date,
      });

      onCreated?.(task);
      onHide();
    } catch (createError) {
      setError(createError.message || 'Не удалось создать задачу.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Создать задачу</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="calendar-task-due-date">
                <Form.Label>Срок выполнения</Form.Label>
                <Form.Control
                  type="date"
                  value={form.due_date}
                  onChange={(event) => updateField('due_date', event.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="calendar-task-title">
            <Form.Label>Название</Form.Label>
            <Form.Control
              value={form.title}
              maxLength={200}
              onChange={(event) => updateField('title', event.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="calendar-task-description">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="calendar-task-priority">
            <Form.Label>Приоритет</Form.Label>
            <Form.Select
              value={form.priority}
              onChange={(event) => updateField('priority', event.target.value)}
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
              <option value="urgent">Срочный</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Создание...' : 'Создать задачу'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaskCreateFromDateModal;
