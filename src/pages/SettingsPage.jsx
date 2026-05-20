import { useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as profileApi from '../api/profileApi';
import SettingsForm from '../components/settings/SettingsForm';
import { useAuth } from '../context/AuthContext';
import useSettings from '../hooks/useSettings';

const NOTIFICATION_SETTINGS_KEY = 'map_notification_settings';

const applyBodyTheme = (theme) => {
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(`theme-${theme || 'light'}`);
  document.documentElement.setAttribute('data-theme', theme || 'light');
  localStorage.setItem('theme', theme || 'light');
};

const getNotificationSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATION_SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
};

const saveNotificationSettings = (settings) => {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    settings,
    isLoading,
    error,
    updateSettings,
  } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  const [message, setMessage] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState(() => getNotificationSettings());

  useEffect(() => {
    if (settings?.theme) {
      applyBodyTheme(settings.theme);
    }
  }, [settings?.theme]);

  const handleSubmit = async (data) => {
    setIsSaving(true);
    setMessage(null);

    try {
      let desktopNotifications = data.desktopNotifications;

      if (data.desktopNotifications && 'Notification' in window && Notification.permission === 'default') {
        desktopNotifications = await Notification.requestPermission() === 'granted';
      } else if (data.desktopNotifications && 'Notification' in window) {
        desktopNotifications = Notification.permission === 'granted';
      }

      const updatedSettings = await updateSettings({ theme: data.theme });
      const updatedNotifications = {
        desktopNotifications,
        emailNotifications: data.emailNotifications,
      };
      saveNotificationSettings(updatedNotifications);
      setNotificationSettings(updatedNotifications);
      applyBodyTheme(updatedSettings.theme);
      setMessage({
        variant: 'success',
        text: 'Настройки сохранены.',
      });
    } catch (saveError) {
      setMessage({
        variant: 'danger',
        text: saveError.message || 'Не удалось сохранить настройки.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm('Удалить профиль? Это действие нельзя отменить.');

    if (!confirmed) {
      return;
    }

    setIsDeletingProfile(true);
    setMessage(null);

    try {
      await profileApi.deleteProfile();
      await logout();
      navigate('/login', { replace: true });
    } catch (deleteError) {
      setMessage({
        variant: 'danger',
        text: deleteError.message || 'Не удалось удалить профиль.',
      });
      setIsDeletingProfile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка настроек...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 mb-1">Настройки</h1>
        <p className="text-muted mb-0">Измените тему интерфейса, уведомления и профиль.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {message && (
        <Alert variant={message.variant} dismissible onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <SettingsForm
        key={`${settings?.updated_at || settings?.user_id}-${JSON.stringify(notificationSettings)}`}
        settings={{
          ...settings,
          ...notificationSettings,
        }}
        onSubmit={handleSubmit}
        isSaving={isSaving}
        onDeleteProfile={handleDeleteProfile}
        isDeletingProfile={isDeletingProfile}
      />
    </div>
  );
};

export default SettingsPage;
