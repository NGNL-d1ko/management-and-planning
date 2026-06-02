import { Card, Col, Row } from 'react-bootstrap';
import {
  BarChart,
  CheckCircle,
  ExclamationTriangle,
  Percent,
} from 'react-bootstrap-icons';
import { useLanguage } from '../../context/LanguageContext';

const cardConfig = [
  {
    key: 'completionRate',
    labelKey: 'dashboard.completionRate',
    icon: Percent,
    variant: 'success',
    format: (value) => `${value || 0}%`,
  },
  {
    key: 'totalTasks',
    labelKey: 'dashboard.totalTasks',
    icon: BarChart,
    variant: 'primary',
    format: (value) => value || 0,
  },
  {
    key: 'completedTasks',
    labelKey: 'dashboard.completedTasks',
    icon: CheckCircle,
    variant: 'success',
    format: (value) => value || 0,
  },
  {
    key: 'overdueTasks',
    labelKey: 'dashboard.overdueTasks',
    icon: ExclamationTriangle,
    variant: 'danger',
    format: (value) => value || 0,
  },
];

const AnalyticsSummaryCards = ({ analytics }) => {
  const { t } = useLanguage();

  return (
    <Row className="g-3">
      {cardConfig.map((card) => {
        const Icon = card.icon;

        return (
          <Col key={card.key} md={6} xl={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <div className="text-muted small">{t(card.labelKey)}</div>
                  <div className="display-6 fw-bold">{card.format(analytics?.[card.key])}</div>
                </div>
                <div className={`rounded-circle bg-${card.variant} bg-opacity-10 p-3 text-${card.variant}`}>
                  <Icon size={24} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default AnalyticsSummaryCards;
