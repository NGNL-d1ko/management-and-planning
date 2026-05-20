import { Toast, ToastContainer as BsToastContainer } from 'react-bootstrap';
import { useToast } from '../../context/ToastContext';

const VARIANT_LABEL = {
  success: 'Успешно',
  danger: 'Ошибка',
  warning: 'Предупреждение',
  info: 'Информация',
};

const ToastContainer = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <BsToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1100 }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          show
          onClose={() => dismissToast(toast.id)}
          style={{ borderLeft: `4px solid var(--color-${toast.variant === 'danger' ? 'danger' : toast.variant === 'warning' ? 'warning' : toast.variant === 'info' ? 'info' : 'success'})` }}
        >
          <Toast.Header closeButton>
            <strong className={`me-auto text-${toast.variant}`}>
              {VARIANT_LABEL[toast.variant] ?? toast.variant}
            </strong>
          </Toast.Header>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      ))}
    </BsToastContainer>
  );
};

export default ToastContainer;
