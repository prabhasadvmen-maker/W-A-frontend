import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export function DistributionLineChart({
  data,
  dataKey = 'count',
  name = 'Count',
  color = '#0B4F26',
  xKey = 'name',
  emptyMessage = 'No data available yet',
}) {
  const chartData = data || []

  if (!chartData.length) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 font-medium text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey={xKey} stroke="#CBD5E1" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} />
          <YAxis stroke="#CBD5E1" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)',
            }}
            labelStyle={{ color: '#0F172A', fontWeight: 'bold' }}
            itemStyle={{ color: color }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: color }}
            name={name}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
