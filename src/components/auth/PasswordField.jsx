import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

const PasswordField = ({
  controlId,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
  required = false,
  className = 'mb-3',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeSlash : Eye;

  return (
    <Form.Group className={className} controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <div className="position-relative">
        <Form.Control
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          className="pe-5"
        />
        <Button
          type="button"
          variant="link"
          className="position-absolute top-50 end-0 translate-middle-y px-3 py-0 text-muted"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
          title={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
        >
          <Icon size={18} />
        </Button>
      </div>
    </Form.Group>
  );
};

export default PasswordField;
