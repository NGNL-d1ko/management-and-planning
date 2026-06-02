import { Badge } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';

const statusVariant = {
  backlog: 'secondary',
  todo: 'primary',
  in_progress: 'warning',
  done: 'success',
};

const TaskStatusBadge = ({ status }) => {
  const { t } = useLanguage();
  const normalizedStatus = status || 'todo';

  return (
    <Badge bg={statusVariant[normalizedStatus] || 'secondary'}>
      {t(`status.${normalizedStatus}`)}
    </Badge>
  );
};

export default TaskStatusBadge;
