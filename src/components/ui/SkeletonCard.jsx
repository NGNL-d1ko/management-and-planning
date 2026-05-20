import { Card, Col, Row } from 'react-bootstrap';

const Bar = ({ width = '100%', height = 12, className = '' }) => (
  <div
    className={`skeleton-pulse ${className}`}
    style={{ width, height, borderRadius: 4 }}
  />
);

const StatSkeleton = () => (
  <Card className="border-0 shadow-sm h-100">
    <Card.Body>
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div style={{ flex: 1 }}>
          <Bar width="55%" height={11} className="mb-2" />
          <Bar width="40%" height={28} />
        </div>
        <div className="skeleton-pulse rounded-3 flex-shrink-0" style={{ width: 42, height: 42 }} />
      </div>
    </Card.Body>
  </Card>
);

const CardSkeleton = () => (
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="d-flex flex-column gap-3">
      <div className="d-flex align-items-center gap-2">
        <div className="skeleton-pulse rounded-circle flex-shrink-0" style={{ width: 12, height: 12 }} />
        <Bar height={18} />
      </div>
      <div>
        <Bar className="mb-2" />
        <Bar width="80%" />
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <Bar width={60} height={20} />
        <Bar width={80} height={10} />
      </div>
      <Bar height={6} />
    </Card.Body>
  </Card>
);

const RowSkeleton = () => (
  <div className="d-flex align-items-center gap-3 p-3 border rounded">
    <div className="skeleton-pulse rounded-circle flex-shrink-0" style={{ width: 32, height: 32 }} />
    <div style={{ flex: 1 }}>
      <Bar width="65%" className="mb-2" />
      <Bar width="40%" height={10} />
    </div>
    <Bar width={56} height={20} />
  </div>
);

const SkeletonCard = ({ variant = 'card', count = 1 }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'stat') {
    return (
      <Row className="g-3">
        {items.map((i) => (
          <Col key={i} xs={12} sm={6} xl={3}>
            <StatSkeleton />
          </Col>
        ))}
      </Row>
    );
  }

  if (variant === 'row') {
    return (
      <div className="d-grid gap-2">
        {items.map((i) => <RowSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <Row className="g-4">
      {items.map((i) => (
        <Col key={i} sm={12} md={6} xl={4}>
          <CardSkeleton />
        </Col>
      ))}
    </Row>
  );
};

export default SkeletonCard;
