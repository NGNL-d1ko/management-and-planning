import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from './ChartCard';

const formatDay = (date) => new Date(`${date}T00:00:00`).toLocaleDateString('ru-RU', {
  month: 'short',
  day: 'numeric',
});

const CompletedByDayChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    ...item,
    day: formatDay(item.date),
  }));
  const isEmpty = chartData.every((item) => item.count === 0);

  return (
    <ChartCard title="Выполненные задачи по дням" isEmpty={isEmpty}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            name="Выполнено"
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
