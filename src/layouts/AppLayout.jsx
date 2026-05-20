import { useMemo, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { Outlet, useLocation } from 'react-router-dom';
import AppBreadcrumbs from '../components/Layout/AppBreadcrumbs';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import { navigationItems } from '../components/Layout/navigationItems';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import useAppDataPreload from '../hooks/useAppDataPreload';
import useRoutineGeneration from '../hooks/useRoutineGeneration';

const getPageTitle = (pathname) => {
  const activeItem = navigationItems
    .slice()
    .sort((first, second) => second.to.length - first.to.length)
    .find((item) => pathname.startsWith(item.to));

  return activeItem?.label || 'Dashboard';
};

const AppLayout = () => {
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const title = useMemo(() => getPageTitle(location.pathname), [location.pathname]);
  useAppDataPreload();
  useRoutineGeneration();

  return (
    <div className="min-vh-100 d-flex bg-body ym-app-shell">
      <aside className={`ym-sidebar-shell d-none d-lg-block flex-shrink-0 ${isSidebarMinimized ? 'is-minimized' : ''}`}>
        <Sidebar
          isMinimized={isSidebarMinimized}
          onMinimizeToggle={() => setIsSidebarMinimized((current) => !current)}
        />
      </aside>

      <Offcanvas
        show={isMobileSidebarOpen}
        onHide={() => setIsMobileSidebarOpen(false)}
        responsive="lg"
        className="d-lg-none"
      >
        <Offcanvas.Body className="p-0">
          <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
        </Offcanvas.Body>
      </Offcanvas>

      <div className="flex-grow-1 d-flex flex-column min-vh-100">
        <Topbar
          title={title}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        <main className="ym-main-content flex-grow-1 px-3 px-lg-4 py-4">
          <div className="mb-4">
            <AppBreadcrumbs />
          </div>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
