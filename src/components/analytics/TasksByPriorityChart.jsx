import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import ChartCard from './ChartCard';

const priorities = [
  { key: 'low', color: '#6c757d' },
  { key: 'medium', color: '#0dcaf0' },
  { key: 'high', color: '#f59f00' },
  { key: 'urgent', color: '#dc3545' },
];

const TasksByPriorityChart = ({ data = {} }) => {
  const { t } = useLanguage();
  const chartData = priorities.map((priority) => ({
    name: t(`priority.${priority.key}`),
    value: data[priority.key] || 0,
    color: priority.color,
  }));
  const isEmpty = chartData.every((item) => item.value === 0);

  return (
    <ChartCard title={t('analytics.byPriority')} isEmpty={isEmpty}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" name={t('analytics.taskCount')} radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TasksByPriorityChart;
