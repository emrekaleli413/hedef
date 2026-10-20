import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Zap,
  Send,
  History,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Download,
  Mail
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { Quotation, QuotationStatus, QuotationLossReason } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { AutomatedQuotationGeneratorModal } from '../modals/AutomatedQuotationGeneratorModal';
import { QuotationDocumentViewModal } from '../modals/QuotationDocumentViewModal';
import { downloadQuotationPDF } from '../../utils/pdfGenerator';
import { SendApprovalEmailModal } from '../modals/SendApprovalEmailModal';

interface QuotationPageProps {
  onOpenCreateQuoteModal: () => void;
}

export const QuotationPage: React.FC<QuotationPageProps> = ({
  onOpenCreateQuoteModal
}) => {
  const {
    quotations,
    updateQuotationStatus,
    addQuotationVersion,
    updateQuotation
  } = useSalesOps();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  // Automated Quotation Generator Modal state (Section 16 Priority Feature)
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [viewDocumentQuote, setViewDocumentQuote] = useState<Quotation | null>(null);

  // Revision state inside modal
  const [isAddingRevision, setIsAddingRevision] = useState(false);
  const [revMonthlyRent, setRevMonthlyRent] = useState<number>(0);
  const [revMargin, setRevMargin] = useState<number>(0);
  const [revNotes, setRevNotes] = useState('');

  // Reject modal state
  const [rejectQuoteId, setRejectQuoteId] = useState<string | null>(null);
  const [lossReason, setLossReason] = useState<QuotationLossReason>('Yüksek Fiyat');

  // Email dispatcher modal state
  const [emailDispatcherQuote, setEmailDispatcherQuote] = useState<{ quote: Quotation; mode: 'internal_approval' | 'customer_dispatch' } | null>(null);

  const filteredQuotes = quotations.filter(q => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const match =
        q.id.toLowerCase().includes(query) ||
        q.customerRef.toLowerCase().includes(query) ||
        q.vehicleModel.toLowerCase().includes(query) ||
        q.owner.toLowerCase().includes(query);
      if (!match) return false;
    }

    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    if (typeFilter !== 'all' && q.quotationType !== typeFilter) return false;

    return true;
  });

  const selectedQuote = quotations.find(q => q.id === selectedQuoteId);

  const handleOpenDetail = (quote: Quotation) => {
    setSelectedQuoteId(quote.id);
    setIsAddingRevision(false);
    setRevMonthlyRent(quote.monthlyRentPerVehicle);
    setRevMargin(quote.grossMarginPercent);
    setRevNotes('');
  };

  const handleSaveRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    addQuotationVersion(selectedQuote.id, {
      monthlyRent: revMonthlyRent,
      margin: revMargin,
      notes: revNotes.trim() || 'Fiyat revizyonu yapıldı'
    });
    setIsAddingRevision(false);
  };

  const handleRejectConfirm = () => {
    if (!rejectQuoteId) return;
    updateQuotationStatus(rejectQuoteId, 'Reddedildi', lossReason);
    setRejectQuoteId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Info */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Teklif & Zeyilname Çalışma Alanı
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sözleşme verilerinden otomatik hesaplanan Kilometre Aşımı, Erken İade ve Sözleşme Yenileme teklifleri
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded font-mono">
            * Fiyatlar kurgusal demo varsayımlardır
          </span>
          {/* Section 16 Priority Feature: Automated Quotation Generator Button */}
          <button
            onClick={() => setIsGeneratorModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Teklif Oluştur</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Teklif no, müşteri adı, araç modeli veya sorumlu ara..."
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
            <option value="all">Tüm Durumlar ({quotations.length})</option>
            <option value="Taslak">Taslak</option>
            <option value="İnceleniyor">İnceleniyor</option>
            <option value="Onay Bekliyor">Onay Bekliyor</option>
            <option value="Onaylandı (Fast-Track)">Onaylandı (Fast-Track)</option>
            <option value="Onaylandı">Onaylandı</option>
            <option value="Gönderildi">Gönderildi</option>
            <option value="Kabul Edildi">Kabul Edildi</option>
            <option value="Reddedildi">Reddedildi</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
          >
            <option value="all">Tüm Teklif Tipleri</option>
            <option value="Yeni Teklif">Yeni Teklif</option>
            <option value="Teklif Revizyonu">Teklif Revizyonu</option>
            <option value="Sözleşme Yenileme">Sözleşme Yenileme</option>
            <option value="Aşırı KM Zeyilnamesi">Aşırı KM Zeyilnamesi</option>
            <option value="Erken Araç İadesi">Erken Araç İadesi</option>
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 whitespace-nowrap">Teklif ID</th>
                <th className="py-3 px-3 min-w-[200px]">Müşteri & Kapsam</th>
                <th className="py-3 px-3 whitespace-nowrap">Teklif Türü</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Araç / Aylık Tutar</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Marj (%)</th>
                <th className="py-3 px-3 whitespace-nowrap">Kredi Skoru</th>
                <th className="py-3 px-3 whitespace-nowrap">Sorumlu</th>
                <th className="py-3 px-3 whitespace-nowrap">Durum</th>
                <th className="py-3 px-3 whitespace-nowrap">Geçerlilik</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                    Kayıtlı teklif bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map(quote => (
                  <tr
                    key={quote.id}
                    onClick={() => handleOpenDetail(quote)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {quote.id}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{quote.customerRef}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {quote.vehicleModel}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-slate-800 font-medium">{quote.quotationType}</span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono tabular-nums">
                      <div className="font-bold text-slate-900">
                        {quote.totalMonthlyAmount.toLocaleString('tr-TR')} TL
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {quote.vehicleCount} Araç × {quote.monthlyRentPerVehicle.toLocaleString('tr-TR')} TL
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono tabular-nums">
                      <span
                        className={`font-semibold ${
                          quote.grossMarginPercent >= 14
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        %{quote.grossMarginPercent.toFixed(1)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-slate-600">
                        {quote.customerCreditScore}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-slate-800">{quote.owner}</span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge status={quote.status} />
                      {quote.lossReason && (
                        <span className="block text-[10px] text-rose-600 mt-0.5 font-medium">
                          Neden: {quote.lossReason}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {quote.validityDate}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadQuotationPDF(quote);
                        }}
                        className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="PDF olarak doğrudan indir"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewDocumentQuote(quote);
                        }}
                        className="text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-medium cursor-pointer"
                        title="Resmi teklif belgesi ve yazdırma önizlemesi"
                      >
                        Resmi Belge
                      </button>
                      <span className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
                        İncele →
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automated Quotation Generator Modal (Priority Feature Section 16) */}
      <AutomatedQuotationGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
      />

      {/* Official Quotation Document View & Print Modal */}
      <QuotationDocumentViewModal
        isOpen={!!viewDocumentQuote}
        onClose={() => setViewDocumentQuote(null)}
        quotation={viewDocumentQuote}
        onUpdateStatus={(newStat) => {
          if (viewDocumentQuote) {
            updateQuotationStatus(viewDocumentQuote.id, newStat);
            setViewDocumentQuote({ ...viewDocumentQuote, status: newStat });
          }
        }}
      />

      {/* Quote Detail & Version Compare Modal */}
      {selectedQuote && (
        <Modal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuoteId(null)}
          title={`Teklif İnceleme & Revizyon: ${selectedQuote.id}`}
          subtitle={`${selectedQuote.customerRef} · ${selectedQuote.quotationType}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Commercial Header Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Araç Sayısı & Model</span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {selectedQuote.vehicleCount} Adet · {selectedQuote.vehicleModel}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Vade & Yıllık KM</span>
                <span className="font-mono font-semibold text-slate-800 block mt-0.5">
                  {selectedQuote.termMonths} Ay · {selectedQuote.annualKm.toLocaleString('tr-TR')} KM
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Birim & Toplam Kira</span>
                <span className="font-mono font-bold text-slate-900 block mt-0.5">
                  {selectedQuote.totalMonthlyAmount.toLocaleString('tr-TR')} TL / Ay
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  (Araç başı {selectedQuote.monthlyRentPerVehicle.toLocaleString('tr-TR')} TL)
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Brüt Kar Marjı</span>
                <span className="font-mono font-bold text-emerald-700 text-sm block mt-0.5">
                  %{selectedQuote.grossMarginPercent.toFixed(1)}
                </span>
                {selectedQuote.isFastTrackEligible && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded font-mono">
                    Fast-Track Uygun
                  </span>
                )}
              </div>
            </div>

            {/* Workflow Status Controls */}
            <div className="p-3 bg-white border border-slate-200 rounded flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Teklif Aşaması:</span>
                <StatusBadge status={selectedQuote.status} size="md" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => downloadQuotationPDF(selectedQuote)}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold rounded text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="PDF olarak doğrudan indir"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF İndir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEmailDispatcherQuote({ quote: selectedQuote, mode: 'internal_approval' })}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Dahili onay komitesine e-posta ile ilet"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-300" />
                  <span>Onaya Gönder (Mail)</span>
                </button>

                {selectedQuote.status === 'Onay Bekliyor' && (
                  <button
                    type="button"
                    onClick={() => updateQuotationStatus(selectedQuote.id, 'Onaylandı')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Teklifi Onayla</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setEmailDispatcherQuote({ quote: selectedQuote, mode: 'customer_dispatch' })}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs flex items-center gap-1 cursor-pointer"
                  title="Müşteriye resmi teklif PDF'ini e-posta ile ilet"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Müşteriye İlet (PDF Gönder)</span>
                </button>

                {selectedQuote.status === 'Gönderildi' && (
                  <>
                    <button
                      type="button"
                      onClick={() => updateQuotationStatus(selectedQuote.id, 'Kabul Edildi')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Müşteri Kabul Etti</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectQuoteId(selectedQuote.id)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-medium rounded text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reddedildi</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsAddingRevision(!isAddingRevision)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded text-xs"
                >
                  {isAddingRevision ? 'Vazgeç' : '+ Yeni Revizyon Versiyonu'}
                </button>
              </div>
            </div>

            {/* Add Revision Form */}
            {isAddingRevision && (
              <form onSubmit={handleSaveRevision} className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg space-y-3">
                <h5 className="font-bold text-blue-900 text-xs">Teklif Fiyat Revizyonu Oluştur</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-medium block mb-1">Yeni Birim Araç Kirası (TL/Ay)</label>
                    <input
                      type="number"
                      step={500}
                      value={revMonthlyRent}
                      onChange={e => setRevMonthlyRent(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs border border-slate-300 rounded p-1.5 font-mono bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-medium block mb-1">Yeni Tahmini Brüt Kar Marjı (%)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={revMargin}
                      onChange={e => setRevMargin(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs border border-slate-300 rounded p-1.5 font-mono bg-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Revizyon Gerekçesi & Notlar</label>
                  <input
                    type="text"
                    placeholder="Örn: Müşteri iskonto talebi doğrultusunda birim fiyatta %4 indirim sağlandı"
                    value={revNotes}
                    onChange={e => setRevNotes(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingRevision(false)}
                    className="px-3 py-1 border border-slate-300 rounded text-slate-700 text-xs"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                  >
                    Revizyonu Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Version History & Comparison View */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h5 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-600" />
                <span>Teklif Versiyon Karşılaştırma & Tarihçe</span>
              </h5>

              <div className="space-y-3">
                {selectedQuote.versions.map((ver, idx) => (
                  <div
                    key={ver.version}
                    className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-700">
                          Versiyon v{ver.version}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 font-mono text-[11px]">{ver.date}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-700 font-medium text-[11px]">{ver.author}</span>
                      </div>
                      <p className="text-slate-600 text-xs">{ver.notes}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        {ver.monthlyRentPerVehicle.toLocaleString('tr-TR')} TL / Araç
                      </div>
                      <div className="text-[11px] font-mono font-medium text-emerald-700">
                        Marj: %{ver.grossMarginPercent.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Quote Modal */}
      {rejectQuoteId && (
        <Modal
          isOpen={!!rejectQuoteId}
          onClose={() => setRejectQuoteId(null)}
          title="Teklifi Kayıp Olarak İşaretle"
          subtitle="Gelecekteki teklif optimizasyonları için kayıp nedenini belirtin"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Kayıp Nedeni
              </label>
              <select
                value={lossReason}
                onChange={e => setLossReason(e.target.value as QuotationLossReason)}
                className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
              >
                <option value="Yüksek Fiyat">Yüksek Fiyat</option>
                <option value="Teslimat Süresi Uzun">Teslimat Süresi Uzun</option>
                <option value="Rakip Tercih Edildi">Rakip Tercih Edildi</option>
                <option value="Bütçe İptali">Bütçe İptali</option>
                <option value="Özellik Uyumsuzluğu">Özellik Uyumsuzluğu</option>
                <option value="Kredi Skoru Yetersiz">Kredi Skoru Yetersiz</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectQuoteId(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs hover:bg-slate-50 font-medium"
              >
                Vazgeç
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-3 py-1.5 bg-rose-600 text-white rounded text-xs hover:bg-rose-700 font-medium"
              >
                Kaydet
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Send Approval / Customer Dispatch Email Modal */}
      {emailDispatcherQuote && (
        <SendApprovalEmailModal
          isOpen={!!emailDispatcherQuote}
          onClose={() => setEmailDispatcherQuote(null)}
          quotation={emailDispatcherQuote.quote}
          mode={emailDispatcherQuote.mode}
          onSuccess={() => {
            setEmailDispatcherQuote(null);
          }}
        />
      )}
    </div>
  );
};
