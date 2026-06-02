import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import ChartCard from './ChartCard';

const localeByLanguage = {
  ru: 'ru-RU',
  en: 'en-US',
  kk: 'kk-KZ',
};

const formatDay = (date, language) => new Date(`${date}T00:00:00`).toLocaleDateString(localeByLanguage[language] || 'ru-RU', {
  month: 'short',
  day: 'numeric',
});

const CompletedByDayChart = ({ data = [] }) => {
  const { language, t } = useLanguage();
  const chartData = data.map((item) => ({
    ...item,
    day: formatDay(item.date, language),
  }));
  const isEmpty = chartData.every((item) => item.count === 0);

  return (
    <ChartCard title={t('analytics.completedByDay')} isEmpty={isEmpty} highlight>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            name={t('analytics.completed')}
            stroke="#198754"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default CompletedByDayChart;
