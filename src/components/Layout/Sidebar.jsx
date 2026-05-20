import { Button, Nav } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';
import { navigationItems } from './navigationItems';

const Sidebar = ({
  onNavigate,
  isMinimized = false,
  onMinimizeToggle,
}) => (
  <div className={`ym-sidebar d-flex flex-column bg-body-tertiary border-end ${isMinimized ? 'is-minimized' : ''}`}>
    <div className="ym-sidebar-brand d-flex align-items-center justify-content-between gap-2 px-3 py-4 border-bottom">
      <div className="ym-brand-name h4 fw-bold mb-0 text-nowrap">
        {!isMinimized && 'your MaP'}
      </div>
      {onMinimizeToggle && (
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          className="ym-sidebar-minimize d-none d-lg-inline-flex align-items-center justify-content-center"
          onClick={onMinimizeToggle}
          aria-label={isMinimized ? 'Развернуть боковую панель' : 'Свернуть боковую панель'}
          title={isMinimized ? 'Развернуть' : 'Свернуть'}
        >
          {isMinimized ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      )}
    </div>

    <Nav className="ym-sidebar-nav flex-column gap-1 p-3">
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <Nav.Link
            key={item.to}
            as={NavLink}
            to={item.to}
            onClick={onNavigate}
            title={isMinimized ? item.label : undefined}
            className={({ isActive }) => (
              `ym-sidebar-link d-flex align-items-center gap-3 rounded px-3 py-2 ${
                isActive ? 'bg-primary text-white' : 'text-body'
              }`
            )}
          >
            <Icon size={18} />
            <span className="ym-sidebar-label">{item.label}</span>
          </Nav.Link>
        );
      })}
    </Nav>
  </div>
);

export default Sidebar;
