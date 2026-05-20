import { useState } from 'react';
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, demoEmail, demoPassword, resendSignupConfirmation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState(
    searchParams.get('confirmed') === 'true'
      ? 'Email подтверждён. Теперь войдите в аккаунт.'
      : '',
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (loginError) {
      setFormError(loginError.message || 'Не удалось войти в аккаунт.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setFormError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/app/dashboard');
    } catch (err) {
      setFormError(err.message || 'Не удалось войти.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    const targetEmail = email.trim().toLowerCase();

    if (!targetEmail) {
      setFormError('Введите email, чтобы отправить письмо подтверждения.');
      return;
    }

    setFormError('');
    setNotice('');
    setIsResending(true);

    try {
      await resendSignupConfirmation(targetEmail);
      setNotice(`Письмо подтверждения отправлено на ${targetEmail}.`);
    } catch (resendError) {
      setFormError(resendError.message || 'Не удалось отправить письмо подтверждения.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '440px' }}>
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

          {notice && (
            <Alert variant="success" className="mb-4">
              {notice}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="login-email">
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

            <Form.Group className="mb-4" controlId="login-password">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Введите пароль"
                autoComplete="current-password"
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100 mb-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-100 mt-2"
              onClick={handleResendConfirmation}
              disabled={isSubmitting || isResending}
            >
              {isResending ? 'Отправка...' : 'Отправить письмо подтверждения ещё раз'}
            </Button>
          </Form>

          <div className="text-center mt-4">
            
            <Link to="/register" className="text-decoration-none">
              Нет аккаунта? Зарегистрироваться
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;
