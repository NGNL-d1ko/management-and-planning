import { Card } from 'react-bootstrap';
import { CalendarEvent, ExclamationTriangle } from 'react-bootstrap-icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PriorityBadge from '../tasks/PriorityBadge';

const formatDate = (dateString) => (
  dateString
    ? new Date(`${dateString}T00:00:00`).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
    })
    : 'Без срока'
);

const isOverdue = (task) => {
  if (!task.due_date || task.status === 'done') {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${task.due_date}T00:00:00`) < today;
};

const KanbanCard = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };
  const overdue = isOverdue(task);

  return (
    <Card
      ref={setNodeRef}
      className={`border shadow-sm ${overdue ? 'border-danger-subtle' : ''}`}
      style={style}
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!isDragging) {
          onClick?.(task);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(task);
        }
      }}
      {...attributes}
      {...listeners}
    >
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <Card.Title className="h6 mb-0 lh-base">{task.title}</Card.Title>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center text-muted small mb-2">
          <span className="d-inline-flex align-items-center gap-1">
            <CalendarEvent size={14} />
            {formatDate(task.due_date)}
          </span>
        </div>

        {overdue && (
          <div className="d-flex align-items-center gap-1 text-danger small mb-2">
            <ExclamationTriangle size={14} />
            Просрочено
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default KanbanCard;
