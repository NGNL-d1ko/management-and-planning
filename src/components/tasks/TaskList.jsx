import { useMemo, useState } from 'react';
import { Alert, Card } from 'react-bootstrap';
import { ListTask } from 'react-bootstrap-icons';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import SkeletonCard from '../ui/SkeletonCard';
import { useToast } from '../../context/ToastContext';
import TaskCard from './TaskCard';
import TaskDetailModal from './TaskDetailModal';
import TaskFilters from './TaskFilters';
import TaskFormModal from './TaskFormModal';
import TaskTable from './TaskTable';
import useTasks from '../../hooks/useTasks';

const getDateLabel = (dateString) => {
  if (!dateString) {
    return 'Без срока';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${dateString}T00:00:00`);
  const diffDays = Math.round((date - today) / 86400000);

  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Завтра';
  if (diffDays === -1) return 'Вчера';

  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getDateSortValue = (dateString) => (
  dateString ? new Date(`${dateString}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER
);

const TaskList = ({ projectId }) => {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    includeCompleted: false,
  });
  const {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch,
  } = useTasks(projectId, filters);
  const { showToast } = useToast();
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const visibleTasks = useMemo(() => (
    filters.includeCompleted || filters.status === 'done'
      ? tasks
      : tasks.filter((task) => task.status !== 'done')
  ), [filters.includeCompleted, filters.status, tasks]);
  const taskGroups = useMemo(() => {
    const groupsByDate = visibleTasks.reduce((acc, task) => {
      const key = task.due_date || 'none';
      acc[key] = [...(acc[key] || []), task];
      return acc;
    }, {});

    return Object.entries(groupsByDate)
      .sort(([firstDate], [secondDate]) => (
        getDateSortValue(firstDate === 'none' ? '' : firstDate)
        - getDateSortValue(secondDate === 'none' ? '' : secondDate)
      ))
      .map(([date, groupTasks]) => ({
        date,
        label: getDateLabel(date === 'none' ? '' : date),
        tasks: groupTasks,
      }));
  }, [visibleTasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    setShowFormModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setShowFormModal(true);
  };

  const handleSubmitTask = async (data) => {
    if (editingTask) {
      const updatedTask = await updateTask(editingTask.id, data);
      showToast('Задача успешно обновлена.', 'success');
      return updatedTask;
    }

    const task = await createTask(data);
    showToast('Задача успешно создана.', 'success');
    return task;
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    const task = pendingDelete;
    setPendingDelete(null);

    try {
      await deleteTask(task.id);
      showToast('Задача удалена.', 'success');
    } catch (deleteError) {
      showToast(deleteError.message || 'Не удалось удалить задачу.', 'danger');
    }
  };

  return (
    <div>
      <TaskFilters
        filters={filters}
        onChange={setFilters}
        onCreate={openCreateModal}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoading ? (
        <SkeletonCard variant="row" count={5} />
      ) : visibleTasks.length === 0 ? (
        <EmptyState
          icon={ListTask}
          title="Задачи не найдены"
          description="Готовые задачи скрыты по умолчанию и доступны в истории профиля."
          actionLabel="Новая задача"
          onAction={openCreateModal}
        />
      ) : (
        <div className="d-grid gap-4">
          {taskGroups.map((group) => (
            <section key={group.date} aria-labelledby={`task-group-${group.date}`}>
              <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
                <h3 id={`task-group-${group.date}`} className="h5 mb-0">{group.label}</h3>
                <span className="small text-muted">{group.tasks.length}</span>
              </div>

              <Card className="border-0 shadow-sm d-none d-md-block">
                <Card.Body className="p-0">
                  <TaskTable
                    tasks={group.tasks}
                    onTaskClick={(task) => setSelectedTaskId(task.id)}
                    onEdit={openEditModal}
                    onDelete={(task) => setPendingDelete(task)}
                  />
                </Card.Body>
              </Card>

              <div className="d-grid gap-3 d-md-none">
                {group.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={(selectedTask) => setSelectedTaskId(selectedTask.id)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <TaskFormModal
        show={showFormModal}
        task={editingTask}
        onHide={() => setShowFormModal(false)}
        onSubmit={handleSubmitTask}
      />

      <TaskDetailModal
        show={Boolean(selectedTaskId)}
        taskId={selectedTaskId}
        projectId={projectId}
        onHide={() => setSelectedTaskId(null)}
        onUpdated={() => {
          void refetch().catch(() => {});
          showToast('Задача успешно обновлена.', 'success');
        }}
      />

      <ConfirmDialog
        show={Boolean(pendingDelete)}
        title="Удалить задачу"
        message={`Удалить «${pendingDelete?.title}»? Это действие нельзя отменить.`}
        confirmLabel="Удалить"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default TaskList;
