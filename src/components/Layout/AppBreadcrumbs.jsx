import { Breadcrumb } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const routeLabels = {
  dashboard: 'Главная',
  tasks: 'Задачи',
  routines: 'Рутины',
  kanban: 'Kanban',
  calendar: 'Календарь',
  analytics: 'Аналитика',
  profile: 'Профиль',
  settings: 'Настройки',
};

const AppBreadcrumbs = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean).filter((part) => part !== 'app');

  const crumbs = [
    { label: 'Главная', to: '/app/dashboard' },
    ...pathParts
      .filter((part) => part !== 'dashboard')
      .map((part, index) => {
        const label = routeLabels[part] || part;
        const to = `/app/${pathParts.slice(0, index + 1).join('/')}`;

        return { label, to };
      }),
  ];

  return (
    <Breadcrumb className="mb-0 small">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <Breadcrumb.Item
            key={`${crumb.to}-${index}`}
            linkAs={isLast ? 'span' : Link}
            linkProps={isLast ? undefined : { to: crumb.to }}
            active={isLast}
          >
            {crumb.label}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default AppBreadcrumbs;
