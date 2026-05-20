import { Button, Modal } from 'react-bootstrap';

const ConfirmDialog = ({
  show,
  title = 'Подтвердить',
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => (
  <Modal show={show} onHide={onCancel} centered size="sm">
    <Modal.Header closeButton>
      <Modal.Title className="h6">{title}</Modal.Title>
    </Modal.Header>
    {message && <Modal.Body>{message}</Modal.Body>}
    <Modal.Footer>
      <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
      <Button variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmDialog;
