import { useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as profileApi from '../api/profileApi';
import SettingsForm from '../components/settings/SettingsForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import useSettings from '../hooks/useSettings';

const NOTIFICATION_SETTINGS_KEY = 'map_notification_settings';
const getDetectedTimezone = () => (
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
);

const applyBodyTheme = (theme) => {
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(`theme-${theme || 'light'}`);
  document.documentElement.setAttribute('data-theme', theme || 'light');
  localStorage.setItem('theme', theme || 'light');
};

const getNotificationSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATION_SETTINGS_KEY) || 'null') || {
      desktopNotifications: false,
      emailNotifications: false,
    };
  } catch {
    return {
      desktopNotifications: false,
      emailNotifications: false,
    };
  }
};

const getNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.permission;
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { setLanguage, t } = useLanguage();
  const {
    settings,
    isLoading,
    error,
    updateSettings,
  } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission);
  const [detectedTimezone] = useState(getDetectedTimezone);
  const [legacyNotificationSettings] = useState(getNotificationSettings);

  useEffect(() => {
    if (settings?.theme) {
      applyBodyTheme(settings.theme);
    }
  }, [settings?.theme]);

  useEffect(() => {
    if (settings?.language) {
      setLanguage(settings.language);
    }
  }, [setLanguage, settings?.language]);

  const handleSubmit = async (data) => {
    setIsSaving(true);
    setMessage(null);

    try {
      let nextNotifications = data.notifications;

      if (nextNotifications.desktop && notificationPermission === 'default') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        nextNotifications = {
          ...nextNotifications,
          desktop: permission === 'granted',
        };
      } else if (nextNotifications.desktop && notificationPermission !== 'granted') {
        nextNotifications = {
          ...nextNotifications,
          desktop: false,
        };
      }

      const updatedSettings = await updateSettings({
        theme: data.theme,
        language: data.language,
        timezone: data.timezone || detectedTimezone,
        notifications: nextNotifications,
      });
      applyBodyTheme(updatedSettings.theme);
      setLanguage(updatedSettings.language || data.language);
      localStorage.removeItem(NOTIFICATION_SETTINGS_KEY);
      setMessage({
        variant: 'success',
        text: t('settings.saved'),
      });
    } catch (saveError) {
      setMessage({
        variant: 'danger',
        text: saveError.message || t('settings.saveError'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    setIsDeletingProfile(true);
    setMessage(null);

    try {
      await profileApi.deleteProfile();
      await logout();
      navigate('/login', { replace: true });
    } catch (deleteError) {
      setMessage({
        variant: 'danger',
        text: deleteError.message || t('settings.deleteError'),
      });
      setIsDeletingProfile(false);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">{t('settings.loading')}</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 mb-1">{t('settings.title')}</h1>
        <p className="text-muted mb-0">{t('settings.subtitle')}</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {message && (
        <Alert variant={message.variant} dismissible onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <SettingsForm
        key={`${settings?.updated_at || settings?.user_id}-${settings?.language || ''}-${settings?.timezone || ''}`}
        settings={{
          ...settings,
          notifications: settings?.notifications || {
            desktop: legacyNotificationSettings.desktopNotifications,
            email: legacyNotificationSettings.emailNotifications,
            taskReminders: true,
          },
        }}
        detectedTimezone={detectedTimezone}
        notificationPermission={notificationPermission}
        onSubmit={handleSubmit}
        onLanguagePreview={setLanguage}
        isSaving={isSaving}
        onDeleteProfile={() => setIsDeleteDialogOpen(true)}
        isDeletingProfile={isDeletingProfile}
      />

      <ConfirmDialog
        show={isDeleteDialogOpen}
        title={t('settings.deleteProfile')}
        message={t('settings.deleteConfirm')}
        confirmLabel={isDeletingProfile ? t('common.deleting') : t('settings.deleteProfileAction')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        confirmDisabled={isDeletingProfile}
        onConfirm={handleDeleteProfile}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
