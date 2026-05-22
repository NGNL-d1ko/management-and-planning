import { useMemo, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  defaultDropAnimationSideEffects,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import useTasks from '../../hooks/useTasks';
import TaskDetailModal from '../tasks/TaskDetailModal';
import KanbanColumn from './KanbanColumn';
import { KanbanCardPreview } from './KanbanCard';

const columns = [
  { status: 'backlog', title: 'Очередь' },
  { status: 'todo', title: 'К выполнению' },
  { status: 'in_progress', title: 'В работе' },
  { status: 'done', title: 'Готово' },
];

const columnStatuses = columns.map((column) => column.status);
const RECENT_DONE_DAYS = 7;

const sortTasks = (tasks) => [...tasks].sort((first, second) => {
  const positionDiff = (first.position || 0) - (second.position || 0);

  if (positionDiff !== 0) {
    return positionDiff;
  }

  return new Date(second.created_at || 0) - new Date(first.created_at || 0);
});

const getCompletedAt = (status) => (status === 'done' ? new Date().toISOString() : null);

const isRecentlyCompleted = (task) => {
  if (task.status !== 'done' || !task.completed_at) {
    return false;
  }

  const completedAt = new Date(task.completed_at);
  if (Number.isNaN(completedAt.getTime())) {
    return false;
  }

  return Date.now() - completedAt.getTime() <= RECENT_DONE_DAYS * 24 * 60 * 60 * 1000;
};

const dropAnimation = {
  duration: 180,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.35',
      },
    },
  }),
};

const KanbanBoard = ({ projectId, showCompleted = false }) => {
  const {
    tasks,
    setTasks,
    isLoading,
    error,
    createTask,
    updateStatus,
    updatePosition,
    refetch,
  } = useTasks(projectId);
  const [boardError, setBoardError] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { groupedTasks, hiddenOldDoneCount } = useMemo(() => {
    const grouped = columns.reduce((acc, column) => {
      acc[column.status] = sortTasks(tasks.filter((task) => {
        if (task.status !== column.status) {
          return false;
        }

        if (column.status !== 'done' || showCompleted) {
          return true;
        }

        return isRecentlyCompleted(task);
      }));
      return acc;
    }, {});
    const hiddenDone = showCompleted
      ? 0
      : tasks.filter((task) => task.status === 'done' && !isRecentlyCompleted(task)).length;

    return { groupedTasks: grouped, hiddenOldDoneCount: hiddenDone };
  }, [showCompleted, tasks]);

  const getTaskById = (taskId) => tasks.find((task) => task.id === taskId);
  const activeTask = activeTaskId ? getTaskById(activeTaskId) : null;

  const getStatusByOverId = (overId) => {
    if (columnStatuses.includes(overId)) {
      return overId;
    }

    return getTaskById(overId)?.status || null;
  };

  const buildOptimisticTasks = (activeTask, overId, destinationStatus) => {
    const sourceStatus = activeTask.status;
    const tasksWithoutActive = tasks.filter((task) => task.id !== activeTask.id);
    const affectedStatuses = new Set([sourceStatus, destinationStatus]);
    const statusGroups = {};

    affectedStatuses.forEach((status) => {
      statusGroups[status] = sortTasks(tasksWithoutActive.filter((task) => task.status === status));
    });

    const destinationTasks = statusGroups[destinationStatus];
    const overIndex = destinationTasks.findIndex((task) => task.id === overId);
    const insertIndex = overIndex === -1 ? destinationTasks.length : overIndex;
    const movedTask = {
      ...activeTask,
      status: destinationStatus,
      completed_at: destinationStatus === sourceStatus ? activeTask.completed_at : getCompletedAt(destinationStatus),
    };

    destinationTasks.splice(insertIndex, 0, movedTask);

    affectedStatuses.forEach((status) => {
      statusGroups[status] = statusGroups[status].map((task, index) => ({
        ...task,
        position: index + 1,
      }));
    });

    const updatedById = new Map();
    Object.values(statusGroups).flat().forEach((task) => {
      updatedById.set(task.id, task);
    });

    return tasks.map((task) => updatedById.get(task.id) || task);
  };

  const persistMove = async (previousTasks, nextTasks, activeTaskId) => {
    const previousById = new Map(previousTasks.map((task) => [task.id, task]));
    const nextById = new Map(nextTasks.map((task) => [task.id, task]));
    const activeTask = nextById.get(activeTaskId);
    const previousActiveTask = previousById.get(activeTaskId);
    const requests = [];

    if (activeTask?.status !== previousActiveTask?.status) {
      requests.push(updateStatus(activeTaskId, activeTask.status));
    }

    nextTasks.forEach((task) => {
      const previousTask = previousById.get(task.id);

      if (previousTask && previousTask.position !== task.position) {
        requests.push(updatePosition(task.id, task.position));
      }
    });

    await Promise.all(requests);
    setTasks(nextTasks);
  };

  const handleDragStart = ({ active }) => {
    setActiveTaskId(active.id);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTaskId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeTask = getTaskById(active.id);
    const destinationStatus = getStatusByOverId(over.id);

    if (!activeTask || !destinationStatus) {
      return;
    }

    const previousTasks = tasks;
    const nextTasks = buildOptimisticTasks(activeTask, over.id, destinationStatus);
    const activeBefore = previousTasks.find((task) => task.id === active.id);
    const activeAfter = nextTasks.find((task) => task.id === active.id);

    if (
      activeBefore?.status === activeAfter?.status
      && activeBefore?.position === activeAfter?.position
    ) {
      return;
    }

    setBoardError('');
    setTasks(nextTasks);

    try {
      await persistMove(previousTasks, nextTasks, active.id);
    } catch (moveError) {
      setTasks(previousTasks);
      setBoardError(moveError.message || 'Не удалось переместить задачу.');
    }
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
  };

  const handleAddTask = async (status, title) => {
    setBoardError('');

    try {
      await createTask({
        title,
        status,
        priority: 'medium',
      });
    } catch (createError) {
      setBoardError(createError.message || 'Не удалось создать задачю.');
      throw createError;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка доски...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      {(error || boardError) && (
        <Alert variant="danger">{boardError || error}</Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="ym-kanban-wrapper overflow-auto pb-3">
          <div className="d-flex gap-3 align-items-stretch" style={{ minHeight: 520 }}>
            {columns.map((column) => (
              <KanbanColumn
                key={column.status}
                status={column.status}
                title={column.title}
                tasks={groupedTasks[column.status] || []}
                hiddenCompletedCount={column.status === 'done' ? hiddenOldDoneCount : 0}
                onAddTask={handleAddTask}
                onTaskClick={(task) => setSelectedTaskId(task.id)}
              />
            ))}
          </div>
        </div>
        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? <KanbanCardPreview task={activeTask} className="is-overlay" /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        show={Boolean(selectedTaskId)}
        onHide={() => setSelectedTaskId(null)}
        taskId={selectedTaskId}
        projectId={projectId}
        onUpdated={() => {
          void refetch().catch(() => {});
        }}
      />
    </>
  );
};

export default KanbanBoard;
