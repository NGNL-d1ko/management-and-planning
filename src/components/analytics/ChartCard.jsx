import { Card } from 'react-bootstrap';
import EmptyState from '../ui/EmptyState';

const ChartCard = ({ title, isEmpty, emptyMessage = 'Данных пока нет.', children }) => (
  <Card className={`border-0 shadow-sm h-100 ${title === 'Выполненные задачи по дням' ? 'ym-chart-card-dark' : ''}`}>
    <Card.Header className="bg-transparent border-0 pb-0">
      <Card.Title className="h5 mb-0">{title}</Card.Title>
    </Card.Header>
    <Card.Body>
      {isEmpty ? (
        <EmptyState title={emptyMessage} framed={false} />
      ) : (
        children
      )}
    </Card.Body>
  </Card>
);

export default ChartCard;
