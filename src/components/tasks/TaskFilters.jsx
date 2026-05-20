import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { Plus, Search } from 'react-bootstrap-icons';

const TaskFilters = ({
  filters,
  onChange,
  onCreate,
}) => {
  const updateFilter = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
        <h2 className="h4 mb-0">Задачи</h2>
        <Button variant="primary" onClick={onCreate}>
          <Plus className="me-2" />
          Новая задача
        </Button>
      </div>

      <Row className="g-3">
        <Col xl={5} lg={6}>
          <InputGroup>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              value={filters.search || ''}
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Поиск задач..."
            />
          </InputGroup>
        </Col>
        <Col sm={6} lg={3} xl={2}>
          <Form.Select
            value={filters.status || ''}
            onChange={(event) => updateFilter('status', event.target.value)}
            aria-label="Фильтр по статусу"
          >
            <option value="">Все статусы</option>
            <option value="backlog">Очередь</option>
            <option value="todo">К выполнению</option>
            <option value="in_progress">В работе</option>
            <option value="done">Готово</option>
          </Form.Select>
        </Col>
        <Col sm={6} lg={3} xl={2}>
          <Form.Select
            value={filters.priority || ''}
            onChange={(event) => updateFilter('priority', event.target.value)}
            aria-label="Фильтр по приоритету"
          >
            <option value="">Все приоритеты</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
            <option value="urgent">Срочный</option>
          </Form.Select>
        </Col>
        <Col sm={12} lg={12} xl={3} className="d-flex align-items-center">
          <Form.Check
            type="switch"
            id="tasks-show-completed"
            label="Показывать готовые"
            checked={Boolean(filters.includeCompleted)}
            onChange={(event) => updateFilter('includeCompleted', event.target.checked)}
          />
        </Col>
      </Row>
    </div>
  );
};

export default TaskFilters;
