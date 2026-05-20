import { useState } from 'react';
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, resendSignupConfirmation } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const validateForm = () => {
    if (!fullName.trim()) {
      return 'Введите имя.';
    }
    if (!emailPattern.test(email)) {
      return 'Введите корректный email.';
    }
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
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(fullName.trim(), email, password);

      if (!result.session) {
        const normalizedEmail = email.trim().toLowerCase();
        setPendingEmail(normalizedEmail);
        setSuccessMessage(`Мы отправили письмо подтверждения на ${normalizedEmail}. Подтвердите email, затем войдите в аккаунт.`);
        return;
      }

      navigate('/app/dashboard');
    } catch (registerError) {
      setFormError(registerError.message || 'Не удалось зарегистрироваться.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    const targetEmail = (pendingEmail || email).trim().toLowerCase();

    if (!targetEmail) {
      setFormError('Введите email, чтобы отправить письмо подтверждения.');
      return;
    }

    setFormError('');
    setIsResending(true);

    try {
      await resendSignupConfirmation(targetEmail);
      setPendingEmail(targetEmail);
      setSuccessMessage(`Письмо подтверждения повторно отправлено на ${targetEmail}.`);
    } catch (resendError) {
      setFormError(resendError.message || 'Не удалось отправить письмо подтверждения.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '480px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold mb-2">your MaP</h1>
            <p className="text-muted mb-0">Управление и планирование</p>
          </div>

          {formError && (
            <Alert variant="danger" className="mb-4">
              {formError}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" className="mb-4">
              {successMessage}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="register-full-name">
              <Form.Label>Полное имя</Form.Label>
              <Form.Control
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Ваше имя"
                autoComplete="name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="register-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="register-password">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="register-confirm-password">
              <Form.Label>Подтвердите пароль</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Повторите пароль"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Регистрация...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </Button>

            {(pendingEmail || successMessage) && (
              <Button
                type="button"
                variant="outline-secondary"
                className="w-100 mt-2"
                onClick={handleResendConfirmation}
                disabled={isSubmitting || isResending}
              >
                {isResending ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Отправка...
                  </>
                ) : (
                  'Отправить письмо ещё раз'
                )}
              </Button>
            )}
          </Form>

          <div className="text-center mt-4">
            <Link to="/login" className="text-decoration-none">
              Уже есть аккаунт? Войти
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegisterPage;
