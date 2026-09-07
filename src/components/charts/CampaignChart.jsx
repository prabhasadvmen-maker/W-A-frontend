import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export function CampaignChart({ data }) {
  const chartData = (data || []).map((c) => ({
    name: c.name?.slice(0, 12) || 'Campaign',
    sent: c.sent || 0,
    failed: c.failed || 0,
  }))

  if (!chartData.length) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 font-medium text-sm">
        No campaign data yet
      </div>
    )
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="name" stroke="#CBD5E1" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} />
          <YAxis stroke="#CBD5E1" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} />
          <Tooltip
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)',
            }}
            labelStyle={{ color: '#0F172A', fontWeight: 'bold' }}
          />
          <Bar dataKey="sent" fill="#0B4F26" name="Sent" radius={[6, 6, 0, 0]} />
          <Bar dataKey="failed" fill="#F43F5E" name="Failed" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
