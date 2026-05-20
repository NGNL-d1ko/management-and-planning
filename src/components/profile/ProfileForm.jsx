import { useRef, useState } from 'react';
import { Alert, Button, Card, Col, Form, Image, Row } from 'react-bootstrap';
import { Image as ImageIcon, Save, Trash } from 'react-bootstrap-icons';

const initialForm = {
  full_name: '',
  avatar_url: '',
};

const supportedAvatarExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const supportedAvatarTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const maxAvatarSizeBytes = 1024 * 1024;

const getAvatarUrl = (form) => (
  form.avatar_url ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(form.full_name || form.email || 'your MaP')}&background=0d6efd&color=fff&size=128`
);

const ProfileForm = ({ profile, onSubmit, isSaving }) => {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(() => ({
    full_name: profile?.full_name || initialForm.full_name,
    email: profile?.email || '',
    avatar_url: profile?.avatar_url || initialForm.avatar_url,
  }));
  const [avatarError, setAvatarError] = useState('');

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      full_name: form.full_name.trim() || null,
      avatar_url: form.avatar_url || null,
    });
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    setAvatarError('');

    if (!file) {
      return;
    }

    if (!supportedAvatarTypes.includes(file.type)) {
      setAvatarError(`Поддерживаются только: ${supportedAvatarExtensions.join(', ')}`);
      event.target.value = '';
      return;
    }

    if (file.size > maxAvatarSizeBytes) {
      setAvatarError('Размер изображения должен быть не больше 1 МБ.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField('avatar_url', reader.result || '');
    };
    reader.onerror = () => {
      setAvatarError('Не удалось прочитать изображение.');
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = () => {
    updateField('avatar_url', '');
    setAvatarError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Row className="g-4 align-items-start">
            <Col md="auto" className="text-center">
              <Image
                src={getAvatarUrl(form)}
                roundedCircle
                width={112}
                height={112}
                alt="Аватар профиля"
                className="border object-fit-cover"
              />
              <div className="d-grid gap-2 mt-3">
                <Form.Label className="btn btn-outline-secondary btn-sm mb-0">
                  <ImageIcon className="me-2" />
                  Изменить фото
                  <Form.Control
                    ref={fileInputRef}
                    type="file"
                    accept={supportedAvatarTypes.join(',')}
                    className="d-none"
                    onChange={handleAvatarChange}
                  />
                </Form.Label>
                {form.avatar_url && (
                  <Button type="button" variant="outline-danger" size="sm" onClick={handleResetAvatar}>
                    <Trash className="me-2" />
                    Убрать фото
                  </Button>
                )}
              </div>
              <div className="small text-muted mt-2">
                Поддерживаются: {supportedAvatarExtensions.join(', ')}
              </div>
            </Col>
            <Col>
              {avatarError && <Alert variant="danger">{avatarError}</Alert>}

              <Form.Group className="mb-3" controlId="profile-email">
                <Form.Label>Email</Form.Label>
                <Form.Control value={profile?.email || ''} readOnly disabled />
              </Form.Group>

              <Form.Group className="mb-3" controlId="profile-full-name">
                <Form.Label>Полное имя</Form.Label>
                <Form.Control
                  value={form.full_name}
                  onChange={(event) => updateField('full_name', event.target.value)}
                  placeholder="Ваше полное имя"
                />
              </Form.Group>

              <div className="text-end">
                <Button type="submit" variant="primary" disabled={isSaving}>
                  <Save className="me-2" />
                  {isSaving ? 'Сохранение...' : 'Сохранить профиль'}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ProfileForm;
