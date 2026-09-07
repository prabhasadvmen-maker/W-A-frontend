import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Loader } from '../../components/ui/Loader'
import { Users, Megaphone, MessageSquare, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DistributionBarChart } from '../../components/charts/DistributionBarChart'
import { DistributionLineChart } from '../../components/charts/DistributionLineChart'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, clientsRes] = await Promise.all([
          adminApi.stats(),
          adminApi.listClients(),
        ])
        if (statsRes.data.success) setStats(statsRes.data.data)
        if (clientsRes.data.success) setClients(clientsRes.data.data.clients || [])
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to load admin stats')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Loader label="Loading agency overview..." />

  const statCards = [
    {
      title: 'Client Accounts',
      value: (stats?.totalClients ?? 0).toLocaleString(),
      subtext: `max limit: ${stats?.limits?.maxClients ?? 20}`,
      icon: Users,
      iconBg: 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30',
    },
    {
      title: 'Client Campaigns',
      value: (stats?.totalCampaigns ?? 0).toLocaleString(),
      subtext: 'total campaigns executed',
      icon: Megaphone,
      iconBg: 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30',
    },
    {
      title: 'Total Messages Sent',
      value: (stats?.totalMessages ?? 0).toLocaleString(),
      subtext: `max limit: ${(stats?.limits?.maxMessages ?? 100000).toLocaleString()}`,
      icon: MessageSquare,
      iconBg: 'bg-sky-500/10 text-sky-400 border border-sky-500/30',
    },
  ]

  const planCounts = { Free: 0, Starter: 0, Pro: 0, Enterprise: 0 }
  const statusCounts = { Connected: 0, Pending: 0 }
  clients.forEach((c) => {
    const p = (c.plan || 'free').toLowerCase()
    if (p === 'starter') planCounts.Starter++
    else if (p === 'pro') planCounts.Pro++
    else if (p === 'enterprise') planCounts.Enterprise++
    else planCounts.Free++

    if (c.whatsappPhoneNumberId) statusCounts.Connected++
    else statusCounts.Pending++
  })

  const planChartData = [
    { name: 'Free', count: planCounts.Free },
    { name: 'Starter', count: planCounts.Starter },
    { name: 'Pro', count: planCounts.Pro },
    { name: 'Enterprise', count: planCounts.Enterprise },
  ]

  const statusChartData = [
    { name: 'API Connected', count: statusCounts.Connected },
    { name: 'Pending Setup', count: statusCounts.Pending },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Live Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Agency Overview</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">{currentDateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-extrabold shadow-sm shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]"></span>
            </span>
            <span>Agency Portal Active</span>
          </div>
          <Link
            to="/admin/clients"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] text-[#0F172A] text-xs font-extrabold hover:bg-[#20bd5a] transition-all shadow-md shrink-0"
          >
            <span>Manage Clients</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 3 Stat Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-3">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.title}
              className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155] shadow-lg transition-all hover:border-[#25D366]/40 hover:-translate-y-0.5"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.iconBg} mb-4 shadow-sm`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {s.value}
              </div>
              <div className="text-sm font-bold text-slate-200 mt-1.5">{s.title}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">{s.subtext}</div>
            </div>
          )
        })}
      </div>

      {/* 2 Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Client Plan Allocation"
          action={
            <span className="px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold">
              Monthly
            </span>
          }
          className="shadow-lg border-[#334155]"
        >
          <DistributionBarChart
            data={planChartData}
            dataKey="count"
            name="Client Accounts"
            color="#25D366"
            xKey="name"
            emptyMessage="No sub-clients registered yet"
          />
        </Card>
        <Card
          title="WhatsApp API Status"
          action={
            <span className="px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold">
              Live Status
            </span>
          }
          className="shadow-lg border-[#334155]"
        >
          <DistributionLineChart
            data={statusChartData}
            dataKey="count"
            name="Client Status"
            color="#25D366"
            xKey="name"
            emptyMessage="No sub-clients registered yet"
          />
        </Card>
      </div>
    </div>
  )
}
