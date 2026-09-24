import { Bar, BarChart, Cell, ReferenceLine, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { Cluster } from '../types';

interface ScoreBarChartProps {
  cluster: Pick<Cluster, 'diversity_score' | 'spread_score' | 'confidence_score'>;
}

const BAR_COLOR = '#2f3c7e';

/**
 * Diversity / spread / confidence as horizontal bars, with the two gate
 * thresholds (0.4 "rising", 0.7 "escalate") marked as reference lines, so
 * it's visually obvious why a cluster did or didn't escalate.
 */
export function ScoreBarChart({ cluster }: ScoreBarChartProps) {
  const data = [
    { label: 'Diversity', value: cluster.diversity_score },
    { label: 'Spread', value: cluster.spread_score },
    { label: 'Confidence', value: cluster.confidence_score },
  ];

  return (
    <ResponsiveContainer width="100%" height={130}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11, fill: '#7a6a6c' }} tickCount={6} />
        <YAxis type="category" dataKey="label" width={78} tick={{ fontSize: 12, fill: '#241214' }} axisLine={false} tickLine={false} />
        <ReferenceLine x={0.4} stroke="#aa1b2b" strokeDasharray="4 4" strokeWidth={1}>
        </ReferenceLine>
        <ReferenceLine x={0.7} stroke="#990011" strokeDasharray="4 4" strokeWidth={1.5}>
        </ReferenceLine>
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((entry) => (
            <Cell key={entry.label} fill={BAR_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
