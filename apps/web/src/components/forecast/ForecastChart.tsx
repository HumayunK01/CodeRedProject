import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ForecastChartProps {
  data: any[];
}

export const ForecastChart = ({ data }: ForecastChartProps) => {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          <Area
            type="monotone"
            dataKey="historicalCases"
            name="Historical Cases"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#historicalGradient)"
            strokeWidth={3}
            activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
          />
          <Area
            type="monotone"
            dataKey="predictedCases"
            name="Predicted Cases"
            stroke="hsl(var(--destructive))"
            fillOpacity={1}
            strokeDasharray="5 5"
            fill="url(#predictedGradient)"
            strokeWidth={3}
            activeDot={{ r: 6, fill: "hsl(var(--destructive))" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};