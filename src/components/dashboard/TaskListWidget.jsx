import { useState } from 'react';
import { Badge, Button, Card, ListGroup } from 'react-bootstrap';
import EmptyState from '../ui/EmptyState';

const priorityVariant = {
  low: 'secondary',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

const priorityLabel = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочный',
};

const visibleTaskLimit = 2;

const formatDate = (dateString) => {
  if (!dateString) {
    return 'Без срока';
  }

  return new Date(`${dateString}T00:00:00`).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
  });
};

const TaskListWidget = ({
  title,
  tasks = [],
  emptyMessage,
  danger = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasOverflow = tasks.length >= 3;
  const visibleTasks = hasOverflow && !isExpanded
    ? tasks.slice(0, visibleTaskLimit)
    : tasks;

  return (
    <Card className={`border-0 shadow-sm ${danger ? 'ym-chart-card-dark border border-danger border-opacity-25' : ''}`}>
      <Card.Header className="bg-transparent border-bottom">
        <Card.Title className="h5 mb-0">{title}</Card.Title>
      </Card.Header>
      <Card.Body className="p-0">
        {tasks.length === 0 ? (
          <EmptyState title={emptyMessage} framed={false} />
        ) : (
          <>
            <div className={`task-widget-list ${hasOverflow && !isExpanded ? 'is-compacted' : ''}`}>
              <ListGroup variant="flush">
                {visibleTasks.map((task) => (
                  <ListGroup.Item key={task.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div className="min-w-0">
                        <div className="fw-semibold text-truncate">{task.title}</div>
                        {task.projectName && (
                          <div className="small text-muted text-truncate">{task.projectName}</div>
                        )}
                      </div>
                      <Badge bg={priorityVariant[task.priority] || 'secondary'}>
                        {priorityLabel[task.priority] || 'Средний'}
                      </Badge>
                    </div>
                    <div className={`small mt-2 ${danger ? 'text-danger' : 'text-muted'}`}>
                      Срок: {formatDate(task.due_date)}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {hasOverflow && (
                <div className={isExpanded ? 'border-top p-2 text-center' : 'task-widget-more-overlay'}>
                  <Button
                    type="button"
                    variant={isExpanded ? 'link' : 'primary'}
                    size={isExpanded ? undefined : 'sm'}
                    className="text-decoration-none"
                    onClick={() => setIsExpanded((current) => !current)}
                  >
                    {isExpanded ? 'Показать меньше' : 'Показать ещё'}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default TaskListWidget;
