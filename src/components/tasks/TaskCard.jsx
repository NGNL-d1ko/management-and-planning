import { Card } from 'react-bootstrap';
import PriorityBadge from './PriorityBadge';
import TaskStatusBadge from './TaskStatusBadge';

const formatDate = (dateString) => (
  dateString
    ? new Date(`${dateString}T00:00:00`).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : 'Без срока'
);

const TaskCard = ({ task, onClick }) => (
  <Card className="border-0 shadow-sm" role="button" onClick={() => onClick(task)}>
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
        <Card.Title className="h6 mb-0">{task.title}</Card.Title>
        <TaskStatusBadge status={task.status} />
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="small text-muted">
        Срок: {formatDate(task.due_date)}
      </div>
    </Card.Body>
  </Card>
);

export default TaskCard;
