import { Button } from 'react-bootstrap';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  framed = true,
}) => (
  <div className={`empty-state text-center ${framed ? 'border rounded-3 py-5 px-3' : 'is-frameless py-4 px-3'}`}>
    {Icon && <Icon size={40} className="text-muted mb-3" />}
    {title && <h3 className="h5 mb-2">{title}</h3>}
    {description && <p className="text-muted mb-4">{description}</p>}
    {actionLabel && onAction && (
      <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);

export default EmptyState;
