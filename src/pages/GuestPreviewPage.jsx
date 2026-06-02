import { Button, Container } from 'react-bootstrap';
import {
  ArrowRepeat,
  BarChart,
  BoxArrowInRight,
  Calendar3,
  CheckCircle,
  Kanban,
  ListTask,
  PersonCircle,
  PersonPlus,
} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import LanguageSelect from '../components/Layout/LanguageSelect';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './GuestPreviewPage.css';

const copy = {
  ru: {
    navFeatures: 'Возможности',
    navWorkflow: 'Рабочий процесс',
    navAnalytics: 'Аналитика',
    login: 'Войти',
    openApp: 'Открыть приложение',
    createAccount: 'Создать аккаунт',
    eyebrow: 'your MaP для планирования',
    title: 'Собирайте, организуйте и доводите задачи до результата из одного места.',
    subtitle: 'Посмотрите, как личные задачи, рутины, доска Kanban, календарь и аналитика помогают держать день под контролем.',
    primaryCta: 'Начать работу',
    secondaryCta: 'Войти',
    previewTitle: 'Сегодня',
    previewSubtitle: 'Фокус на ближайших делах',
    taskOne: 'Подготовить план проекта',
    taskTwo: 'Проверить дедлайны',
    taskThree: 'Обновить доску Kanban',
    statDone: '72%',
    statDoneLabel: 'выполнено',
    statTasks: '18',
    statTasksLabel: 'активных задач',
    featureHeading: 'Предпросмотр возможностей',
    featureText: 'Гостевая страница показывает, что уже есть в рабочем пространстве после входа.',
    boardHeading: 'От идеи до результата',
    boardText: 'Создавайте задачи, двигайте их по статусам, планируйте день в календаре и смотрите динамику выполнения.',
    columns: ['План', 'В работе', 'Готово'],
    cards: ['Собрать требования', 'Спринт задач', 'Отчёт недели'],
    features: [
      ['Задачи', 'Списки, приоритеты, статусы и сроки в одном рабочем потоке.'],
      ['Рутины', 'Повторяющиеся действия для стабильного ритма недели.'],
      ['Kanban', 'Визуальная доска для быстрых решений и понятного прогресса.'],
      ['Календарь', 'Задачи на датах, ближайшие дедлайны и обзор недели.'],
      ['Аналитика', 'Графики выполнения, продуктивность и распределение задач.'],
    ],
  },
  en: {
    navFeatures: 'Features',
    navWorkflow: 'Workflow',
    navAnalytics: 'Analytics',
    login: 'Log in',
    openApp: 'Open app',
    createAccount: 'Create account',
    eyebrow: 'your MaP planning workspace',
    title: 'Capture, organize, and finish your work from one focused place.',
    subtitle: 'Preview how tasks, routines, Kanban, calendar, and analytics help keep the day under control.',
    primaryCta: 'Get started',
    secondaryCta: 'Log in',
    previewTitle: 'Today',
    previewSubtitle: 'Focus on what is next',
    taskOne: 'Prepare project plan',
    taskTwo: 'Review deadlines',
    taskThree: 'Update Kanban board',
    statDone: '72%',
    statDoneLabel: 'completed',
    statTasks: '18',
    statTasksLabel: 'active tasks',
    featureHeading: 'Feature preview',
    featureText: 'This guest page shows what is already available inside the signed-in workspace.',
    boardHeading: 'From idea to done',
    boardText: 'Create tasks, move them through statuses, plan your day in the calendar, and track progress over time.',
    columns: ['Plan', 'In progress', 'Done'],
    cards: ['Collect requirements', 'Task sprint', 'Weekly report'],
    features: [
      ['Tasks', 'Lists, priorities, statuses, and due dates in one workflow.'],
      ['Routines', 'Repeating actions for a steady weekly rhythm.'],
      ['Kanban', 'A visual board for quick decisions and clear progress.'],
      ['Calendar', 'Dated tasks, upcoming deadlines, and a week overview.'],
      ['Analytics', 'Completion charts, productivity, and task distribution.'],
    ],
  },
  kk: {
    navFeatures: 'Мүмкіндіктер',
    navWorkflow: 'Жұмыс барысы',
    navAnalytics: 'Аналитика',
    login: 'Кіру',
    openApp: 'Қолданбаны ашу',
    createAccount: 'Аккаунт құру',
    eyebrow: 'your MaP жоспарлау кеңістігі',
    title: 'Тапсырмаларды бір жерден жинап, реттеп, нәтижеге жеткізіңіз.',
    subtitle: 'Тапсырмалар, рутиналар, Kanban, күнтізбе және аналитика күнді бақылауда ұстауға қалай көмектесетінін көріңіз.',
    primaryCta: 'Бастау',
    secondaryCta: 'Кіру',
    previewTitle: 'Бүгін',
    previewSubtitle: 'Келесі маңызды істер',
    taskOne: 'Жоба жоспарын дайындау',
    taskTwo: 'Мерзімдерді тексеру',
    taskThree: 'Kanban тақтасын жаңарту',
    statDone: '72%',
    statDoneLabel: 'орындалды',
    statTasks: '18',
    statTasksLabel: 'белсенді тапсырма',
    featureHeading: 'Мүмкіндіктер көрінісі',
    featureText: 'Қонақ беті жүйеге кіргеннен кейін қолжетімді жұмыс кеңістігін көрсетеді.',
    boardHeading: 'Идеядан нәтижеге дейін',
    boardText: 'Тапсырма құрып, статус бойынша жылжытып, күнді күнтізбеде жоспарлап, орындалу динамикасын бақылаңыз.',
    columns: ['Жоспар', 'Орындалуда', 'Орындалды'],
    cards: ['Талаптарды жинау', 'Тапсырма спринті', 'Апта есебі'],
    features: [
      ['Тапсырмалар', 'Тізімдер, басымдықтар, статустар және мерзімдер бір ағында.'],
      ['Рутиналар', 'Апталық тұрақты ырғаққа арналған қайталанатын әрекеттер.'],
      ['Kanban', 'Жылдам шешім мен анық прогреске арналған визуалды тақта.'],
      ['Күнтізбе', 'Күндерге қойылған тапсырмалар, жақын мерзімдер және апталық шолу.'],
      ['Аналитика', 'Орындалу графиктері, өнімділік және тапсырма үлестірімі.'],
    ],
  },
};

const featureIcons = [ListTask, ArrowRepeat, Kanban, Calendar3, BarChart];

const GuestPreviewPage = () => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = copy[language] || copy.ru;

  return (
    <div className="ym-guest-page">
      <header className="ym-guest-header">
        <Container fluid="xl" className="ym-guest-header-inner">
          <Link to="/" className="ym-guest-brand" aria-label="your MaP">
            <span className="ym-guest-brand-mark">M</span>
            <span>your MaP</span>
          </Link>

          <nav className="ym-guest-nav" aria-label="Guest navigation">
            <a href="#features">{t.navFeatures}</a>
            <a href="#workflow">{t.navWorkflow}</a>
            <a href="#analytics">{t.navAnalytics}</a>
          </nav>

          <div className="ym-guest-actions">
            <LanguageSelect />
            {isAuthenticated ? (
              <Button as={Link} to="/app/dashboard" variant="primary" className="ym-guest-login">
                <PersonCircle className="me-2" />
                {t.openApp}
              </Button>
            ) : (
              <>
                <Button as={Link} to="/login" variant="link" className="ym-guest-login">
                  <BoxArrowInRight className="me-2" />
                  {t.login}
                </Button>
                <Button as={Link} to="/register" variant="primary" className="d-none d-sm-inline-flex align-items-center">
                  <PersonPlus className="me-2" />
                  {t.createAccount}
                </Button>
              </>
            )}
          </div>
        </Container>
      </header>

      <main>
        <section className="ym-guest-hero">
          <Container fluid="xl">
            <div className="ym-guest-hero-grid">
              <div className="ym-guest-hero-copy">
                <p className="ym-guest-eyebrow">{t.eyebrow}</p>
                <h1>{t.title}</h1>
                <p className="ym-guest-subtitle">{t.subtitle}</p>
                <div className="ym-guest-cta-row">
                  <Button as={Link} to={isAuthenticated ? '/app/dashboard' : '/register'} variant="primary" size="lg">
                    {t.primaryCta}
                  </Button>
                  {!isAuthenticated && (
                    <Button as={Link} to="/login" variant="outline-secondary" size="lg">
                      {t.secondaryCta}
                    </Button>
                  )}
                </div>
              </div>

              <div className="ym-guest-visual" aria-label="Product preview">
                <div className="ym-guest-shape ym-guest-shape-orange" />
                <div className="ym-guest-shape ym-guest-shape-green" />
                <div className="ym-guest-device">
                  <div className="ym-guest-device-top">
                    <span>9:41</span>
                    <span className="ym-guest-camera" />
                  </div>
                  <div className="ym-guest-device-screen">
                    <div className="d-flex align-items-start justify-content-between gap-3">
                      <div>
                        <div className="ym-guest-screen-title">{t.previewTitle}</div>
                        <div className="ym-guest-screen-subtitle">{t.previewSubtitle}</div>
                      </div>
                      <CheckCircle className="ym-guest-screen-check" size={24} />
                    </div>
                    <div className="ym-guest-task-list">
                      {[t.taskOne, t.taskTwo, t.taskThree].map((task, index) => (
                        <div className="ym-guest-task-row" key={task}>
                          <span className={`ym-guest-task-dot ym-guest-task-dot-${index + 1}`} />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                    <div className="ym-guest-stat-grid">
                      <div>
                        <strong>{t.statDone}</strong>
                        <span>{t.statDoneLabel}</span>
                      </div>
                      <div>
                        <strong>{t.statTasks}</strong>
                        <span>{t.statTasksLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ym-guest-floating ym-guest-floating-kanban">
                  <Kanban size={22} />
                </div>
                <div className="ym-guest-floating ym-guest-floating-calendar">
                  <Calendar3 size={22} />
                </div>
                <div className="ym-guest-floating ym-guest-floating-chart">
                  <BarChart size={22} />
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="ym-guest-section" id="features">
          <Container fluid="xl">
            <div className="ym-guest-section-heading">
              <h2>{t.featureHeading}</h2>
              <p>{t.featureText}</p>
            </div>
            <div className="ym-guest-feature-grid">
              {t.features.map(([title, description], index) => {
                const Icon = featureIcons[index];

                return (
                  <article className="ym-guest-feature-card" key={title}>
                    <div className="ym-guest-feature-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="ym-guest-workflow" id="workflow">
          <Container fluid="xl">
            <div className="ym-guest-workflow-grid">
              <div>
                <h2>{t.boardHeading}</h2>
                <p>{t.boardText}</p>
              </div>
              <div className="ym-guest-board-preview">
                {t.columns.map((column, index) => (
                  <div className="ym-guest-board-column" key={column}>
                    <div className="ym-guest-board-title">{column}</div>
                    <div className="ym-guest-board-card">{t.cards[index]}</div>
                    <div className="ym-guest-board-line" />
                    <div className="ym-guest-board-line is-short" />
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
};

export default GuestPreviewPage;
