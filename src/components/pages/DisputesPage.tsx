import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Receipt,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Calendar,
  DollarSign,
  Send,
  ExternalLink
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { InvoiceDispute, DisputeCategory, DisputeStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const DisputesPage: React.FC = () => {
  const {
    disputes,
    createDispute,
    updateDispute,
    addDisputeNote,
    createDisputeFollowUpTask,
    teamMembers,
    setActivePage,
    setSelectedTaskId
  } = useSalesOps();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  // New dispute modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCustomerRef, setNewCustomerRef] = useState('');
  const [newInvoiceRef, setNewInvoiceRef] = useState('FAT-2026-');
  const [newCategory, setNewCategory] = useState<DisputeCategory>('Hatalı Tutar');
  const [newAmount, setNewAmount] = useState<number>(5000);
  const [newOwner, setNewOwner] = useState('Can Demir');
  const [newNextAction, setNewNextAction] = useState('');

  // Note form inside modal
  const [noteText, setNoteText] = useState('');
  const [resolutionDetailsText, setResolutionDetailsText] = useState('');

  const filteredDisputes = disputes.filter(d => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        d.id.toLowerCase().includes(q) ||
        d.customerRef.toLowerCase().includes(q) ||
        d.invoiceRef.toLowerCase().includes(q) ||
        d.assignedTeamOrOwner.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;

    return true;
  });

  const selectedDispute = disputes.find(d => d.id === selectedDisputeId);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerRef.trim() || !newInvoiceRef.trim()) return;

    createDispute({
      customerRef: newCustomerRef.trim(),
      customerCode: 'CUST-INV',
      invoiceRef: newInvoiceRef.trim(),
      category: newCategory,
      amountUnderReview: newAmount,
      assignedTeamOrOwner: newOwner,
      nextAction: newNextAction.trim() || 'Fatura ve ekstre incelemesi başlatılacak'
    });

    setIsCreateModalOpen(false);
    setNewCustomerRef('');
    setNewNextAction('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedDispute) return;
    addDisputeNote(selectedDispute.id, noteText.trim());
    setNoteText('');
  };

  const handleSaveResolution = () => {
    if (!selectedDispute) return;
    updateDispute(selectedDispute.id, {
      resolutionDetails: resolutionDetailsText.trim(),
      status: 'Çözümlendi (İptal/Düzeltme)'
    });
  };

  const handleCreateFollowUpTask = (disputeId: string) => {
    const newTask = createDisputeFollowUpTask(disputeId);
    setSelectedDisputeId(null);
    setSelectedTaskId(newTask.id);
    setActivePage('tasks');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Fatura İtirazları & Mutabakat Yönetimi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mükerrer fatura, HGS/ikame araç uyuşmazlığı ve müşteri cari hesap mutabakat takibi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded font-mono">
            * Finansal rakamlar demo amaçlıdır
          </span>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İtiraz Kaydı</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="İtiraz no, fatura no veya müşteri ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
          >
            <option value="all">Tüm Durumlar ({disputes.length})</option>
            <option value="İncelemede">İncelemede</option>
            <option value="Müşteri Görüşmesi">Müşteri Görüşmesi</option>
            <option value="Onay Bekliyor">Onay Bekliyor</option>
            <option value="Çözümlendi (İptal/Düzeltme)">Çözümlendi</option>
            <option value="Reddedildi (Geçerli Fatura)">Reddedildi</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
          >
            <option value="all">Tüm İtiraz Kategorileri</option>
            <option value="Hatalı Tutar">Hatalı Tutar</option>
            <option value="Çift Fatura">Çift Fatura</option>
            <option value="Sözleşme Uyuşmazlığı">Sözleşme Uyuşmazlığı</option>
            <option value="Eksik Destekleyici Belge">Eksik Destekleyici Belge</option>
            <option value="Hizmet İtirazı">Hizmet İtirazı</option>
          </select>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 whitespace-nowrap">İtiraz ID</th>
                <th className="py-3 px-3 min-w-[200px]">Müşteri</th>
                <th className="py-3 px-3 whitespace-nowrap">Fatura No</th>
                <th className="py-3 px-3 whitespace-nowrap">İtiraz Kategorisi</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">İtiraz Tutarı</th>
                <th className="py-3 px-3 whitespace-nowrap">Açılış Tarihi</th>
                <th className="py-3 px-3 whitespace-nowrap">Sorumlu</th>
                <th className="py-3 px-3 whitespace-nowrap">Durum</th>
                <th className="py-3 px-3 min-w-[200px]">Sonraki Aksiyon</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredDisputes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                    Kriterlere uygun itiraz kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredDisputes.map(dispute => (
                  <tr
                    key={dispute.id}
                    onClick={() => {
                      setSelectedDisputeId(dispute.id);
                      setResolutionDetailsText(dispute.resolutionDetails || '');
                    }}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {dispute.id}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{dispute.customerRef}</div>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {dispute.invoiceRef}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-slate-800">{dispute.category}</span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono tabular-nums font-bold text-slate-900">
                      {dispute.amountUnderReview.toLocaleString('tr-TR')} TL
                    </td>

                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {dispute.dateOpened}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-slate-800">{dispute.assignedTeamOrOwner}</span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge status={dispute.status} />
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-slate-600 truncate max-w-xs text-[11px]" title={dispute.nextAction}>
                        {dispute.nextAction}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="text-xs text-blue-600 font-semibold hover:underline">
                        Yönet →
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispute Detail Modal */}
      {selectedDispute && (
        <Modal
          isOpen={!!selectedDispute}
          onClose={() => setSelectedDisputeId(null)}
          title={`İtiraz İnceleme: ${selectedDispute.id}`}
          subtitle={`${selectedDispute.customerRef} · ${selectedDispute.invoiceRef}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Summary strip */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">İncelenen Tutar</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {selectedDispute.amountUnderReview.toLocaleString('tr-TR')} TL
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Kategori</span>
                <span className="font-semibold text-slate-800">{selectedDispute.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Durum</span>
                <StatusBadge status={selectedDispute.status} />
              </div>
            </div>

            {/* Change Status & Follow up */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white border border-slate-200 rounded">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Durum Güncelle:</span>
                <select
                  value={selectedDispute.status}
                  onChange={e => updateDispute(selectedDispute.id, { status: e.target.value as DisputeStatus })}
                  className="bg-slate-50 border border-slate-300 rounded p-1 text-xs font-semibold"
                >
                  <option value="İncelemede">İncelemede</option>
                  <option value="Müşteri Görüşmesi">Müşteri Görüşmesi</option>
                  <option value="Onay Bekliyor">Onay Bekliyor</option>
                  <option value="Çözümlendi (İptal/Düzeltme)">Çözümlendi (İptal/Düzeltme)</option>
                  <option value="Reddedildi (Geçerli Fatura)">Reddedildi (Geçerli Fatura)</option>
                </select>
              </div>

              {!selectedDispute.relatedTaskId && (
                <button
                  onClick={() => handleCreateFollowUpTask(selectedDispute.id)}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Takip Görevi Aç</span>
                </button>
              )}
            </div>

            {/* Resolution Details */}
            <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
              <span className="font-bold text-slate-800 block mb-1">Nihai Mutabakat & Çözüm Özeti:</span>
              <textarea
                rows={2}
                value={resolutionDetailsText}
                onChange={e => setResolutionDetailsText(e.target.value)}
                placeholder="Örn: 14.250 TL iade faturası kesilerek cari hesaptan mahsup edildi..."
                className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSaveResolution}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                >
                  Çözümü Kaydet & Kapat
                </button>
              </div>
            </div>

            {/* Notes Log */}
            <div className="border border-slate-200 rounded p-3">
              <span className="font-bold text-slate-800 block mb-2">İtiraz Notları:</span>
              <form onSubmit={handleAddNote} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="İtiraza ilişkin inceleme notu ekleyin..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded p-1.5"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                >
                  Ekle
                </button>
              </form>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedDispute.notes.map(n => (
                  <div key={n.id} className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span className="font-bold text-slate-700">{n.author}</span>
                      <span className="font-mono">{n.date}</span>
                    </div>
                    <p className="text-slate-700">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* New Dispute Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Yeni Fatura İtirazı Kaydı"
          subtitle="Müşteri tarafından iletilen fatura uyuşmazlığını incelemeye alın"
          maxWidth="md"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Müşteri Ünvanı *</label>
              <input
                type="text"
                required
                placeholder="Örn: Şişecam Cam Pazarlama A.Ş."
                value={newCustomerRef}
                onChange={e => setNewCustomerRef(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Fatura Numarası *</label>
                <input
                  type="text"
                  required
                  placeholder="FAT-2026-9900"
                  value={newInvoiceRef}
                  onChange={e => setNewInvoiceRef(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">İtiraz Tutarı (TL) *</label>
                <input
                  type="number"
                  required
                  value={newAmount}
                  onChange={e => setNewAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs border border-slate-300 rounded p-2 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">İtiraz Kategorisi</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as DisputeCategory)}
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
                >
                  <option value="Hatalı Tutar">Hatalı Tutar</option>
                  <option value="Çift Fatura">Çift Fatura</option>
                  <option value="Sözleşme Uyuşmazlığı">Sözleşme Uyuşmazlığı</option>
                  <option value="Eksik Destekleyici Belge">Eksik Destekleyici Belge</option>
                  <option value="Hizmet İtirazı">Hizmet İtirazı</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Atanan Sorumlu</label>
                <select
                  value={newOwner}
                  onChange={e => setNewOwner(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
                >
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">İlk Aksiyon Planı</label>
              <input
                type="text"
                placeholder="Örn: İlgili ayın ikame araç teslim formları servis portalından çekilecek"
                value={newNextAction}
                onChange={e => setNewNextAction(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded p-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 text-xs hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
              >
                İtirazı Kaydet
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
