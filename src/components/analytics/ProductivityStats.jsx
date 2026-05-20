import { Card, Col, ListGroup, Row } from 'react-bootstrap';

const formatDate = (date) => {
  if (!date) {
    return 'Завершённых задач пока нет';
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const ProductivityStats = ({ analytics }) => {
  const stats = [
    {
      label: 'Самый продуктивный день',
      value: `${formatDate(analytics?.mostProductiveDay?.date)}${
        analytics?.mostProductiveDay?.count ? ` (${analytics.mostProductiveDay.count})` : ''
      }`,
    },
    {
      label: 'В среднем выполнено задач в день',
      value: Number(analytics?.averageTasksCompletedPerDay || 0).toFixed(2),
    },
    {
      label: 'Процент выполнения',
      value: `${analytics?.completionRate || 0}%`,
    },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-transparent border-0 pb-0">
        <Card.Title className="h5 mb-0">Статистика продуктивности</Card.Title>
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
