import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { analyticsApi, campaignsApi } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Loader } from '../../components/ui/Loader'
import { CampaignChart } from '../../components/charts/CampaignChart'
import { MessageStatsChart } from '../../components/charts/MessageStatsChart'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Link } from 'react-router-dom'
import { FileText, CheckCheck, Eye, Activity, Plus } from 'lucide-react'

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [o, t, c] = await Promise.all([
          analyticsApi.overview(),
          analyticsApi.timeline(),
          campaignsApi.list(),
        ])
        if (cancelled) return
        if (o.data.success) setOverview(o.data.data)
        if (t.data.success) setTimeline(t.data.data.timeline || [])
        if (c.data.success) setCampaigns(c.data.data.campaigns || [])
      } catch (e) {
        if (!cancelled) toast.error(e.response?.data?.message || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return <Loader label="Loading overview..." />

  const stats = [
    {
      title: 'Total Messages',
      value: (overview?.totalMessages ?? 0).toLocaleString(),
      subtext: 'total messages sent',
      icon: FileText,
      iconBg: 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30',
    },
    {
      title: 'Delivered Rate',
      value: `${overview?.deliveredPercent ?? 0}%`,
      subtext: 'delivery percentage',
      icon: CheckCheck,
      iconBg: 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30',
    },
    {
      title: 'Read Rate',
      value: `${overview?.readPercent ?? 0}%`,
      subtext: 'read percentage',
      icon: Eye,
      iconBg: 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30',
    },
    {
      title: 'Failed Rate',
      value: `${overview?.failedPercent ?? 0}%`,
      subtext: 'failed messages',
      icon: Activity,
      iconBg: 'bg-sky-500/10 text-sky-400 border border-sky-500/30',
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Live Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Overview</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">{currentDateStr}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-extrabold shadow-sm shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]"></span>
          </span>
          <span>System Live and Synchronized</span>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
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
          title="Message Activity (30 Days)"
          action={
            <span className="px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold">
              Monthly
            </span>
          }
          className="shadow-lg border-[#334155]"
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            MESSAGE SENT TREND
          </div>
          <MessageStatsChart data={timeline} />
        </Card>

        <Card
          title="Campaign Performance"
          action={
            <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
              Live Trend
            </span>
          }
          className="shadow-lg border-[#334155]"
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            CAMPAIGN OUTCOME
          </div>
          <CampaignChart data={campaigns} />
        </Card>
      </div>

      {/* Recent Campaigns Table */}
      <Card
        title="Recent Campaigns"
        action={
          <Link
            to="/campaigns/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] text-[#0F172A] text-xs font-extrabold hover:bg-[#20bd5a] transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
        }
        className="shadow-lg border-[#334155]"
      >
        <Table>
          <THead>
            <TR className="bg-[#0F172A] text-slate-300">
              <TH>Campaign Name</TH>
              <TH>Status</TH>
              <TH>Messages Sent</TH>
              <TH>Failed</TH>
            </TR>
          </THead>
          <TBody>
            {campaigns.slice(0, 8).map((c) => (
              <TR key={c._id} className="hover:bg-slate-800/50 transition-colors">
                <TD className="font-bold text-slate-200">{c.name}</TD>
                <TD>
                  <Badge variant={c.status}>{c.status}</Badge>
                </TD>
                <TD className="font-medium text-slate-300">{c.sent}</TD>
                <TD className="font-medium text-slate-300">{c.failed}</TD>
              </TR>
            ))}
            {!campaigns.length && (
              <TR>
                <TD colSpan={4} className="text-center text-slate-400 py-8 font-medium">
                  No campaigns launched yet
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
