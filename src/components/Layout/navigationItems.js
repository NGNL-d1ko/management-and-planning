import {
  ArrowRepeat,
  BarChart,
  Calendar3,
  Gear,
  House,
  Kanban,
  ListTask,
  PersonCircle,
} from 'react-bootstrap-icons';

export const navigationItems = [
  { to: '/app/dashboard', labelKey: 'nav.dashboard', label: 'Главная', icon: House },
  { to: '/app/tasks', labelKey: 'nav.tasks', label: 'Задачи', icon: ListTask },
  { to: '/app/routines', labelKey: 'nav.routines', label: 'Рутины', icon: ArrowRepeat },
  { to: '/app/kanban', labelKey: 'nav.kanban', label: 'Kanban', icon: Kanban },
  { to: '/app/calendar', labelKey: 'nav.calendar', label: 'Календарь', icon: Calendar3 },
  { to: '/app/analytics', labelKey: 'nav.analytics', label: 'Аналитика', icon: BarChart },
  { to: '/app/profile', labelKey: 'nav.profile', label: 'Профиль', icon: PersonCircle },
  { to: '/app/settings', labelKey: 'nav.settings', label: 'Настройки', icon: Gear },
];
