import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';

const localeByLanguage = {
  ru: 'ru-RU',
  en: 'en-US',
  kk: 'kk-KZ',
};

const formatDate = (date, language, emptyLabel) => {
  if (!date) {
    return emptyLabel;
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(localeByLanguage[language] || 'ru-RU', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const ProductivityStats = ({ analytics }) => {
  const { language, t } = useLanguage();
  const stats = [
    {
      label: t('analytics.bestDay'),
      value: `${formatDate(analytics?.mostProductiveDay?.date, language, t('analytics.noCompleted'))}${
        analytics?.mostProductiveDay?.count ? ` (${analytics.mostProductiveDay.count})` : ''
      }`,
    },
    {
      label: t('analytics.avgCompleted'),
      value: Number(analytics?.averageTasksCompletedPerDay || 0).toFixed(2),
    },
    {
      label: t('dashboard.completionRate'),
      value: `${analytics?.completionRate || 0}%`,
    },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-transparent border-0 pb-0">
        <Card.Title className="h5 mb-0">{t('analytics.productivityTitle')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col lg={12}>
            <ListGroup variant="flush">
              {stats.map((stat) => (
                <ListGroup.Item
                  key={stat.label}
                  className="d-flex justify-content-between align-items-center px-0"
                >
                  <span className="text-muted">{stat.label}</span>
                  <span className="fw-semibold text-end">{stat.value}</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProductivityStats;
