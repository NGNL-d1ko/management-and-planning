import { Button, Table } from 'react-bootstrap';
import { Pencil, Trash } from 'react-bootstrap-icons';
import { useLanguage } from '../../context/LanguageContext';
import PriorityBadge from './PriorityBadge';
import TaskStatusBadge from './TaskStatusBadge';
import { formatTaskDeadline } from '../../utils/deadline';

const TaskTable = ({
  tasks,
  onTaskClick,
  onEdit,
  onDelete,
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="table-responsive">
      <Table hover className="align-middle mb-0">
        <thead>
          <tr>
            <th>{t('tasks.titleLabel')}</th>
            <th>{t('tasks.statusLabel')}</th>
            <th>{t('tasks.priorityLabel')}</th>
            <th>{t('tasks.dueDateLabel')}</th>
            <th className="text-end">{t('tasks.actionsLabel')}</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>
                <Button
                  variant="link"
                  className="p-0 text-start text-decoration-none"
                  onClick={() => onTaskClick(task)}
                >
                  {task.title}
                </Button>
              </td>
              <td><TaskStatusBadge status={task.status} /></td>
              <td><PriorityBadge priority={task.priority} /></td>
              <td>{formatTaskDeadline(task, { language, noDueLabel: t('tasks.noDueDate') })}</td>
              <td>
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="outline-secondary" size="sm" onClick={() => onEdit(task)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => onDelete(task)}>
                    <Trash size={14} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TaskTable;
