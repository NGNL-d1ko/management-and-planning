import { Card } from 'react-bootstrap';
import { CalendarEvent, ExclamationTriangle } from 'react-bootstrap-icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatTaskDeadline, isTaskOverdue } from '../../utils/deadline';
import PriorityBadge from '../tasks/PriorityBadge';

export const KanbanCardPreview = ({ task, className = '' }) => {
  const overdue = isTaskOverdue(task);

  return (
    <Card className={`kanban-task-card border shadow-sm ${overdue ? 'border-danger-subtle' : ''} ${className}`}>
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <Card.Title className="h6 mb-0 lh-base">{task.title}</Card.Title>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center text-muted small mb-2">
          <span className="d-inline-flex align-items-center gap-1">
            <CalendarEvent size={14} />
            {formatTaskDeadline(task, { short: true })}
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
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.35 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className="kanban-sortable-item"
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
      <KanbanCardPreview task={task} className={isDragging ? 'is-dragging' : ''} />
    </div>
  );
};

export default KanbanCard;
