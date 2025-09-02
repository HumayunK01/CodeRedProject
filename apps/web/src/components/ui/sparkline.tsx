import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface SparklineProps {
  data: { value: number }[];
  color?: string;
  className?: string;
}

export const Sparkline = ({ data, color = "hsl(var(--primary))", className = "" }: SparklineProps) => {
  return (
    <div className={`h-8 w-16 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};