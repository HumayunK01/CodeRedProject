import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EnhancedForecastChartProps {
  data: { week: string; cases: number; actualCases?: number }[];
  showComparison?: boolean;
}

export const EnhancedForecastChart = ({ data, showComparison = false }: EnhancedForecastChartProps) => {
  const [viewMode, setViewMode] = useState<'area' | 'line'>('area');
  const [showActual, setShowActual] = useState(showComparison);

  // Calculate trend
  const getTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };
    
    const first = data[0].cases;
    const last = data[data.length - 1].cases;
    const change = ((last - first) / first) * 100;
    
    if (Math.abs(change) < 5) return { direction: 'stable', percentage: change };
    return { 
      direction: change > 0 ? 'up' : 'down', 
      percentage: Math.abs(change) 
    };
  };

  const trend = getTrend();
  
  const TrendIcon = trend.direction === 'up' ? TrendingUp : 
                   trend.direction === 'down' ? TrendingDown : Minus;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{`Week: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name === 'cases' ? 'Predicted' : entry.name}: {entry.value} cases
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant={trend.direction === 'up' ? 'destructive' : trend.direction === 'down' ? 'default' : 'secondary'}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {trend.percentage > 0 ? `${trend.percentage.toFixed(1)}%` : 'Stable'}
          </Badge>
          <span className="text-sm text-muted-foreground">trend over period</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {showComparison && (
            <Button
              variant={showActual ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowActual(!showActual)}
            >
              Show Actual
            </Button>
          )}
          
          <Button
            variant={viewMode === 'area' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('area')}
          >
            Area
          </Button>
          <Button
            variant={viewMode === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('line')}
          >
            Line
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="casesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
                {showActual && (
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="cases"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#casesGradient)"
                strokeWidth={2}
                name="Predicted Cases"
                isAnimationActive={true}
                animationDuration={1200}
              />
              
              {showActual && (
                <Area
                  type="monotone"
                  dataKey="actualCases"
                  stroke="hsl(var(--accent))"
                  fillOpacity={1}
                  fill="url(#actualGradient)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Actual Cases"
                  isAnimationActive={true}
                  animationDuration={1200}
                />
              )}
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Line
                type="monotone"
                dataKey="cases"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1200}
              />
              
              {showActual && (
                <Line
                  type="monotone"
                  dataKey="actualCases"
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  strokeDasharray="8 8"
                  dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={1200}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};