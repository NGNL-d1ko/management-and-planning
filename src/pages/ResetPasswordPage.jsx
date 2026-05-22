import { useState } from 'react';
import { Alert, Button, Card, Container, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import PasswordField from '../components/auth/PasswordField';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { logout, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const validateForm = () => {
    if (password.length < 6) {
      return 'Пароль должен содержать минимум 6 символов.';
    }

    if (password !== confirmPassword) {
      return 'Пароли не совпадают.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePassword(password);
      await logout();
      navigate('/login?passwordUpdated=true', { replace: true });
    } catch (resetError) {
      setFormError(resetError.message || 'Не удалось обновить пароль. Откройте ссылку из письма ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '440px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold mb-2">Новый пароль</h1>
            <p className="text-muted mb-0">Введите новый пароль для аккаунта.</p>
          </div>

          {formError && (
            <Alert variant="danger" className="mb-4">
              {formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <PasswordField
              controlId="reset-password"
              label="Новый пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Минимум 6 символов"
              autoComplete="new-password"
              minLength={6}
              required
            />

            <PasswordField
              controlId="reset-confirm-password"
              label="Подтвердите пароль"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Повторите пароль"
              autoComplete="new-password"
              minLength={6}
              required
              className="mb-4"
            />

            <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Сохранение...
                </>
              ) : (
                'Сохранить пароль'
              )}
            </Button>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="text-decoration-none">
              Вернуться ко входу
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResetPasswordPage;
