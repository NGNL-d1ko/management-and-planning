import { useState } from 'react';
import { Alert, Button, Card, Container, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import PasswordField from '../components/auth/PasswordField';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { logout, updatePassword } = useAuth();
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const validateForm = () => {
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
      await updatePassword(password);
      await logout();
      navigate('/login?passwordUpdated=true', { replace: true });
    } catch (resetError) {
      setFormError(resetError.message || t('auth.resetError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '440px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold mb-2">{t('auth.resetTitle')}</h1>
            <p className="text-muted mb-0">{t('auth.resetSubtitle')}</p>
          </div>

          {formError && (
            <Alert variant="danger" className="mb-4">
              {formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <PasswordField
              controlId="reset-password"
              label={t('auth.resetPassword')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('auth.minPassword')}
              autoComplete="new-password"
              minLength={6}
              required
            />

            <PasswordField
              controlId="reset-confirm-password"
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
                  {t('common.saving')}
                </>
              ) : (
                t('auth.resetSubmit')
              )}
            </Button>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="text-decoration-none">
              {t('common.backToLogin')}
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResetPasswordPage;
