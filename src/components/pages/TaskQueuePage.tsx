import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  ArrowUpDown,
  CheckSquare,
  FileText,
  RefreshCw,
  Send,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { Task, TaskPriority, TaskStatus, ProcessType } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

interface TaskQueuePageProps {
  onOpenCreateTaskModal: () => void;
}

export const TaskQueuePage: React.FC<TaskQueuePageProps> = ({
  onOpenCreateTaskModal
}) => {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    updateTaskStatus,
    reassignTask,
    addTaskNote,
    toggleChecklistItem,
    addChecklistItem,
    deleteTask,
    teamMembers,
    setActivePage
  } = useSalesOps();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [processTypeFilter, setProcessTypeFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);

  // Sorting state
  const [sortField, setSortField] = useState<'id' | 'createdAt' | 'dueDate' | 'priority' | 'waitingDays'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Note form state
  const [newNoteText, setNewNoteText] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            task.id.toLowerCase().includes(q) ||
            task.title.toLowerCase().includes(q) ||
            task.customerRef.toLowerCase().includes(q) ||
            task.customerCode.toLowerCase().includes(q) ||
            task.owner.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && task.status !== statusFilter) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
          return false;
        }

        // Process type filter
        if (processTypeFilter !== 'all' && task.processType !== processTypeFilter) {
          return false;
        }

        // Owner filter
        if (ownerFilter !== 'all' && task.owner !== ownerFilter) {
          return false;
        }

        // Overdue filter
        if (overdueOnly && !task.isOverdue && task.waitingDays < 4) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'priority') {
          const weight: Record<TaskPriority, number> = { Kritik: 4, Yüksek: 3, Orta: 2, Düşük: 1 };
          valA = weight[a.priority];
          valB = weight[b.priority];
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, processTypeFilter, ownerFilter, overdueOnly, sortField, sortDirection]);

  const selectedTask = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  const handleSort = (field: 'id' | 'createdAt' | 'dueDate' | 'priority' | 'waitingDays') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedTask) return;
    addTaskNote(selectedTask.id, newNoteText.trim(), 'Deniz Yılmaz');
    setNewNoteText('');
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !selectedTask) return;
    addChecklistItem(selectedTask.id, newChecklistText.trim());
    setNewChecklistText('');
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Görev ID, başlık, müşteri adı veya sorumlu ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setOverdueOnly(!overdueOnly)}
              className={`px-3 py-2 rounded text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                overdueOnly
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Sadece Gecikenler</span>
            </button>

            <button
              onClick={onOpenCreateTaskModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Görev</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
              Durum
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white"
            >
              <option value="all">Tüm Durumlar ({tasks.length})</option>
              <option value="Yeni">Yeni</option>
              <option value="İşlemde">İşlemde</option>
              <option value="Onay Bekliyor">Onay Bekliyor</option>
              <option value="Dış Yanıt Bekliyor">Dış Yanıt Bekliyor</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="İptal">İptal</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
              Öncelik
            </label>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="Kritik">Kritik</option>
              <option value="Yüksek">Yüksek</option>
              <option value="Orta">Orta</option>
              <option value="Düşük">Düşük</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
              Süreç Tipi
            </label>
            <select
              value={processTypeFilter}
              onChange={e => setProcessTypeFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white"
            >
              <option value="all">Tüm Süreçler</option>
              <option value="Teklif Hazırlama">Teklif Hazırlama</option>
              <option value="Sözleşme Yenileme">Sözleşme Yenileme</option>
              <option value="Erken İade">Erken İade</option>
              <option value="Aşırı KM">Aşırı KM</option>
              <option value="Evrak Takibi">Evrak Takibi</option>
              <option value="Fatura İtirazı">Fatura İtirazı</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
              Sorumlu Uzman
            </label>
            <select
              value={ownerFilter}
              onChange={e => setOwnerFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white"
            >
              <option value="all">Tüm Sorumlular</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[240px]">Görev Başlığı & Müşteri</th>
                <th className="py-3 px-3 whitespace-nowrap">Süreç Tipi</th>
                <th className="py-3 px-3 whitespace-nowrap">Kaynak</th>
                <th className="py-3 px-3 whitespace-nowrap">Sorumlu</th>
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Öncelik</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">Durum</th>
                <th
                  onClick={() => handleSort('dueDate')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Termin</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('waitingDays')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Bekleme</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[200px]">Sonraki Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                    Kriterlere uygun görev bulunamadı. Filtreleri temizleyin veya yeni görev oluşturun.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => {
                  const isSelected = selectedTaskId === task.id;
                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/70 border-l-2 border-l-blue-600' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {task.id}
                      </td>

                      {/* Title & Customer */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-slate-700">{task.customerRef}</span>
                          <span>·</span>
                          <span className="font-mono text-slate-400">{task.customerCode}</span>
                        </div>
                      </td>

                      {/* Process Type */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-slate-800 text-xs font-medium">
                          {task.processType}
                        </span>
                      </td>

                      {/* Source System */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            task.sourceSystem === 'Otomasyon Motoru'
                              ? 'bg-blue-100 text-blue-800 font-bold'
                              : task.sourceSystem === 'Miles'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {task.sourceSystem}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{task.owner}</span>
                      </td>

                      {/* Priority */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <PriorityBadge priority={task.priority} />
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge status={task.status} />
                      </td>

                      {/* Due Date */}
                      <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap">
                        <span
                          className={
                            task.isOverdue || task.waitingDays >= 4
                              ? 'text-rose-600 font-semibold'
                              : 'text-slate-600'
                          }
                        >
                          {task.dueDate}
                        </span>
                      </td>

                      {/* Waiting Duration */}
                      <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap">
                        <span
                          className={
                            task.waitingDays >= 4
                              ? 'text-rose-700 font-bold'
                              : task.waitingDays >= 2
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }
                        >
                          {task.waitingDuration}
                        </span>
                      </td>

                      {/* Next Action */}
                      <td className="py-2.5 px-3">
                        <div className="text-slate-600 truncate max-w-xs" title={task.nextAction}>
                          {task.nextAction}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info strip */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Toplam {filteredTasks.length} görev listeleniyor</span>
          <span className="text-[11px] text-slate-400">
            Detayları ve eylem planını görmek için satıra tıklayın
          </span>
        </div>
      </div>

      {/* Task Detail Modal / Inspector */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTaskId(null)}
          title={`Görev Detayı: ${selectedTask.id}`}
          subtitle={`${selectedTask.customerRef} · ${selectedTask.processType}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Six Golden Questions Panel */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>6 Temel Operasyonel Prensip</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">1. Ne Yapılması Gerekiyor?</span>
                  <p className="text-slate-800 font-medium mt-0.5">{selectedTask.whatNeedsToBeDone}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">2. Sürecin Sahibi Kim?</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-900 font-bold">{selectedTask.owner}</span>
                    <select
                      value={selectedTask.owner}
                      onChange={e => reassignTask(selectedTask.id, e.target.value)}
                      className="text-[11px] bg-white border border-slate-200 rounded px-1.5 py-0.5"
                    >
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.role.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">3. Süreci Ne Bloke Ediyor?</span>
                  <p className="text-rose-700 font-medium mt-0.5">{selectedTask.blocker}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">4. Termin Tarihi Ne Zaman?</span>
                  <span className="font-mono font-bold text-slate-800 mt-0.5 block">{selectedTask.dueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">5. Bir Sonraki Aksiyon Ne?</span>
                  <p className="text-blue-700 font-semibold mt-0.5">{selectedTask.nextAction}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">6. Ne Kadar Süredir Bekliyor?</span>
                  <span className="font-mono text-amber-700 font-bold mt-0.5 block">{selectedTask.waitingDuration}</span>
                </div>
              </div>
            </div>

            {/* Quick Status Bar & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Görev Durumu:</span>
                <select
                  value={selectedTask.status}
                  onChange={e => updateTaskStatus(selectedTask.id, e.target.value as TaskStatus)}
                  className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-semibold text-slate-800"
                >
                  <option value="Yeni">Yeni</option>
                  <option value="İşlemde">İşlemde</option>
                  <option value="Onay Bekliyor">Onay Bekliyor</option>
                  <option value="Dış Yanıt Bekliyor">Dış Yanıt Bekliyor</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                  <option value="İptal">İptal</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {selectedTask.status !== 'Tamamlandı' && (
                  <button
                    onClick={() => updateTaskStatus(selectedTask.id, 'Tamamlandı')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-xs flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Görevi Tamamla</span>
                  </button>
                )}

                <button
                  onClick={() => setConfirmDeleteId(selectedTask.id)}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium rounded text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sil</span>
                </button>
              </div>
            </div>

            {/* Related Entity Links */}
            {(selectedTask.relatedQuoteId || selectedTask.relatedContractId || selectedTask.relatedDisputeId) && (
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded flex items-center gap-3">
                <span className="font-semibold text-blue-900">İlişkili Kayıtlar:</span>
                {selectedTask.relatedQuoteId && (
                  <button
                    onClick={() => {
                      setSelectedTaskId(null);
                      setActivePage('quotations');
                    }}
                    className="text-blue-700 hover:underline font-mono flex items-center gap-1"
                  >
                    <span>{selectedTask.relatedQuoteId} (Teklif)</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
                {selectedTask.relatedContractId && (
                  <button
                    onClick={() => {
                      setSelectedTaskId(null);
                      setActivePage('contracts');
                    }}
                    className="text-blue-700 hover:underline font-mono flex items-center gap-1"
                  >
                    <span>{selectedTask.relatedContractId} (Sözleşme)</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
                {selectedTask.relatedDisputeId && (
                  <button
                    onClick={() => {
                      setSelectedTaskId(null);
                      setActivePage('disputes');
                    }}
                    className="text-blue-700 hover:underline font-mono flex items-center gap-1"
                  >
                    <span>{selectedTask.relatedDisputeId} (İtiraz)</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Required Information Checklist */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h5 className="font-bold text-slate-800 text-xs mb-2 flex items-center justify-between">
                <span>Zorunlu İşlem Kontrol Listesi</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {selectedTask.checklist.filter(c => c.completed).length} / {selectedTask.checklist.length} tamamlandı
                </span>
              </h5>
              <div className="space-y-1.5">
                {selectedTask.checklist.map(item => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(selectedTask.id, item.id)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span
                      className={`text-xs ${
                        item.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>

              {/* Add checklist item form */}
              <form onSubmit={handleAddChecklist} className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  placeholder="Yeni kontrol adımı ekle..."
                  value={newChecklistText}
                  onChange={e => setNewChecklistText(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 bg-slate-800 text-white rounded text-xs font-medium hover:bg-slate-900"
                >
                  Ekle
                </button>
              </form>
            </div>

            {/* Internal Notes & Communication Log */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h5 className="font-bold text-slate-800 text-xs mb-3">Dahili Notlar & Operasyonel Görüşmeler</h5>

              <form onSubmit={handleAddNote} className="mb-4 space-y-2">
                <textarea
                  rows={2}
                  placeholder="Görevin durumuna dair dahili not veya müşteri görüşme detayı girin..."
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded p-2 bg-slate-50 focus:bg-white"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Not Ekle</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {selectedTask.notes.map(note => (
                  <div key={note.id} className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800">{note.author}</span>
                      <span className="font-mono text-slate-400">{note.timestamp}</span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity History with Timestamps */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <h5 className="font-bold text-slate-800 text-xs mb-2">Süreç Tarihçesi & Denetim İzi (Audit Log)</h5>
              <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px]">
                {selectedTask.history.map(item => (
                  <div key={item.id} className="flex items-baseline gap-2 text-slate-600">
                    <span className="text-slate-400 shrink-0">{item.timestamp}</span>
                    <span className="text-slate-800 font-bold shrink-0">{item.user}:</span>
                    <span>{item.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog for Task Deletion */}
      {confirmDeleteId && (
        <Modal
          isOpen={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          title="Görevi Silmek İstediğinize Emin Misiniz?"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Bu işlem geri alınamaz. <strong>{confirmDeleteId}</strong> nolu görev kaydı sistemden kalıcı olarak kaldırılacaktır.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs hover:bg-slate-50 font-medium"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  deleteTask(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-3 py-1.5 bg-rose-600 text-white rounded text-xs hover:bg-rose-700 font-medium"
              >
                Görevi Sil
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
