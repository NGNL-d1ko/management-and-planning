import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Alarm, Bell, Clock, Envelope, Globe2, Save, Trash } from 'react-bootstrap-icons';
import { languageOptions, useLanguage } from '../../context/LanguageContext';

const initialForm = {
  theme: 'light',
  language: 'ru',
  timezone: 'UTC',
  desktopNotifications: false,
  emailNotifications: false,
  taskReminders: true,
};

const getTimezoneOptions = () => {
  if (typeof Intl.supportedValuesOf === 'function') {
    return Intl.supportedValuesOf('timeZone');
  }

  return [
    'UTC',
    'Asia/Qyzylorda',
    'Asia/Almaty',
    'Europe/Moscow',
    'Europe/London',
    'America/New_York',
    'America/Los_Angeles',
  ];
};

const normalizeSettings = (settings, fallbackLanguage, fallbackTimezone) => ({
  theme: settings?.theme || initialForm.theme,
  language: settings?.language || fallbackLanguage || initialForm.language,
  timezone: settings?.timezone || fallbackTimezone || initialForm.timezone,
  desktopNotifications: Boolean(settings?.notifications?.desktop ?? settings?.desktopNotifications),
  emailNotifications: Boolean(settings?.notifications?.email ?? settings?.emailNotifications),
  taskReminders: Boolean(settings?.notifications?.taskReminders ?? initialForm.taskReminders),
});

const SettingsForm = ({
  settings,
  detectedTimezone,
  notificationPermission,
  onSubmit,
  onLanguagePreview,
  isSaving,
  onDeleteProfile,
  isDeletingProfile,
}) => {
  const { language, t } = useLanguage();
  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);
  const baseline = useMemo(
    () => normalizeSettings(settings, language, detectedTimezone),
    [detectedTimezone, language, settings],
  );
  const [form, setForm] = useState(baseline);

  useEffect(() => {
    setForm(baseline);
  }, [baseline]);

  const isDirty = useMemo(() => (
    JSON.stringify(form) !== JSON.stringify(baseline)
  ), [baseline, form]);

  const permissionVariant = {
    granted: 'success',
    denied: 'danger',
    default: 'secondary',
    unsupported: 'secondary',
  }[notificationPermission] || 'secondary';

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    if (field === 'language') {
      onLanguagePreview?.(value);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      theme: form.theme,
      language: form.language,
      timezone: form.timezone,
      notifications: {
        desktop: form.desktopNotifications,
        email: form.emailNotifications,
        taskReminders: form.taskReminders,
      },
    });
  };

  return (
    <div className="d-grid gap-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <h2 className="h5 mb-3">{t('settings.preferences')}</h2>

            <Row className="g-3 mb-4">
              <Col md={4}>
                <Form.Group controlId="settings-theme">
                  <Form.Label>{t('settings.theme')}</Form.Label>
                  <Form.Select
                    value={form.theme}
                    onChange={(event) => updateField('theme', event.target.value)}
                  >
                    <option value="light">{t('settings.light')}</option>
                    <option value="dark">{t('settings.dark')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="settings-language">
                  <Form.Label className="d-inline-flex align-items-center gap-2">
                    <Globe2 size={16} />
                    {t('settings.language')}
                  </Form.Label>
                  <Form.Select
                    value={form.language}
                    onChange={(event) => updateField('language', event.target.value)}
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="settings-timezone">
                  <Form.Label className="d-inline-flex align-items-center gap-2">
                    <Clock size={16} />
                    {t('settings.timezone')}
                  </Form.Label>
                  <Form.Control
                    list="settings-timezone-options"
                    value={form.timezone}
                    onChange={(event) => updateField('timezone', event.target.value)}
                  />
                  <datalist id="settings-timezone-options">
                    {timezoneOptions.map((timezone) => (
                      <option key={timezone} value={timezone} />
                    ))}
                  </datalist>
                  <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                    <Form.Text>{t('settings.timezoneDetected', { timezone: detectedTimezone })}</Form.Text>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="p-0"
                      onClick={() => updateField('timezone', detectedTimezone)}
                    >
                      {t('settings.useDetectedTimezone')}
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <h2 className="h5 mb-3">{t('settings.notifications')}</h2>

            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="text-muted small">{t('settings.notificationPermission')}:</span>
              <Badge bg={permissionVariant}>
                {t(`settings.permission${notificationPermission[0].toUpperCase()}${notificationPermission.slice(1)}`)}
              </Badge>
            </div>
            {notificationPermission === 'denied' && (
              <div className="alert alert-warning mb-3">
                {t('settings.permissionDeniedHint')}
              </div>
            )}

            <div className="d-grid gap-3 mb-4">
              <Form.Check
                type="switch"
                id="settings-desktop-notifications"
                label={(
                  <span className="d-inline-flex align-items-center gap-2">
                    <Bell size={16} />
                    {t('settings.desktopNotifications')}
                  </span>
                )}
                checked={form.desktopNotifications}
                onChange={(event) => updateField('desktopNotifications', event.target.checked)}
                disabled={notificationPermission === 'denied' || notificationPermission === 'unsupported'}
              />
              <Form.Check
                type="switch"
                id="settings-email-notifications"
                label={(
                  <span className="d-inline-flex align-items-center gap-2">
                    <Envelope size={16} />
                    {t('settings.emailNotifications')}
                  </span>
                )}
                checked={form.emailNotifications}
                onChange={(event) => updateField('emailNotifications', event.target.checked)}
              />
              <Form.Check
                type="switch"
                id="settings-task-reminders"
                label={(
                  <span className="d-inline-flex align-items-center gap-2">
                    <Alarm size={16} />
                    {t('settings.taskReminders')}
                  </span>
                )}
                checked={form.taskReminders}
                onChange={(event) => updateField('taskReminders', event.target.checked)}
              />
            </div>

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="small text-muted">
                {!isDirty && t('settings.noChanges')}
              </div>
              <Button type="submit" variant="primary" disabled={isSaving || !isDirty}>
                <Save className="me-2" />
                {isSaving ? t('common.saving') : t('settings.saveSettings')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm border border-danger border-opacity-25">
        <Card.Body className="p-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h2 className="h5 mb-1 text-danger">{t('settings.deleteProfile')}</h2>
              <p className="text-muted mb-0">{t('settings.deleteProfileText')}</p>
            </div>
            <Button
              type="button"
              variant="outline-danger"
              onClick={onDeleteProfile}
              disabled={isDeletingProfile}
            >
              <Trash className="me-2" />
              {isDeletingProfile ? t('common.deleting') : t('settings.deleteProfileAction')}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SettingsForm;
