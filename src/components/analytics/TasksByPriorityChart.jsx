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
import ChartCard from './ChartCard';

const priorities = [
  { key: 'low', label: 'Низкий', color: '#6c757d' },
  { key: 'medium', label: 'Средний', color: '#0dcaf0' },
  { key: 'high', label: 'Высокий', color: '#f59f00' },
  { key: 'urgent', label: 'Срочный', color: '#dc3545' },
];

const TasksByPriorityChart = ({ data = {} }) => {
  const chartData = priorities.map((priority) => ({
    name: priority.label,
    value: data[priority.key] || 0,
    color: priority.color,
  }));
  const isEmpty = chartData.every((item) => item.value === 0);

  return (
    <ChartCard title="Задачи по приоритету" isEmpty={isEmpty}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" name="Задачи" radius={[6, 6, 0, 0]}>
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
