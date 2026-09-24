import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Send, Users, Hash, FileText, Zap, CheckCircle2,
  XCircle, Clock, ChevronRight, BarChart2, RefreshCw,
  MessageSquare, X
} from 'lucide-react'
import { bulkApi, contactsApi } from '../../services/api'
import { useSocket } from '../../hooks/useSocket'

const TAB_COMPOSE = 'compose'
const TAB_HISTORY = 'history'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-4 bg-[#0F172A] border border-slate-800 rounded-xl px-5 py-4">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-slate-100">{value}</p>
      </div>
    </div>
  )
}

export default function BulkMessage() {
  const [tab, setTab] = useState(TAB_COMPOSE)
  const [groups, setGroups] = useState([])
  const [form, setForm] = useState({ message: '', groupId: '', numbers: '' })
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const { socket } = useSocket()

  useEffect(() => {
    contactsApi.groups().then((r) => {
      if (r.data?.success) setGroups(r.data.data?.groups || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!socket) return
    const onProgress = (data) => {
      setProgress(data)
      if (data.done) {
        setSending(false)
        toast.success(`Done! Sent: ${data.sent} | Failed: ${data.failed}`)
        loadHistory()
      }
    }
    socket.on('bulk:progress', onProgress)
    return () => socket.off('bulk:progress', onProgress)
  }, [socket])

  useEffect(() => {
    if (tab === TAB_HISTORY) loadHistory()
  }, [tab])

  async function loadHistory() {
    setLoadingHistory(true)
    try {
      const r = await bulkApi.history()
      if (r.data?.success) setHistory(r.data.data?.history || [])
    } catch {}
    finally { setLoadingHistory(false) }
  }

  const fromNumbers = form.numbers
    ? form.numbers.split(/[\n,]+/).map((n) => n.trim().replace(/\D/g, '')).filter((n) => n.length >= 10).length
    : 0

  async function handleSend() {
    if (!form.message.trim()) { toast.error('Message is required'); return }
    if (!form.groupId && !form.numbers.trim()) { toast.error('Select a group or enter phone numbers'); return }
    setSending(true)
    setProgress({ processed: 0, total: 0, sent: 0, failed: 0, done: false })
    try {
      const r = await bulkApi.send({
        message: form.message.trim(),
        groupId: form.groupId || undefined,
        numbers: form.numbers || undefined,
      })
      if (r.data?.success) {
        toast.success(`Bulk send started for ${r.data.data?.total} contacts`)
        setProgress((p) => ({ ...p, total: r.data.data?.total || 0 }))
      } else {
        toast.error(r.data?.message || 'Failed')
        setSending(false)
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Send failed')
      setSending(false)
    }
  }

  function handleReset() {
    setForm({ message: '', groupId: '', numbers: '' })
    setProgress(null)
    setCharCount(0)
  }

  const progressPct = progress?.total ? Math.round((progress.processed / progress.total) * 100) : 0

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">Bulk Message</h1>
            <p className="text-sm text-slate-500">Send WhatsApp messages to thousands instantly</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          WhatsApp Cloud API Connected
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Groups" value={groups.length} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={Hash} label="Manual Numbers" value={fromNumbers} color="bg-purple-500/10 text-purple-400" />
        <StatCard icon={MessageSquare} label="Char Count" value={charCount} color="bg-amber-500/10 text-amber-400" />
        <StatCard icon={BarChart2} label="History" value={history.length} color="bg-emerald-500/10 text-emerald-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
        {[
          { id: TAB_COMPOSE, label: 'Compose & Send', icon: Send },
          { id: TAB_HISTORY, label: 'Send History', icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === id ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* COMPOSE TAB */}
      {tab === TAB_COMPOSE && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-5">

            {/* Message Box */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" /> Message Text
                </label>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                  charCount > 1000
                    ? 'text-red-400 border-red-500/30 bg-red-500/10'
                    : charCount > 500
                    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    : 'text-slate-500 border-slate-700 bg-slate-800'
                }`}>
                  {charCount} / 4096
                </span>
              </div>
              <textarea
                rows={6}
                placeholder={"Type your WhatsApp message here...\n\nExample:\nHello! This is a message from our team. 🎉"}
                value={form.message}
                onChange={(e) => {
                  setForm({ ...form, message: e.target.value })
                  setCharCount(e.target.value.length)
                }}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 resize-none transition"
              />
              <p className="text-xs text-slate-600">Supports emojis and line breaks. Keep under 1000 chars for best delivery.</p>
            </div>

            {/* Recipients */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" /> Recipients
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Group</label>
                <select
                  value={form.groupId}
                  onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition"
                >
                  <option value="">— Select a contact group (optional) —</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs text-slate-600 font-semibold">OR / AND</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Manual Phone Numbers</label>
                <textarea
                  rows={5}
                  placeholder={"Enter numbers separated by comma or new line:\n919876543210\n918765432109, 917654321098\n\nInclude country code (91 for India)"}
                  value={form.numbers}
                  onChange={(e) => setForm({ ...form, numbers: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 resize-none font-mono transition"
                />
                {fromNumbers > 0 && (
                  <p className="text-xs text-emerald-400 font-semibold">✓ {fromNumbers} valid numbers detected</p>
                )}
              </div>
            </div>

            {/* Send Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 text-sm"
              >
                {sending
                  ? <><RefreshCw className="h-4 w-4 animate-spin" /> Sending...</>
                  : <><Send className="h-4 w-4" /> Send Bulk Message</>
                }
              </button>
              {!sending && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-sm font-semibold transition"
                >
                  <X className="h-4 w-4" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Right: Preview + Progress + Tips */}
          <div className="space-y-5">

            {/* WhatsApp Preview */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-300">Live Preview</h3>
              <div className="bg-[#0B1F12] rounded-xl p-4 min-h-[120px]">
                <div className="bg-[#1A3A22] rounded-xl rounded-tl-none px-4 py-3 max-w-[85%] shadow">
                  <p className="text-sm text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
                    {form.message || <span className="text-slate-600 italic">Your message will appear here...</span>}
                  </p>
                  <p className="text-right text-[10px] text-slate-500 mt-1.5">12:00 PM ✓✓</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            {progress && (
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-300">Send Progress</h3>
                  {progress.done && (
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{progress.processed} / {progress.total}</span>
                    <span className="font-bold text-emerald-400">{progressPct}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xl font-black text-emerald-400">{progress.sent}</p>
                    <p className="text-xs text-slate-500">Sent</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                    <XCircle className="h-5 w-5 text-red-400 mx-auto mb-1" />
                    <p className="text-xl font-black text-red-400">{progress.failed}</p>
                    <p className="text-xs text-slate-500">Failed</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pro Tips</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                  Always include country code (91 for India)
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                  Keep messages under 1000 characters
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                  Avoid spammy words for better delivery
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                  Sends at 200ms interval to avoid rate limits
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === TAB_HISTORY && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-300">Recent Bulk Sends</h3>
            <button
              onClick={loadHistory}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600">
              <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No bulk messages sent yet</p>
              <p className="text-xs mt-1">Your send history will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {history.map((h, i) => (
                <div key={i} className="px-5 py-4 hover:bg-slate-800/30 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">{h.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(h.sentAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> {h.sent}
                      </span>
                      {h.failed > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                          <XCircle className="h-3 w-3" /> {h.failed}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {h.numbers.slice(0, 5).map((n, j) => (
                      <span key={j} className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        +{n}
                      </span>
                    ))}
                    {h.numbers.length > 5 && (
                      <span className="text-[10px] text-slate-600 bg-slate-800 px-2 py-0.5 rounded">
                        +{h.numbers.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
