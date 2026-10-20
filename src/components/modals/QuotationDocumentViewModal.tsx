import React, { useState } from 'react';
import {
  Printer,
  CheckCircle2,
  XCircle,
  Send,
  History,
  FileText,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Download,
  Mail
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { downloadQuotationPDF, triggerPrintWindow } from '../../utils/pdfGenerator';
import { SendApprovalEmailModal } from './SendApprovalEmailModal';

interface QuotationDocumentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onUpdateStatus?: (status: QuotationStatus) => void;
}

export const QuotationDocumentViewModal: React.FC<QuotationDocumentViewModalProps> = ({
  isOpen,
  onClose,
  quotation,
  onUpdateStatus
}) => {
  const [emailModalMode, setEmailModalMode] = useState<'internal_approval' | 'customer_dispatch' | null>(null);

  if (!quotation) return null;

  const handleDownload = () => {
    downloadQuotationPDF(quotation);
  };

  const handlePrint = () => {
    triggerPrintWindow('quotation-document-printable');
  };

  const calc = quotation.calculationDetails;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Resmi Teklif Belgesi: ${quotation.id}`}
        subtitle={`${quotation.customerRef} · ${quotation.quotationType}`}
        maxWidth="4xl"
      >
        <div className="space-y-4 text-xs">
          {/* Top Control Bar with PDF Download & Email dispatch */}
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              {/* Direct PDF Download */}
              <button
                type="button"
                onClick={handleDownload}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                title="Teklifi PDF olarak anında cihazınıza indirin"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF İndir</span>
              </button>

              {/* Print to Printer/System PDF */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                title="Yazdırma önizlemesini aç"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Yazdır</span>
              </button>

              <StatusBadge status={quotation.status} size="md" />
            </div>

            {/* Email Dispatch & Approval Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setEmailModalMode('internal_approval')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                title="Teklif onay komitesine e-posta ile ilet"
              >
                <Mail className="w-3.5 h-3.5 text-blue-300" />
                <span>Onaya Gönder (Mail ile İlet)</span>
              </button>

              <button
                type="button"
                onClick={() => setEmailModalMode('customer_dispatch')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                title="Müşteriye resmi teklif PDF'ini e-posta ile gönder"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Müşteriye İlet (PDF Gönder)</span>
              </button>

              {onUpdateStatus && quotation.status === 'Onay Bekliyor' && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus('Onaylandı')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Onayla</span>
                </button>
              )}
            </div>
          </div>

          {/* PRINTABLE OFFICIAL BUSINESS DOCUMENT */}
          <div
            id="quotation-document-printable"
            className="bg-white border-2 border-slate-300 rounded-lg p-8 shadow-sm text-slate-900 space-y-6"
          >
            {/* Disclaimer Banner */}
            <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 text-center rounded font-mono font-bold text-[11px] uppercase tracking-wider">
              DEMO BELGESİ — TUTARLAR VE HESAPLAMA KURALLARI TEMSİLİDİR. GERÇEK TİCARİ TEKLİF DEĞİLDİR.
            </div>

            {/* Document Header & Letterhead */}
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-5">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                  SalesOps Filo Kiralama ve Operasyon A.Ş.
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Büyükdere Caddesi No:184 Levent / İstanbul · V.D.: Boğaziçi · VKN: 7810294821
                </p>
                <p className="text-xs text-slate-500">
                  Tel: +90 (212) 444 0 345 · E-Posta: filo-operasyon@salesops-fleet.com.tr
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                  RESMİ TEKLİF MEKTUBU
                </span>
                <span className="text-base font-bold font-mono text-blue-700 block mt-0.5">
                  {quotation.id}
                </span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  Tarih: {quotation.createdAt}
                </span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  Son Geçerlilik: {quotation.validityDate}
                </span>
              </div>
            </div>

            {/* Client & Contract Subject */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Sayın Müşteri Yetkilisi / Şirket Bilgileri
                </span>
                <h2 className="text-sm font-bold text-slate-900 mt-1">
                  {quotation.customerRef}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 font-mono">
                  Müşteri Kodu: {quotation.customerCode}
                </p>
                <p className="text-xs text-slate-600">
                  İlgili Yetkili: Satın Alma / İdari İşler Departmanı
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Teklif Konusu & Türü
                </span>
                <h2 className="text-sm font-bold text-blue-900 mt-1">
                  {quotation.quotationType}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {quotation.vehicleCount} Adet {quotation.vehicleModel}
                </p>
                <p className="text-xs text-slate-600">
                  Operasyon Sorumlusu: {quotation.owner} (Satış Destek)
                </p>
              </div>
            </div>

            {/* Executive Commercial Table */}
            <div>
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs block mb-2">
                1. Kiralama ve Finansal Koşullar Tablosu
              </span>
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-[11px] font-bold border-b border-slate-300">
                    <th className="p-2.5 border-r border-slate-300">Araç Modeli / Segment</th>
                    <th className="p-2.5 border-r border-slate-300 text-center">Adet</th>
                    <th className="p-2.5 border-r border-slate-300 text-center">Vade</th>
                    <th className="p-2.5 border-r border-slate-300 text-center">Yıllık KM</th>
                    <th className="p-2.5 border-r border-slate-300 text-right">Birim Kira (TL/Ay)</th>
                    <th className="p-2.5 text-right">Toplam Kira (TL/Ay)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  <tr>
                    <td className="p-2.5 font-sans font-semibold border-r border-slate-200">
                      {quotation.vehicleModel}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200">
                      {quotation.vehicleCount}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200">
                      {quotation.termMonths} Ay
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200">
                      {quotation.annualKm?.toLocaleString('tr-TR')} KM
                    </td>
                    <td className="p-2.5 text-right border-r border-slate-200">
                      {quotation.monthlyRentPerVehicle?.toLocaleString('tr-TR')} TL
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900">
                      {quotation.totalMonthlyAmount?.toLocaleString('tr-TR')} TL
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Detailed Cost Breakdown if exists */}
            {calc && (
              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider text-xs block mb-2">
                  2. Şeffaf Maliyet Bileşenleri Analizi (Aylık Araç Başına)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-slate-400 block text-[10px]">Net Araç Finansmanı</span>
                    <span className="font-mono font-bold text-slate-900">
                      {calc.costBreakdown?.vehicleFinancingDepreciation?.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-slate-400 block text-[10px]">Kasko, Sigorta & İMM</span>
                    <span className="font-mono font-bold text-slate-900">
                      {calc.costBreakdown?.insuranceAndCasko?.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-slate-400 block text-[10px]">Yetkili Servis & Bakım</span>
                    <span className="font-mono font-bold text-slate-900">
                      {calc.costBreakdown?.maintenanceAndWear?.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-slate-400 block text-[10px]">Lastik & MTV</span>
                    <span className="font-mono font-bold text-slate-900">
                      {((calc.costBreakdown?.tyreManagement || 0) + (calc.costBreakdown?.motorVehicleTaxMTV || 0)).toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Commercial Summary Box */}
            <div className="flex justify-end">
              <div className="w-80 border-2 border-slate-800 rounded p-3 bg-slate-50 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Aylık Ara Toplam (KDV Hariç):</span>
                  <span>{quotation.totalMonthlyAmount?.toLocaleString('tr-TR')} TL</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>KDV (%20):</span>
                  <span>{((quotation.totalMonthlyAmount || 0) * 0.2).toLocaleString('tr-TR')} TL</span>
                </div>
                <div className="border-t border-slate-300 pt-1.5 flex justify-between font-bold text-sm text-blue-900">
                  <span>Aylık Genel Toplam (KDV Dahil):</span>
                  <span>{((quotation.totalMonthlyAmount || 0) * 1.2).toLocaleString('tr-TR')} TL</span>
                </div>
              </div>
            </div>

            {/* Operational Commitments */}
            <div className="border-t border-slate-300 pt-4 space-y-1 text-slate-600 leading-relaxed text-[11px]">
              <span className="font-bold text-slate-800 block text-xs">
                3. Operasyonel Standartlar & Hizmet Taahhütleri
              </span>
              <p>• Tüm araçlarımız anlaşmalı yetkili servis ağında orijinal yedek parça garantisiyle periyodik bakıma tabi tutulur.</p>
              <p>• Arıza veya kaza hallerinde 24 saat içinde muadil veya bir üst segment geçici ikame araç temin edilir.</p>
              <p>• Kış lastiği montaj ve mevsimsel saklama (otel) hizmetleri anlaşmalı servis noktalarından ücretsiz sağlanır.</p>
              <p>• HGS/OGS geçiş bedelleri ve trafik cezaları, ceza indirim hakları gözetilerek cari hesaba aylık faturalanır.</p>
            </div>

            {/* Signature & Seal Block */}
            <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border border-slate-300 rounded p-4 h-28 flex flex-col justify-between">
                <span className="font-bold text-slate-800">
                  SalesOps Filo Kiralama A.Ş. (Yetkili İmzalar)
                </span>
                <span className="text-[10px] text-slate-400 italic">Kaşe / İmzalandı</span>
              </div>
              <div className="border border-slate-300 rounded p-4 h-28 flex flex-col justify-between">
                <span className="font-bold text-slate-800">
                  {quotation.customerRef} (Müşteri Kabul & Onay)
                </span>
                <span className="text-[10px] text-slate-400 italic">Temsile Yetkili İmza / Kaşe</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Email Dispatcher Modal */}
      {emailModalMode && (
        <SendApprovalEmailModal
          isOpen={!!emailModalMode}
          onClose={() => setEmailModalMode(null)}
          quotation={quotation}
          mode={emailModalMode}
          onSuccess={() => {
            if (onUpdateStatus) {
              onUpdateStatus(emailModalMode === 'internal_approval' ? 'Onay Bekliyor' : 'Gönderildi');
            }
          }}
        />
      )}
    </>
  );
};
