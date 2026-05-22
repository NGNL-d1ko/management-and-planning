import { useState } from 'react';
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const targetEmail = email.trim().toLowerCase();

    if (!targetEmail) {
      setFormError('Введите email.');
      return;
    }

    setFormError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      await requestPasswordReset(targetEmail);
      setNotice(`Письмо для восстановления пароля отправлено на ${targetEmail}.`);
    } catch (resetError) {
      setFormError(resetError.message || 'Не удалось отправить письмо для восстановления пароля.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '440px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold mb-2">Восстановление пароля</h1>
            <p className="text-muted mb-0">Мы отправим ссылку для создания нового пароля.</p>
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
            <Form.Group className="mb-4" controlId="forgot-password-email">
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

            <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Отправка...
                </>
              ) : (
                'Отправить ссылку'
              )}
            </Button>
          </Form>

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

export default ForgotPasswordPage;
