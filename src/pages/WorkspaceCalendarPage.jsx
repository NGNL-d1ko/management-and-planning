import WorkspaceCalendar from '../components/calendar/WorkspaceCalendar';

const WorkspaceCalendarPage = () => (
  <div>
    <div className="mb-4">
      <h1 className="h2 mb-1">Календарь</h1>
      <p className="text-muted mb-0">
        Планируйте задачи по срокам выполнения в вашем рабочем пространстве.
      </p>
    </div>

    <WorkspaceCalendar />
  </div>
);

export default WorkspaceCalendarPage;
