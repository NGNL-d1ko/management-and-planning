import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import ChartCard from './ChartCard';

const statuses = [
  { key: 'backlog', color: '#6c757d' },
  { key: 'todo', color: '#0d6efd' },
  { key: 'in_progress', color: '#f59f00' },
  { key: 'done', color: '#198754' },
];

const TasksByStatusChart = ({ data = {} }) => {
  const { t } = useLanguage();
  const chartData = statuses.map((status) => ({
    name: t(`status.${status.key}`),
    value: data[status.key] || 0,
    color: status.color,
  }));
  const isEmpty = chartData.every((item) => item.value === 0);

  return (
    <ChartCard title={t('analytics.byStatus')} isEmpty={isEmpty}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={95}
            label
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TasksByStatusChart;
