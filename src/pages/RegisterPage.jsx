import { useState } from 'react';
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import PasswordField from '../components/auth/PasswordField';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const validateForm = () => {
    if (!fullName.trim()) {
      return t('auth.registerNameRequired');
    }
    if (!emailPattern.test(email)) {
      return t('auth.registerEmailInvalid');
    }
    if (password.length < 6) {
      return t('auth.passwordMinError');
    }
    if (password !== confirmPassword) {
      return t('auth.passwordMismatch');
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
      const result = await register(fullName.trim(), email, password);

      if (!result.session) {
        const normalizedEmail = email.trim().toLowerCase();
        navigate(`/confirm-email?email=${encodeURIComponent(normalizedEmail)}`, { replace: true });
        return;
      }

      navigate('/app/dashboard');
    } catch (registerError) {
      setFormError(registerError.message || t('auth.registerError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '480px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold mb-2">your MaP</h1>
            <p className="text-muted mb-0">{t('common.appSubtitle')}</p>
          </div>

          {formError && (
            <Alert variant="danger" className="mb-4">
              {formError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="register-full-name">
              <Form.Label>{t('auth.fullName')}</Form.Label>
              <Form.Control
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder={t('auth.fullNamePlaceholder')}
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

            <PasswordField
              controlId="register-password"
              label={t('auth.password')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('auth.minPassword')}
              autoComplete="new-password"
              minLength={6}
              required
            />

            <PasswordField
              controlId="register-confirm-password"
              label={t('auth.confirmPassword')}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={t('auth.repeatPassword')}
              autoComplete="new-password"
              minLength={6}
              required
              className="mb-4"
            />

            <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('auth.registerLoading')}
                </>
              ) : (
                t('auth.register')
              )}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <Link to="/login" className="text-decoration-none">
              {t('auth.registerHasAccount')}
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegisterPage;
