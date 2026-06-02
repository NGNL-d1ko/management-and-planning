import { Button, Dropdown } from 'react-bootstrap';
import { BoxArrowRight, List, PersonCircle } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelect from './LanguageSelect';

const getDisplayName = (user, fallback) => (
  user?.user_metadata?.full_name ||
  user?.user_metadata?.name ||
  user?.email ||
  fallback
);

const Topbar = ({
  title,
  onMenuClick,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const displayName = getDisplayName(user, t('common.user'));

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="ym-topbar d-flex align-items-center justify-content-between gap-3 border-bottom bg-body px-3 px-lg-4 py-3">
      <div className="d-flex align-items-center gap-3">
        <Button
          type="button"
          variant="outline-secondary"
          className="d-lg-none"
          onClick={onMenuClick}
          aria-label={t('layout.openNavigation')}
        >
          <List size={20} />
        </Button>
        <div>
          <h1 className="h5 mb-0">{title}</h1>
          <div className="small text-muted d-none d-sm-block">your MaP</div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        <LanguageSelect />

        <Dropdown align="end">
          <Dropdown.Toggle
            variant="outline-secondary"
            className="d-flex align-items-center gap-2"
          >
            <PersonCircle size={18} />
            <span className="d-none d-sm-inline">{displayName}</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>{displayName}</Dropdown.Header>
            <Dropdown.Divider />
          <Dropdown.Item onClick={handleLogout}>
            <BoxArrowRight className="me-2" />
            {t('layout.logout')}
          </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Topbar;
