import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { photoshareApi } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { Loader } from '../../components/ui/Loader'
import { useSocket } from '../../hooks/useSocket'
import {
  FolderPlus, Play, Pause, Trash2, Copy, ExternalLink,
  Eye, Clock, UserCheck, Sparkles, Edit2, ImageIcon,
  CheckCircle2, XCircle, ChevronDown, ChevronRight,
} from 'lucide-react'

export default function Photoshare() {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [botPhone, setBotPhone] = useState(() => localStorage.getItem('whatsai_bot_phone_number') || '')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingFolderId, setEditingFolderId] = useState(null)
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [folderPhotos, setFolderPhotos] = useState([])
  const [expandedSender, setExpandedSender] = useState(null)
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  const [form, setForm] = useState({ name: '', startTime: '', endTime: '', isActive: true })
  const [saving, setSaving] = useState(false)
  const { socket } = useSocket()

  async function loadFolders() {
    try {
      const res = await photoshareApi.listFolders()
      if (res.data?.success) setFolders(res.data.data?.folders || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load folders')
    } finally {
      setLoading(false)
    }
  }

  async function loadFolderDetails(id) {
    setLoadingPhotos(true)
    try {
      const [detailsRes, photosRes] = await Promise.all([
        photoshareApi.getFolderDetails(id),
        photoshareApi.getFolderPhotos(id),
      ])
      if (detailsRes.data?.success) {
        setSelectedFolder(detailsRes.data.data?.folder)
        setAnalytics(detailsRes.data.data?.analytics)
      }
      if (photosRes.data?.success) setFolderPhotos(photosRes.data.data?.photos || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load photos')
    } finally {
      setLoadingPhotos(false)
    }
  }

  useEffect(() => { loadFolders() }, [])

  useEffect(() => {
    if (!socket) return
    const onNewPhoto = (data) => {
      if (selectedFolderId && String(data.folderId) === String(selectedFolderId)) {
        setFolderPhotos((prev) => [data.photo, ...prev])
        photoshareApi.getFolderDetails(selectedFolderId).then((res) => {
          if (res.data?.success) setAnalytics(res.data.data?.analytics)
        }).catch(() => {})
      }
      loadFolders()
    }
    socket.on('photoshare:newPhoto', onNewPhoto)
    return () => socket.off('photoshare:newPhoto', onNewPhoto)
  }, [socket, selectedFolderId])

  useEffect(() => {
    if (!selectedFolderId) return
    loadFolderDetails(selectedFolderId)
  }, [selectedFolderId])

  function handleSaveBotPhone(val) {
    const cleaned = val.replace(/\D/g, '')
    setBotPhone(cleaned)
    localStorage.setItem('whatsai_bot_phone_number', cleaned)
  }

  function formatDateTimeLocal(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  function handleOpenEditModal(folder) {
    setEditingFolderId(folder._id)
    setForm({
      name: folder.name,
      startTime: formatDateTimeLocal(folder.startTime),
      endTime: formatDateTimeLocal(folder.endTime),
      isActive: folder.isActive,
    })
    setCreateModalOpen(true)
  }

  function handleOpenCreateModal() {
    setEditingFolderId(null)
    setForm({ name: '', startTime: '', endTime: '', isActive: true })
    setCreateModalOpen(true)
  }

  async function handleSaveFolder(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Folder name is required'); return }
    setSaving(true)
    try {
      const payload = { name: form.name.trim(), startTime: form.startTime || null, endTime: form.endTime || null, isActive: form.isActive }
      const res = editingFolderId
        ? await photoshareApi.updateFolder(editingFolderId, payload)
        : await photoshareApi.createFolder(payload)
      if (res.data?.success) {
        toast.success(res.data?.message || 'Saved!')
        setCreateModalOpen(false)
        setEditingFolderId(null)
        loadFolders()
        if (editingFolderId === selectedFolderId) {
          const dr = await photoshareApi.getFolderDetails(selectedFolderId)
          if (dr.data?.success) setSelectedFolder(dr.data.data.folder)
        }
      } else toast.error(res.data?.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(folder) {
    try {
      const res = await photoshareApi.updateFolder(folder._id, { isActive: !folder.isActive })
      if (res.data?.success) {
        toast.success(`Folder ${!folder.isActive ? 'activated' : 'deactivated'}`)
        loadFolders()
        if (selectedFolderId === folder._id) setSelectedFolder((p) => ({ ...p, isActive: !folder.isActive }))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  async function handleDeleteFolder(id) {
    if (!window.confirm('Delete this folder and all its photo records?')) return
    try {
      const res = await photoshareApi.deleteFolder(id)
      if (res.data?.success) {
        toast.success('Folder deleted')
        loadFolders()
        if (selectedFolderId === id) { setSelectedFolderId(null); setSelectedFolder(null); setFolderPhotos([]); setAnalytics(null) }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  function copy(text, msg = 'Copied!') {
    navigator.clipboard.writeText(text)
    toast.success(msg)
  }

  function handleSelectFolder(id) {
    setSelectedFolderId(id)
    setExpandedSender(null)
    loadFolderDetails(id)
  }

  const groupedPhotos = folderPhotos.reduce((acc, photo) => {
    const key = photo.senderPhone || 'Anonymous'
    if (!acc[key]) acc[key] = { senderName: photo.senderName || 'Anonymous', senderPhone: photo.senderPhone, photos: [] }
    acc[key].photos.push(photo)
    return acc
  }, {})

  const waLink = (f) => `https://wa.me/${botPhone}?text=Upload_${f.linkCode}`
  const galleryLink = (f) => `${window.location.origin}/gallery/${f.linkCode}`

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#25D366]" /> Photoshare
          </h1>
          <p className="text-sm text-slate-400">Collect event photos via WhatsApp, moderate with AI, share public galleries.</p>
        </div>
        <Button onClick={handleOpenCreateModal} className="bg-[#25D366] text-[#0F172A] hover:bg-[#20ba59] font-bold flex items-center gap-2">
          <FolderPlus className="h-4 w-4" /> New Folder
        </Button>
      </div>

      {/* BOT PHONE — compact inline */}
      <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3">
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">WhatsApp Bot Number:</span>
        <input
          value={botPhone}
          onChange={(e) => handleSaveBotPhone(e.target.value)}
          placeholder="e.g. 919876543210"
          className="flex-1 bg-transparent text-sm text-slate-200 font-mono placeholder-slate-600 outline-none border-b border-slate-700 focus:border-[#25D366] transition-colors pb-0.5"
        />
        <span className="text-[10px] text-slate-600">Used in upload links</span>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid gap-5 lg:grid-cols-5">

        {/* LEFT: FOLDER LIST */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="flex justify-center p-8"><Loader /></div>
          ) : folders.length === 0 ? (
            <Card className="p-10 text-center text-slate-500 text-sm border border-slate-800">
              No folders yet. Click "New Folder" to get started.
            </Card>
          ) : (
            <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
              {folders.map((f) => {
                const isSelected = selectedFolderId === f._id
                return (
                  <div
                    key={f._id}
                    onClick={() => handleSelectFolder(f._id)}
                    className={`rounded-xl border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#25D366] bg-[#25D366]/5 shadow-[0_0_12px_rgba(37,211,102,0.1)]'
                        : 'border-slate-800 bg-slate-900/30 hover:border-slate-600 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-200 text-sm truncate">{f.name}</p>
                        <p className="text-[11px] font-mono text-[#25D366] mt-0.5">{f.linkCode}</p>
                      </div>
                      <Badge variant={f.isActive ? 'success' : 'neutral'} className="shrink-0 text-[10px]">
                        {f.isActive ? 'Active' : 'Off'}
                      </Badge>
                    </div>

                    {(f.startTime || f.endTime) && (
                      <div className="mt-2 space-y-0.5 text-[11px] text-slate-500">
                        {f.startTime && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(f.startTime).toLocaleString()}</div>}
                        {f.endTime && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> Ends: {new Date(f.endTime).toLocaleString()}</div>}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleToggleActive(f)} title={f.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${f.isActive ? 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10' : 'border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/10'}`}>
                        {f.isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => copy(waLink(f), 'WhatsApp link copied!')} title="Copy WhatsApp Upload Link"
                        className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => copy(galleryLink(f), 'Gallery link copied!')} title="Copy Gallery Link"
                        className="p-1.5 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleOpenEditModal(f)} title="Edit"
                        className="p-1.5 rounded-lg border border-slate-700 text-sky-400 hover:bg-slate-800 transition-colors">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeleteFolder(f._id)} title="Delete"
                        className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors ml-auto">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT: REVIEW PANEL */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedFolderId ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed border-slate-800 text-slate-600 gap-3">
              <Eye className="h-10 w-10" />
              <p className="text-sm">Select a folder to review photos</p>
            </div>
          ) : (
            <div className="space-y-4">

              {/* STATS */}
              {analytics && (
                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-3 border border-slate-800 bg-slate-900/40 text-center">
                    <p className="text-xs text-slate-500 mb-1">Total</p>
                    <p className="text-2xl font-bold text-slate-200">{analytics.totalCount}</p>
                  </Card>
                  <Card className="p-3 border border-emerald-500/20 bg-emerald-500/5 text-center">
                    <p className="text-xs text-emerald-400 mb-1 flex items-center justify-center gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</p>
                    <p className="text-2xl font-bold text-emerald-400">{analytics.approvedCount}</p>
                  </Card>
                  <Card className="p-3 border border-red-500/20 bg-red-500/5 text-center">
                    <p className="text-xs text-red-400 mb-1 flex items-center justify-center gap-1"><XCircle className="h-3 w-3" /> Blocked</p>
                    <p className="text-2xl font-bold text-red-400">{analytics.flaggedCount}</p>
                  </Card>
                </div>
              )}

              {/* LINKS */}
              {selectedFolder && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* WhatsApp Upload Link */}
                  <Card className="p-3 border border-slate-800 bg-slate-900/40 space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WhatsApp Upload</p>
                    <div className="flex gap-2 items-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(waLink(selectedFolder))}`}
                        alt="QR" className="h-16 w-16 rounded bg-white p-0.5 shrink-0"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="text-[10px] font-mono text-[#25D366] bg-slate-800 px-2 py-1 rounded break-all">{waLink(selectedFolder)}</p>
                        <button onClick={() => copy(waLink(selectedFolder), 'WhatsApp link copied!')}
                          className="text-[11px] px-3 py-1 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-lg hover:bg-[#25D366]/20 transition-colors font-semibold flex items-center gap-1">
                          <Copy className="h-3 w-3" /> Copy Link
                        </button>
                      </div>
                    </div>
                  </Card>

                  {/* Gallery Link */}
                  <Card className="p-3 border border-slate-800 bg-slate-900/40 space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Public Gallery</p>
                    <div className="flex gap-2 items-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(galleryLink(selectedFolder))}`}
                        alt="QR" className="h-16 w-16 rounded bg-white p-0.5 shrink-0"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="text-[10px] font-mono text-purple-400 bg-slate-800 px-2 py-1 rounded break-all">{galleryLink(selectedFolder)}</p>
                        <div className="flex gap-1.5">
                          <button onClick={() => copy(galleryLink(selectedFolder), 'Gallery link copied!')}
                            className="text-[11px] px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1">
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                          <a href={`/gallery/${selectedFolder.linkCode}`} target="_blank" rel="noreferrer"
                            className="text-[11px] px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors flex items-center gap-1 font-semibold">
                            <ExternalLink className="h-3 w-3" /> Open
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* PHOTOS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-slate-500" />
                    Photos — {folderPhotos.length} from {Object.keys(groupedPhotos).length} guests
                  </h3>
                  {loadingPhotos && <span className="text-xs text-slate-500 animate-pulse">Loading...</span>}
                </div>

                {loadingPhotos && folderPhotos.length === 0 ? (
                  <div className="flex justify-center p-10"><Loader /></div>
                ) : folderPhotos.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-slate-600 text-sm">
                    No photos uploaded yet. Share the WhatsApp link with guests.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {Object.values(groupedPhotos).map((group) => {
                      const isExpanded = expandedSender === group.senderPhone
                      return (
                        <div key={group.senderPhone} className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
                          <button
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors"
                            onClick={() => setExpandedSender(isExpanded ? null : group.senderPhone)}
                          >
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-[#25D366]" />
                              <span className="font-medium text-slate-200 text-sm">{group.senderName}</span>
                              <span className="text-xs text-slate-500 font-mono">{group.senderPhone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="info" className="text-[10px]">{group.photos.length}</Badge>
                              {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3 border-t border-slate-800">
                              {group.photos.map((photo) => (
                                <div key={photo._id} className={`relative aspect-square rounded-lg overflow-hidden border ${photo.isValid ? 'border-slate-700' : 'border-red-500/40'}`}>
                                  {photo.isValid ? (
                                    <img src={photo.photoUrl} alt="" className="h-full w-full object-cover"
                                      onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=Error' }} />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-red-950/30 text-red-400 text-[10px] font-semibold flex-col gap-1">
                                      <XCircle className="h-4 w-4" /> Blocked
                                    </div>
                                  )}
                                  <div className="absolute top-1 right-1">
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${photo.isValid ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                                      {photo.isValid ? '✓' : '✗'}
                                    </span>
                                  </div>
                                  {photo.caption && (
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-1 text-[9px] text-slate-200 truncate italic">
                                      {photo.caption}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title={editingFolderId ? 'Edit Folder' : 'New Event Folder'}>
        <form onSubmit={handleSaveFolder} className="space-y-4 pt-2">
          <Input
            label="Event Name"
            placeholder="e.g. Wedding-Rahul-Priya"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input type="datetime-local" label="Start Time (Optional)" value={form.startTime}
              onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
            <Input type="datetime-local" label="End Time (Optional)" value={form.endTime}
              onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-[#25D366] focus:ring-[#25D366]" />
            <span className="text-sm text-slate-300">Active immediately</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#25D366] text-[#0F172A] hover:bg-[#20ba59] font-bold" disabled={saving}>
              {saving ? 'Saving...' : editingFolderId ? 'Save Changes' : 'Create Folder'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
