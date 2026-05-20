import { useState } from 'react';
import { Badge, Button, Card, Form, InputGroup } from 'react-bootstrap';
import { PlusLg } from 'react-bootstrap-icons';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import EmptyState from '../ui/EmptyState';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({
  status,
  title,
  tasks,
  onAddTask,
  onTaskClick,
}) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = taskTitle.trim();
    if (!trimmedTitle) {
      return;
    }

    setIsAdding(true);

    try {
      await onAddTask(status, trimmedTitle);
      setTaskTitle('');
    } catch {
      // Ошибка показывается на уровне доски.
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      className={`border-0 shadow-sm h-100 ${isOver ? 'bg-primary-subtle' : 'bg-light'}`}
      style={{ minWidth: 300, maxWidth: 340 }}
    >
      <Card.Header className="bg-transparent border-0 pb-0">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <h2 className="h6 mb-0">{title}</h2>
          <Badge bg="secondary" pill>{tasks.length}</Badge>
        </div>
      </Card.Header>

      <Card.Body className="d-flex flex-column gap-3">
        <Form onSubmit={handleSubmit}>
          <InputGroup size="sm">
            <Form.Control
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Быстро добавить задачу"
              aria-label={`Добавить задачу в ${title}`}
              disabled={isAdding}
            />
            <Button type="submit" variant="primary" disabled={isAdding || !taskTitle.trim()}>
              <PlusLg aria-hidden="true" />
            </Button>
          </InputGroup>
        </Form>

        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <EmptyState
              title="Нет задач"
              description="Перетащите задачу сюда или используйте быстрое добавление выше."
              framed={false}
            />
          ) : (
            <div className="d-grid gap-2">
              {tasks.map((task) => (
                <KanbanCard key={task.id} task={task} onClick={onTaskClick} />
              ))}
            </div>
          )}
        </SortableContext>
      </Card.Body>
    </Card>
  );
};

export default KanbanColumn;
