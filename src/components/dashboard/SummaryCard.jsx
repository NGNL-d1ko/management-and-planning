import { Card } from 'react-bootstrap';

const SummaryCard = ({ title, value, icon: Icon, variant = 'primary', suffix = '' }) => (
  <Card className="h-100 border-0 shadow-sm">
    <Card.Body>
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div>
          <div className="text-muted small mb-1">{title}</div>
          <div className="fs-3 fw-bold">
            {value}
            {suffix}
          </div>
        </div>
        {Icon && (
          <div className={`bg-${variant} bg-opacity-10 text-${variant} rounded-3 p-2`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </Card.Body>
  </Card>
);

export default SummaryCard;
