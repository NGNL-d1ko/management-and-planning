import WorkspaceCalendar from '../components/calendar/WorkspaceCalendar';
import { useLanguage } from '../context/LanguageContext';

const WorkspaceCalendarPage = () => {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 mb-1">{t('calendar.title')}</h1>
        <p className="text-muted mb-0">
          {t('calendar.subtitle')}
        </p>
      </div>

      <WorkspaceCalendar />
    </div>
  );
};

export default WorkspaceCalendarPage;
