import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  Filter,
  FileText,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  ShieldAlert,
  Calendar,
  Plus,
  ExternalLink,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { ContractVaultDocument } from '../../types';
import { Modal } from '../common/Modal';

export const ContractVaultView: React.FC = () => {
  const { vaultDocuments, contracts, addVaultDocument, addNotification } = useSalesOps();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(contracts[0]?.id || '');
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<ContractVaultDocument['docType']>('guarantee_letter');
  const [fileName, setFileName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  const docTypeLabels: Record<ContractVaultDocument['docType'], string> = {
    master_contract: 'Çerçeve Sözleşme',
    guarantee_letter: 'Banka Teminat Mektubu / DBS',
    delivery_protocol: 'Teslim-Tesellüm Tutanağı',
    signature_circular: 'İmza Sirküleri & Ticaret Sicil',
    addendum: 'Zeyilname & Ek Protokol',
    insurance_policy: 'Kasko / Sigorta Poliçesi'
  };

  const handleDownloadSimulated = (doc: ContractVaultDocument) => {
    addNotification(`"${doc.fileName}" dokümanı başarıyla indirildi.`, 'success');
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !selectedContractId) return;

    const contract = contracts.find(c => c.id === selectedContractId);
    const resolvedFileName = fileName.trim() || `${docType}_${selectedContractId.toLowerCase()}.pdf`;

    addVaultDocument({
      contractId: selectedContractId,
      customerRef: contract ? contract.customerRef : 'Bilinmeyen Müşteri',
      docType,
      title: docTitle.trim(),
      fileName: resolvedFileName,
      fileSize: '2.4 MB',
      status: expiryDate ? (new Date(expiryDate) < new Date() ? 'expired' : 'valid') : 'valid',
      expiryDate: expiryDate || undefined,
      signedDate: new Date().toISOString().split('T')[0],
      notes: notes.trim()
    });

    // Reset
    setDocTitle('');
    setFileName('');
    setExpiryDate('');
    setNotes('');
    setIsUploadModalOpen(false);
  };

  const filteredDocs = vaultDocuments.filter(doc => {
    if (selectedDocType !== 'all' && doc.docType !== selectedDocType) return false;
    if (selectedStatus !== 'all' && doc.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q) ||
        doc.contractId.toLowerCase().includes(q) ||
        doc.customerRef.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Metric counts
  const totalCount = vaultDocuments.length;
  const guaranteeCount = vaultDocuments.filter(d => d.docType === 'guarantee_letter').length;
  const expiringCount = vaultDocuments.filter(d => d.status === 'expiring_soon').length;
  const expiredCount = vaultDocuments.filter(d => d.status === 'expired').length;

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Toplam Arşiv</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-slate-900 font-mono">{totalCount}</span>
            <span className="text-xs text-slate-500">evrak kasada</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-blue-600 uppercase tracking-wider block font-semibold">Teminat Mektupları</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-blue-700 font-mono">{guaranteeCount}</span>
            <span className="text-xs text-blue-600">aktif teminat</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-amber-200 bg-amber-50/30 shadow-2xs">
          <span className="text-[10px] text-amber-700 uppercase tracking-wider block font-semibold">Vadesi Yaklaşanlar</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-amber-800 font-mono">{expiringCount}</span>
            <span className="text-xs text-amber-700 font-medium">T-30 gün içinde</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-rose-200 bg-rose-50/30 shadow-2xs">
          <span className="text-[10px] text-rose-700 uppercase tracking-wider block font-semibold">Süresi Dolmuş Evrak</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-rose-800 font-mono">{expiredCount}</span>
            <span className="text-xs text-rose-700 font-medium">yenileme şart</span>
          </div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Doküman adı, dosya adı, müşteri veya sözleşme no ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <select
            value={selectedDocType}
            onChange={e => setSelectedDocType(e.target.value)}
            className="p-1.5 border border-slate-200 rounded bg-white text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">Tüm Doküman Türleri</option>
            <option value="master_contract">Çerçeve Sözleşme</option>
            <option value="guarantee_letter">Banka Teminat Mektubu / DBS</option>
            <option value="delivery_protocol">Teslim Tutanağı</option>
            <option value="signature_circular">İmza Sirküleri</option>
            <option value="addendum">Zeyilname & Ek Protokol</option>
            <option value="insurance_policy">Kasko Poliçesi</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="p-1.5 border border-slate-200 rounded bg-white text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="valid">Geçerli / Yürürlükte</option>
            <option value="expiring_soon">Vade Yaklaşıyor</option>
            <option value="expired">Süresi Dolmuş</option>
          </select>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors shadow-2xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Yeni Evrak Yükle</span>
        </button>
      </div>

      {/* Document Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Evrak Başlığı / Dosya</th>
                <th className="py-2.5 px-3">İlişkili Sözleşme & Müşteri</th>
                <th className="py-2.5 px-3">Doküman Türü</th>
                <th className="py-2.5 px-3">Yüklenme / İmza</th>
                <th className="py-2.5 px-3">Geçerlilik Bitişi</th>
                <th className="py-2.5 px-3">Durum</th>
                <th className="py-2.5 px-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map(doc => {
                const statusBadge = {
                  valid: { label: 'Geçerli', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                  expiring_soon: { label: 'Vade Yaklaşıyor', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                  expired: { label: 'Süresi Dolmuş', bg: 'bg-rose-50 text-rose-800 border-rose-200' },
                  missing: { label: 'Eksik Evrak', bg: 'bg-slate-100 text-slate-700 border-slate-200' }
                }[doc.status];

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-900 block">{doc.title}</span>
                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                            {doc.fileName} • {doc.fileSize}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {doc.contractId}
                      </span>
                      <span className="text-slate-800 block text-[11px] font-medium mt-0.5 line-clamp-1">
                        {doc.customerRef}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                        {docTypeLabels[doc.docType]}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      <div>Yüklendi: {doc.uploadedAt}</div>
                      {doc.signedDate && (
                        <div className="text-[10px] text-slate-400">İmza: {doc.signedDate}</div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {doc.expiryDate ? (
                        <span className={doc.status === 'expired' ? 'text-rose-600 font-bold' : doc.status === 'expiring_soon' ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                          {doc.expiryDate}
                        </span>
                      ) : (
                        <span className="text-slate-400">Süresiz</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDownloadSimulated(doc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        title="Dokümanı İndir"
                      >
                        <Download className="w-3 h-3 text-slate-500" />
                        <span>İndir</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDocs.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            Kriterlere uygun arşivlenmiş doküman bulunamadı.
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Sözleşme Kasasına Yeni Evrak Arşivle"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">İlişkili Sözleşme & Müşteri</label>
              <select
                value={selectedContractId}
                onChange={e => setSelectedContractId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded bg-white text-xs focus:border-blue-500 focus:outline-hidden"
              >
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.customerRef} ({c.plate})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Doküman Türü</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-xs focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="guarantee_letter">Banka Teminat Mektubu / DBS</option>
                  <option value="master_contract">Ana Çerçeve Sözleşme</option>
                  <option value="delivery_protocol">Araç Teslim Tutanağı</option>
                  <option value="signature_circular">İmza Sirküleri</option>
                  <option value="addendum">Zeyilname & Ek Protokol</option>
                  <option value="insurance_policy">Kasko / Sigorta Poliçesi</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Geçerlilik Bitiş Tarihi (Opsiyonel)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Doküman Başlığı</label>
              <input
                type="text"
                required
                placeholder="Örn: Garanti BBVA Kesin Teminat Mektubu (₺1.200.000)"
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Dosya Adı (PDF)</label>
              <input
                type="text"
                placeholder="Örn: garanti_teminat_mektubu_2026.pdf"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Operasyonel Notlar</label>
              <textarea
                rows={2}
                placeholder="Banka şubesi, teminat tutarı veya özel şartlar..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                Dokümanı Kasaya Ekle
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
