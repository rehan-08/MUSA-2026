import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface TimestampHistogramChartProps {
  histogram: { date: string; count: number }[];
}

export function TimestampHistogramChart({ histogram }: TimestampHistogramChartProps) {
  if (histogram.length === 0) {
    return <p className="alert-status-note">No report history yet.</p>;
  }

  const data = histogram.map((h) => ({ ...h, label: h.date.slice(5) })); // "MM-DD"

  return (
    <ResponsiveContainer width="100%" height={110}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#7a6a6c' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#7a6a6c' }} width={24} axisLine={false} tickLine={false} />
        <Bar dataKey="count" fill="#2f3c7e" radius={[3, 3, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}
