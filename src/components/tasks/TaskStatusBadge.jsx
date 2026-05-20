import { Badge } from 'react-bootstrap';

const statusVariant = {
  backlog: 'secondary',
  todo: 'primary',
  in_progress: 'warning',
  done: 'success',
};

const statusLabel = {
  backlog: 'Очередь',
  todo: 'К выполнению',
  in_progress: 'В работе',
  done: 'Готово',
};

const TaskStatusBadge = ({ status }) => (
  <Badge bg={statusVariant[status] || 'secondary'}>
    {statusLabel[status] || 'К выполнению'}
  </Badge>
);

export default TaskStatusBadge;
