import { Badge } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';

const priorityVariant = {
  low: 'secondary',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

const PriorityBadge = ({ priority }) => {
  const { t } = useLanguage();
  const normalizedPriority = priority || 'medium';

  return (
    <Badge bg={priorityVariant[normalizedPriority] || 'info'}>
      {t(`priority.${normalizedPriority}`)}
    </Badge>
  );
};

export default PriorityBadge;
