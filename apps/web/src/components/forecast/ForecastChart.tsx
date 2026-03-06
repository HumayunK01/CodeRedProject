import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ChartDataPoint {
  week: string;
  historicalCases?: number;
  predictedCases?: number;
  p10?: number;
  p90?: number;
}

interface ForecastChartProps {
  data: ChartDataPoint[];
}

export const ForecastChart = ({ data }: ForecastChartProps) => {
  const hasUncertainty = data.some(d => d.p10 !== undefined && d.p90 !== undefined);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string; dataKey: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      const predicted = payload.find(e => e.dataKey === 'predictedCases');
      const low = payload.find(e => e.dataKey === 'p10');
      const high = payload.find(e => e.dataKey === 'p90');
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg min-w-[180px]">
          <p className="font-semibold text-foreground text-sm mb-1.5">{label}</p>
          {predicted && (
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-[3px] rounded-full bg-[hsl(var(--destructive))]" style={{ borderTop: '2px dashed hsl(var(--destructive))' }} />
              <span className="text-sm text-foreground/80">Expected: <span className="font-bold text-foreground">{Math.round(predicted.value)}</span></span>
            </div>
          )}
          {hasUncertainty && high && (
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-sm bg-[hsl(var(--destructive))] opacity-30" />
              <span className="text-sm text-foreground/80">Worst case: <span className="font-bold text-foreground">{Math.round(high.value)}</span></span>
            </div>
          )}
          {hasUncertainty && low && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[hsl(var(--destructive))] opacity-10" />
              <span className="text-sm text-foreground/80">Best case: <span className="font-bold text-foreground">{Math.round(low.value)}</span></span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-2">
      {/* Custom Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[10px] sm:text-xs text-foreground/70">
        <div className="flex items-center gap-1.5">
          <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="hsl(var(--destructive))" strokeWidth="2.5" strokeDasharray="4 3" /></svg>
          <span>Expected Cases</span>
        </div>
        {hasUncertainty && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: 'hsl(var(--destructive))', opacity: 0.15 }} />
              <span>Possible Range</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="20" height="12">
                <line x1="0" y1="3" x2="20" y2="3" stroke="hsl(var(--destructive))" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="2 2" />
              </svg>
              <span>Best / Worst Case</span>
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      <div className="h-56 sm:h-72 md:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={40}
              angle={-35}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            {hasUncertainty && (
              <>
                <Area
                  type="monotone"
                  dataKey="p90"
                  name="Worst Case"
                  stroke="hsl(var(--destructive))"
                  strokeOpacity={0.4}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  fillOpacity={0.12}
                  fill="hsl(var(--destructive))"
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="p10"
                  name="Best Case"
                  stroke="hsl(var(--destructive))"
                  strokeOpacity={0.4}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  fillOpacity={0}
                  fill="none"
                  legendType="none"
                />
              </>
            )}
            <Area
              type="monotone"
              dataKey="predictedCases"
              name="Expected Cases"
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
    </div>
  );
};