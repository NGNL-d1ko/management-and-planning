import { useState } from 'react';
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PasswordField from '../components/auth/PasswordField';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState(() => {
    if (searchParams.get('confirmed') === 'true') {
      return 'Email подтверждён. Теперь войдите в аккаунт.';
    }

    if (searchParams.get('passwordUpdated') === 'true') {
      return 'Пароль обновлён. Теперь войдите в аккаунт.';
    }

    return '';
  });

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

            <PasswordField
              controlId="login-password"
              label="Пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
              required
              className="mb-3"
            />

            <div className="text-end mb-4">
              <Link to="/forgot-password" className="text-decoration-none small">
                Забыли пароль?
              </Link>
            </div>

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
