import { Alert, Col, Row } from 'react-bootstrap';
import {
  CheckCircle,
  ClipboardCheck,
  ExclamationTriangle,
  ListTask,
} from 'react-bootstrap-icons';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SummaryCard from '../components/dashboard/SummaryCard';
import TaskListWidget from '../components/dashboard/TaskListWidget';
import SkeletonCard from '../components/ui/SkeletonCard';
import useDashboard from '../hooks/useDashboard';

const DashboardPage = () => {
  const { dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div>
        <DashboardHeader />
        <SkeletonCard variant="stat" count={7} />
        <div className="mt-4">
          <SkeletonCard variant="row" count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <DashboardHeader />
        <Alert variant="danger">{error}</Alert>
      </>
    );
  }

  if (!dashboard) {
    return (
      <>
        <DashboardHeader />
        <Alert variant="info">Данные главной страницы пока недоступны.</Alert>
      </>
    );
  }

  return (
    <div>
      <DashboardHeader />

      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} xl={3}>
          <SummaryCard title="Всего задач" value={dashboard.totalTasks} icon={ListTask} variant="info" />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <SummaryCard title="Завершено задач" value={dashboard.completedTasks} icon={CheckCircle} variant="success" />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <SummaryCard title="Просрочено задач" value={dashboard.overdueTasks} icon={ExclamationTriangle} variant="danger" />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <SummaryCard title="Процент выполнения" value={dashboard.completionRate} suffix="%" icon={ClipboardCheck} variant="primary" />
        </Col>
      </Row>

      <Row className="g-4 align-items-start">
        <Col xs={12} xl={4}>
          <TaskListWidget
            title="Сегодня"
            tasks={dashboard.tasksDueToday}
            emptyMessage="На сегодня задач нет."
          />
        </Col>
        <Col xs={12} xl={4}>
          <TaskListWidget
            title="Ближайшие задачи"
            tasks={dashboard.upcomingTasks}
            emptyMessage="Ближайших задач нет."
          />
        </Col>
        <Col xs={12} xl={4}>
          <TaskListWidget
            title="Просрочено"
            tasks={dashboard.overdueTaskList}
            emptyMessage="Просроченных задач нет."
            danger
          />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
