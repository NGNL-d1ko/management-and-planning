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
  { to: '/app/dashboard', label: 'Главная', icon: House },
  { to: '/app/tasks', label: 'Задачи', icon: ListTask },
  { to: '/app/routines', label: 'Рутины', icon: ArrowRepeat },
  { to: '/app/kanban', label: 'Kanban', icon: Kanban },
  { to: '/app/calendar', label: 'Календарь', icon: Calendar3 },
  { to: '/app/analytics', label: 'Аналитика', icon: BarChart },
  { to: '/app/profile', label: 'Профиль', icon: PersonCircle },
  { to: '/app/settings', label: 'Настройки', icon: Gear },
];
