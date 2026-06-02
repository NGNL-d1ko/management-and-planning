import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { Plus, Search } from 'react-bootstrap-icons';
import { useLanguage } from '../../context/LanguageContext';

const TaskFilters = ({
  filters,
  onChange,
  onCreate,
}) => {
  const { t } = useLanguage();

  const updateFilter = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
        <h2 className="h4 mb-0">{t('tasks.title')}</h2>
        <Button variant="primary" onClick={onCreate}>
          <Plus className="me-2" />
          {t('tasks.newTask')}
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
              placeholder={t('tasks.search')}
            />
          </InputGroup>
        </Col>
        <Col sm={6} lg={3} xl={2}>
          <Form.Select
            value={filters.status || ''}
            onChange={(event) => updateFilter('status', event.target.value)}
            aria-label={t('tasks.statusFilter')}
          >
            <option value="">{t('tasks.allStatuses')}</option>
            <option value="backlog">{t('status.backlog')}</option>
            <option value="todo">{t('status.todo')}</option>
            <option value="in_progress">{t('status.in_progress')}</option>
            <option value="done">{t('status.done')}</option>
          </Form.Select>
        </Col>
        <Col sm={6} lg={3} xl={2}>
          <Form.Select
            value={filters.priority || ''}
            onChange={(event) => updateFilter('priority', event.target.value)}
            aria-label={t('tasks.priorityFilter')}
          >
            <option value="">{t('tasks.allPriorities')}</option>
            <option value="low">{t('priority.low')}</option>
            <option value="medium">{t('priority.medium')}</option>
            <option value="high">{t('priority.high')}</option>
            <option value="urgent">{t('priority.urgent')}</option>
          </Form.Select>
        </Col>
        <Col sm={12} lg={12} xl={3} className="d-flex align-items-center">
          <Form.Check
            type="switch"
            id="tasks-show-completed"
            label={t('tasks.showCompleted')}
            checked={Boolean(filters.includeCompleted)}
            onChange={(event) => updateFilter('includeCompleted', event.target.checked)}
          />
        </Col>
      </Row>
    </div>
  );
};

export default TaskFilters;
