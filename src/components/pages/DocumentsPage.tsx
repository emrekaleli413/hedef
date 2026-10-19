import React, { useState } from 'react';
import {
  FolderCheck,
  Search,
  Filter,
  FileCheck,
  AlertTriangle,
  Upload,
  Send,
  Plus,
  ShieldAlert,
  Clock,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { DocumentItem, DocumentStatus, DocumentCategory } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const DocumentsPage: React.FC = () => {
  const {
    documents,
    updateDocumentStatus,
    uploadDocumentPlaceholder,
    createMissingDocFollowUpTask,
    missingDocRiskScore,
    setActivePage,
    setSelectedTaskId
  } = useSalesOps();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Upload modal state
  const [uploadDocId, setUploadDocId] = useState<string | null>(null);
  const [fakeFileName, setFakeFileName] = useState('');

  // Chaser email preview modal state
  const [chaserPreviewDoc, setChaserPreviewDoc] = useState<DocumentItem | null>(null);

  const filteredDocs = documents.filter(d => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        d.id.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.customerRef.toLowerCase().includes(q) ||
        d.relatedEntityId.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;

    return true;
  });

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocId || !fakeFileName.trim()) return;
    uploadDocumentPlaceholder(uploadDocId, fakeFileName.trim());
    setUploadDocId(null);
    setFakeFileName('');
  };

  const handleCreateTaskForDoc = (docId: string) => {
    const newTask = createMissingDocFollowUpTask(docId);
    setSelectedTaskId(newTask.id);
    setActivePage('tasks');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Missing Document Risk Score */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Evrak Kontrolü & Kurumsal Uyumluluk Matrisi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sözleşme ve teslimat öncesi zorunlu mali belgeler, imza sirküleri, ekspertiz tutanakları ve yükleme takibi
          </p>
        </div>

        {/* Risk Score Widget */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Eksik Evrak Riski Skoru
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`text-xl font-bold font-mono ${
                  missingDocRiskScore > 40
                    ? 'text-rose-600'
                    : missingDocRiskScore > 20
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {missingDocRiskScore} / 100
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {missingDocRiskScore > 40 ? 'Yüksek Risk' : missingDocRiskScore > 20 ? 'Orta Risk' : 'Düşük'}
              </span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-[11px] text-slate-500 max-w-[160px] leading-tight">
            Eksik zorunlu belgeler araç teslimat blokajına yol açar.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Belge adı, müşteri adı veya sözleşme no ara..."
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
            <option value="all">Tüm Durumlar ({documents.length})</option>
            <option value="Gerekli">Gerekli</option>
            <option value="Bekleniyor">Bekleniyor</option>
            <option value="Alındı">Alındı</option>
            <option value="Kontrol Ediliyor">Kontrol Ediliyor</option>
            <option value="Eksik">Eksik</option>
            <option value="Onaylandı">Onaylandı</option>
            <option value="Reddedildi">Reddedildi</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="Teklif">Teklif</option>
            <option value="Sözleşme">Sözleşme</option>
            <option value="Zeyilname">Zeyilname</option>
            <option value="Erken İade">Erken İade</option>
            <option value="Fatura İtirazı">Fatura İtirazı</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 whitespace-nowrap">Belge ID</th>
                <th className="py-3 px-3 min-w-[200px]">Belge Adı & Zorunluluk</th>
                <th className="py-3 px-3 whitespace-nowrap">Kategori</th>
                <th className="py-3 px-3 min-w-[180px]">Müşteri</th>
                <th className="py-3 px-3 whitespace-nowrap">İlişkili Kayıt</th>
                <th className="py-3 px-3 whitespace-nowrap">Son Tarih</th>
                <th className="py-3 px-3 whitespace-nowrap">Durum</th>
                <th className="py-3 px-3 whitespace-nowrap">Yüklenen Dosya</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">İşlem & Takip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    Kriterlere uygun evrak kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-blue-50/40 transition-colors">
                    {/* ID */}
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {doc.id}
                    </td>

                    {/* Title */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{doc.title}</span>
                        {doc.isMandatory && (
                          <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1 rounded font-semibold">
                            Zorunlu
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{doc.notes}</div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-slate-800">{doc.category}</span>
                    </td>

                    {/* Customer */}
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-800">{doc.customerRef}</span>
                    </td>

                    {/* Related Entity */}
                    <td className="py-2.5 px-3 font-mono text-blue-700 whitespace-nowrap font-medium">
                      {doc.relatedEntityId}
                    </td>

                    {/* Due Date */}
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {doc.requiredByDate}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge status={doc.status} />
                    </td>

                    {/* Uploaded File */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {doc.fileName ? (
                        <div className="flex items-center gap-1 text-[11px] text-slate-700 font-mono">
                          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate max-w-[140px]" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Dosya yok</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setSelectedDocId(doc.id)}
                        className="px-2 py-1 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded text-xs font-medium"
                      >
                        İncele
                      </button>

                      <button
                        onClick={() => {
                          setUploadDocId(doc.id);
                          setFakeFileName(`${doc.customerRef.toLowerCase().replace(/\s+/g, '_')}_${doc.id.toLowerCase()}.pdf`);
                        }}
                        className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs font-semibold"
                        title="Demo dosya yükleme simülasyonu"
                      >
                        Dosya Yükle
                      </button>

                      {(doc.status === 'Eksik' || doc.status === 'Bekleniyor') && (
                        <button
                          onClick={() => setChaserPreviewDoc(doc)}
                          className="px-2 py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded text-xs font-semibold"
                          title="Eksik evrak hatırlatma bağlantısı önizle"
                        >
                          Hatırlatıcı
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Detail & Status Change Modal */}
      {selectedDoc && (
        <Modal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDocId(null)}
          title={`Evrak Detayı: ${selectedDoc.title}`}
          subtitle={`${selectedDoc.customerRef} · ${selectedDoc.relatedEntityId}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Durum Güncelle:</span>
              <select
                value={selectedDoc.status}
                onChange={e => updateDocumentStatus(selectedDoc.id, e.target.value as DocumentStatus)}
                className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded text-xs font-semibold"
              >
                <option value="Gerekli">Gerekli</option>
                <option value="Bekleniyor">Bekleniyor</option>
                <option value="Alındı">Alındı</option>
                <option value="Kontrol Ediliyor">Kontrol Ediliyor</option>
                <option value="Eksik">Eksik</option>
                <option value="Onaylandı">Onaylandı</option>
                <option value="Reddedildi">Reddedildi</option>
              </select>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Evrak İnceleme Notu:</span>
              <textarea
                rows={2}
                defaultValue={selectedDoc.notes}
                onBlur={e => updateDocumentStatus(selectedDoc.id, selectedDoc.status, e.target.value)}
                placeholder="Örn: Barkod teyidi yapıldı, geçerlilik süresi 2027 ye kadar..."
                className="w-full mt-1 p-2 border border-slate-300 rounded text-xs"
              />
            </div>

            {(selectedDoc.status === 'Eksik' || selectedDoc.status === 'Bekleniyor') && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px] space-y-2">
                <p>Bu evrak eksik olduğu için iş akışında gecikme yaşanabilir. Otomatik takip görevi oluşturabilirsiniz.</p>
                <button
                  onClick={() => {
                    handleCreateTaskForDoc(selectedDoc.id);
                    setSelectedDocId(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>İş Kuyruğuna Takip Görevi Aç</span>
                </button>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDocId(null)}
                className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-medium hover:bg-slate-900"
              >
                Kapat
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Placeholder Modal */}
      {uploadDocId && (
        <Modal
          isOpen={!!uploadDocId}
          onClose={() => setUploadDocId(null)}
          title="Belge Yükleme Simülasyonu"
          subtitle="Prototip ortamı için dosya yükleme simülasyonu (Demo)"
          maxWidth="sm"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <p className="text-slate-600">
              * Not: Gerçek bulut depolama entegrasyonu olmadığı için dosya yerel önbellekte işaretlenecektir.
            </p>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Yüklenecek Dosya Adı
              </label>
              <input
                type="text"
                required
                value={fakeFileName}
                onChange={e => setFakeFileName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUploadDocId(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                Yüklemeyi Tamamla
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Chaser Email Preview Modal */}
      {chaserPreviewDoc && (
        <Modal
          isOpen={!!chaserPreviewDoc}
          onClose={() => setChaserPreviewDoc(null)}
          title="Eksik Evrak Hatırlatma Şablonu (Önizleme)"
          subtitle={`Müşteri: ${chaserPreviewDoc.customerRef} · Belge: ${chaserPreviewDoc.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] space-y-1.5">
              <div className="text-slate-500">Kime: muhasebe@{chaserPreviewDoc.customerRef.toLowerCase().replace(/[^a-z]/g, '')}.com.tr</div>
              <div className="text-slate-500">Konu: [Önemli] Filo Kiralama Sözleşmesi İçin Eksik Evrak Tamamlama Talebi</div>
              <div className="pt-2 text-slate-800 leading-relaxed font-sans">
                Sayın Yetkili,<br /><br />
                <strong>{chaserPreviewDoc.customerRef}</strong> adına başlatılan filo kiralama sürecinin araç teslimat onayına geçebilmesi için <strong>{chaserPreviewDoc.title}</strong> belgesinin <strong>{chaserPreviewDoc.requiredByDate}</strong> tarihine kadar sisteme yüklenmesi gerekmektedir.<br /><br />
                Aşağıdaki güvenli portal bağlantısı üzerinden belgenizi tek tıkla yükleyebilirsiniz:<br />
                <span className="text-blue-600 underline font-mono text-xs">
                  https://portal.demo-fleet.com/evrak-yukle/token-99824?doc={chaserPreviewDoc.id}
                </span>
                <br /><br />
                Saygılarımızla,<br />
                Filo Satış Operasyonları Ekibi
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400 italic">
                * Dış e-posta gönderimi yapılmaz; bu bir otomasyon şablonu önizlemesidir.
              </span>
              <button
                onClick={() => setChaserPreviewDoc(null)}
                className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold"
              >
                Kapat
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
