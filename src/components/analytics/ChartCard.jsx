import { Card } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import EmptyState from '../ui/EmptyState';

const ChartCard = ({ title, isEmpty, emptyMessage, highlight = false, children }) => {
  const { t } = useLanguage();

  return (
    <Card className={`border-0 shadow-sm h-100 ${highlight ? 'ym-chart-card-dark' : ''}`}>
      <Card.Header className="bg-transparent border-0 pb-0">
        <Card.Title className="h5 mb-0">{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        {isEmpty ? (
          <EmptyState title={emptyMessage || t('analytics.empty')} framed={false} />
        ) : (
          children
        )}
      </Card.Body>
    </Card>
  );
};

export default ChartCard;
