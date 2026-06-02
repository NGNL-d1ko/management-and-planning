import { useState } from 'react';
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ConfirmEmailPage = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const { resendSignupConfirmation } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState(initialEmail);
  const [isResending, setIsResending] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState(
    email ? t('auth.confirmSent', { email }) : '',
  );

  if (!initialEmail) {
    return <Navigate to="/login" replace />;
  }

  const handleResendConfirmation = async () => {
    const targetEmail = email.trim().toLowerCase();

    if (!targetEmail) {
      setFormError(t('auth.confirmEmailRequired'));
      return;
    }

    setFormError('');
    setNotice('');
    setIsResending(true);

    try {
      const result = await resendSignupConfirmation(targetEmail);
      setNotice(
        result.alreadyConfirmed
          ? t('auth.confirmAlready')
          : t('auth.confirmResent', { email: targetEmail }),
      );
    } catch (resendError) {
      setFormError(resendError.message || t('auth.confirmError'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <Card className="shadow-sm border-0 w-100" style={{ maxWidth: '480px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold mb-2">{t('auth.confirmTitle')}</h1>
            <p className="text-muted mb-0">{t('auth.confirmSubtitle')}</p>
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

          <Form.Group className="mb-3" controlId="confirm-email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Form.Group>

          <Button
            type="button"
            variant="outline-secondary"
            className="w-100 mb-2"
            onClick={handleResendConfirmation}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('auth.sending')}
              </>
            ) : (
              t('auth.confirmResend')
            )}
          </Button>

          <Button as={Link} to="/login" variant="primary" className="w-100">
            {t('common.backToLogin')}
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ConfirmEmailPage;
