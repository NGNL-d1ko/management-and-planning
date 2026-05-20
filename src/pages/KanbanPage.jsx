import { useState } from 'react';
import { Form } from 'react-bootstrap';
import KanbanBoard from '../components/kanban/KanbanBoard';

const KanbanPage = () => {
  const [showCompleted, setShowCompleted] = useState(false);

  return (
    <div>
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1">Kanban</h1>
          <p className="text-muted mb-0">
            Перемещайте задачи между статусами в рабочем пространстве.
          </p>
        </div>
        <Form.Check
          type="switch"
          id="kanban-show-completed"
          label="Показывать готовые"
          checked={showCompleted}
          onChange={(event) => setShowCompleted(event.target.checked)}
        />
      </div>

      <KanbanBoard showCompleted={showCompleted} />
    </div>
  );
};

export default KanbanPage;
