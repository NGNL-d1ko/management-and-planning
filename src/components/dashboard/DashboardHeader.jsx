import { useLanguage } from '../../context/LanguageContext';

const DashboardHeader = () => {
  const { t } = useLanguage();

  return (
    <div className="mb-4">
      <h1 className="h2 fw-bold mb-1">{t('dashboard.title')}</h1>
      <p className="text-muted mb-0">
        {t('dashboard.subtitle')}
      </p>
    </div>
  );
};

export default DashboardHeader;
