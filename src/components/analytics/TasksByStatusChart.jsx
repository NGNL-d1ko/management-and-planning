import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import ChartCard from './ChartCard';

const statuses = [
  { key: 'backlog', label: 'Очередь', color: '#6c757d' },
  { key: 'todo', label: 'К выполнению', color: '#0d6efd' },
  { key: 'in_progress', label: 'В работе', color: '#f59f00' },
  { key: 'done', label: 'Готово', color: '#198754' },
];

const TasksByStatusChart = ({ data = {} }) => {
  const chartData = statuses.map((status) => ({
    name: status.label,
    value: data[status.key] || 0,
    color: status.color,
  }));
  const isEmpty = chartData.every((item) => item.value === 0);

  return (
    <ChartCard title="Задачи по статусу" isEmpty={isEmpty}>
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
