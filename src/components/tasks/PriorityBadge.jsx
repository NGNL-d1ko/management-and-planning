import { Badge } from 'react-bootstrap';

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

const PriorityBadge = ({ priority }) => (
  <Badge bg={priorityVariant[priority] || 'info'}>
    {priorityLabel[priority] || 'Средний'}
  </Badge>
);

export default PriorityBadge;
