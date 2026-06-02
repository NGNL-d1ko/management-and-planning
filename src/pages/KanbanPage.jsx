import { useState } from 'react';
import { Form } from 'react-bootstrap';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { useLanguage } from '../context/LanguageContext';

const KanbanPage = () => {
  const { t } = useLanguage();
  const [showRecentlyCompleted, setShowRecentlyCompleted] = useState(false);

  return (
    <div>
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1">Kanban</h1>
          <p className="text-muted mb-0">
            {t('kanban.subtitle')}
          </p>
        </div>
        <Form.Check
          type="switch"
          id="kanban-show-recently-completed"
          label={t('kanban.showRecentlyCompleted')}
          checked={showRecentlyCompleted}
          onChange={(event) => setShowRecentlyCompleted(event.target.checked)}
        />
      </div>

      <KanbanBoard showRecentlyCompleted={showRecentlyCompleted} />
    </div>
  );
};

export default KanbanPage;
