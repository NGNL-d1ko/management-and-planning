import { Alert, Col, Row } from 'react-bootstrap';
import AnalyticsSummaryCards from '../components/analytics/AnalyticsSummaryCards';
import CompletedByDayChart from '../components/analytics/CompletedByDayChart';
import ProductivityStats from '../components/analytics/ProductivityStats';
import TasksByPriorityChart from '../components/analytics/TasksByPriorityChart';
import TasksByStatusChart from '../components/analytics/TasksByStatusChart';
import SkeletonCard from '../components/ui/SkeletonCard';
import useAnalytics from '../hooks/useAnalytics';

const AnalyticsPage = () => {
  const {
    analytics,
    isLoading,
    error,
  } = useAnalytics();

  if (isLoading) {
    return (
      <div>
        <div className="mb-4">
          <h1 className="h2 mb-1">Аналитика</h1>
          <p className="text-muted mb-0">
            Личная статистика продуктивности по проектам и задачам.
          </p>
        </div>
        <div className="d-grid gap-4">
          <SkeletonCard variant="stat" count={4} />
          <SkeletonCard variant="card" count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 mb-1">Аналитика</h1>
        <p className="text-muted mb-0">
          Личная статистика продуктивности по проектам и задачам.
        </p>
      </div>

      <div className="d-grid gap-4">
        <AnalyticsSummaryCards analytics={analytics} />

        <Row className="g-4">
          <Col lg={6}>
            <TasksByStatusChart data={analytics?.tasksByStatus} />
          </Col>
          <Col lg={6}>
            <TasksByPriorityChart data={analytics?.tasksByPriority} />
          </Col>
          <Col lg={6}>
            <CompletedByDayChart data={analytics?.completedByDay} />
          </Col>
        </Row>

        <ProductivityStats analytics={analytics} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
