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
import { useLanguage } from '../context/LanguageContext';
import useDashboard from '../hooks/useDashboard';

const DashboardPage = () => {
  const { t } = useLanguage();
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
        <Alert variant="info">{t('dashboard.unavailable')}</Alert>
      </>
    );
  }

  return (
    <div>
      <DashboardHeader />

      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} xl={3}>
          <SummaryCard title={t('dashboard.totalTasks')} value={dashboard.totalTasks} icon={ListTask} variant="info" />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <SummaryCard title={t('dashboard.completedTasks')} value={dashboard.completedTasks} icon={CheckCircle} variant="success" />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <SummaryCard title={t('dashboard.overdueTasks')} value={dashboard.overdueTasks} icon={ExclamationTriangle} variant="danger" />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <SummaryCard title={t('dashboard.completionRate')} value={dashboard.completionRate} suffix="%" icon={ClipboardCheck} variant="primary" />
        </Col>
      </Row>

      <Row className="g-4 align-items-start">
        <Col xs={12} xl={4}>
          <TaskListWidget
            title={t('dashboard.today')}
            tasks={dashboard.tasksDueToday}
            emptyMessage={t('dashboard.todayEmpty')}
          />
        </Col>
        <Col xs={12} xl={4}>
          <TaskListWidget
            title={t('dashboard.upcoming')}
            tasks={dashboard.upcomingTasks}
            emptyMessage={t('dashboard.upcomingEmpty')}
          />
        </Col>
        <Col xs={12} xl={4}>
          <TaskListWidget
            title={t('dashboard.overdue')}
            tasks={dashboard.overdueTaskList}
            emptyMessage={t('dashboard.overdueEmpty')}
            danger
          />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
