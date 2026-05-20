import { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { Envelope, Bell, Save, Trash } from 'react-bootstrap-icons';

const initialForm = {
  theme: 'light',
  desktopNotifications: false,
  emailNotifications: false,
};

const SettingsForm = ({
  settings,
  onSubmit,
  isSaving,
  onDeleteProfile,
  isDeletingProfile,
}) => {
  const [form, setForm] = useState(() => ({
    theme: settings?.theme || initialForm.theme,
    desktopNotifications: Boolean(settings?.desktopNotifications),
    emailNotifications: Boolean(settings?.emailNotifications),
  }));

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="d-grid gap-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4" controlId="settings-theme">
              <Form.Label>Тема</Form.Label>
              <Form.Select
                value={form.theme}
                onChange={(event) => updateField('theme', event.target.value)}
              >
                <option value="light">Светлая</option>
                <option value="dark">Тёмная</option>
              </Form.Select>
            </Form.Group>

            <div className="d-grid gap-3 mb-4">
              <Form.Check
                type="switch"
                id="settings-desktop-notifications"
                label={(
                  <span className="d-inline-flex align-items-center gap-2">
                    <Bell size={16} />
                    Desktop-уведомления
                  </span>
                )}
                checked={form.desktopNotifications}
                onChange={(event) => updateField('desktopNotifications', event.target.checked)}
              />
              <Form.Check
                type="switch"
                id="settings-email-notifications"
                label={(
                  <span className="d-inline-flex align-items-center gap-2">
                    <Envelope size={16} />
                    Email-уведомления
                  </span>
                )}
                checked={form.emailNotifications}
                onChange={(event) => updateField('emailNotifications', event.target.checked)}
              />
            </div>

            <div className="text-end">
              <Button type="submit" variant="primary" disabled={isSaving}>
                <Save className="me-2" />
                {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm border border-danger border-opacity-25">
        <Card.Body className="p-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h2 className="h5 mb-1 text-danger">Удаление профиля</h2>
              <p className="text-muted mb-0">Профильные данные будут удалены, после чего потребуется войти снова.</p>
            </div>
            <Button
              type="button"
              variant="outline-danger"
              onClick={onDeleteProfile}
              disabled={isDeletingProfile}
            >
              <Trash className="me-2" />
              {isDeletingProfile ? 'Удаление...' : 'Удалить профиль'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SettingsForm;
