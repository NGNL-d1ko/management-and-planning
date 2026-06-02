import { Card } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import { formatTaskDeadline } from '../../utils/deadline';
import PriorityBadge from './PriorityBadge';
import TaskStatusBadge from './TaskStatusBadge';

const TaskCard = ({ task, onClick }) => {
  const { language, t } = useLanguage();

  return (
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
          {t('dashboard.due')}: {formatTaskDeadline(task, {
            language,
            noDueLabel: t('tasks.noDueDate'),
          })}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TaskCard;
