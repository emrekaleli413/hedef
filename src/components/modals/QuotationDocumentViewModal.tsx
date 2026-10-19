import React from 'react';
import {
  Printer,
  CheckCircle2,
  XCircle,
  Send,
  History,
  FileText,
  AlertTriangle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';

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
  if (!quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  const calc = quotation.calculationDetails;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Resmi Teklif Belgesi & Önizleme: ${quotation.id}`}
      subtitle={`${quotation.customerRef} · ${quotation.quotationType}`}
      maxWidth="4xl"
    >
      <div className="space-y-4 text-xs">
        {/* Top Control Bar */}
        <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 rounded font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Yazdır / PDF Olarak Kaydet</span>
            </button>
            <StatusBadge status={quotation.status} size="md" />
          </div>

          {onUpdateStatus && (
            <div className="flex items-center gap-2">
              {quotation.status === 'Taslak' && (
                <button
                  onClick={() => onUpdateStatus('Onay Bekliyor')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dahili Onaya Gönder</span>
                </button>
              )}

              {quotation.status === 'Onay Bekliyor' && (
                <button
                  onClick={() => onUpdateStatus('Onaylandı')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs flex items-center gap-1 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Teklifi Onayla</span>
                </button>
              )}

              {(quotation.status === 'Onaylandı' || quotation.status === 'Onaylandı (Fast-Track)') && (
                <button
                  onClick={() => onUpdateStatus('Gönderildi')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Müşteriye İletildi Olarak İşaretle</span>
                </button>
              )}

              {quotation.status === 'Gönderildi' && (
                <button
                  onClick={() => onUpdateStatus('Kabul Edildi')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs flex items-center gap-1 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Müşteri Kabul Etti</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* PRINTABLE OFFICIAL BUSINESS DOCUMENT (Section 16.F) */}
        <div
          id="official-quote-print-area"
          className="bg-white border-2 border-slate-300 rounded-lg p-8 shadow-sm text-slate-900 space-y-6 print:border-none print:shadow-none print:p-0"
        >
          {/* Mandatory Prominent Demo Disclaimer Watermark (Section 16.F) */}
          <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 text-center rounded font-mono font-bold text-[11px] uppercase tracking-wider">
            DEMO BELGESİ — TUTARLAR VE HESAPLAMA KURALLARI TEMSİLİDİR. GERÇEK TİCARİ TEKLİF DEĞİLDİR.
          </div>

          {/* Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                SalesOps Filo Kiralama ve Operasyon A.Ş.
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Ticari Satış Destek Operasyonları Müdürlüğü · Maslak, Sarıyer / İstanbul
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Mersis: 0741-0982-1200-0018 · Vergi Dairesi: Boğaziçi 7410982120
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded mb-1">
                {quotation.id}
              </div>
              <div className="text-xs text-slate-600 font-mono">
                Düzenleme: {quotation.createdAt}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Geçerlilik: {quotation.validityDate}
              </div>
            </div>
          </div>

          {/* Document Subject Title */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Belge Konusu</span>
              <span className="text-sm font-bold text-slate-900">{quotation.quotationType} Resmi Fiyat Teklifi ve Zeyilname Şartları</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Dahili Durum</span>
              <StatusBadge status={quotation.status} />
            </div>
          </div>

          {/* Customer and Vehicle Information */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="border border-slate-200 rounded p-3 space-y-1 bg-slate-50/50">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block border-b border-slate-200 pb-1 mb-1">
                Müşteri Bilgileri
              </span>
              <div>
                <span className="text-slate-400 text-[11px]">Ünvan: </span>
                <strong className="text-slate-900">{quotation.customerRef}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Müşteri Kodu: </span>
                <span className="font-mono text-slate-700">{quotation.customerCode}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Sorumlu Uzman: </span>
                <span className="text-slate-700">{quotation.owner}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded p-3 space-y-1 bg-slate-50/50">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block border-b border-slate-200 pb-1 mb-1">
                Sözleşme & Araç Detayları
              </span>
              <div>
                <span className="text-slate-400 text-[11px]">İlişkili Sözleşme: </span>
                <strong className="font-mono text-blue-700">{quotation.relatedContractId || 'Yeni Kiralama'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Araç Modeli: </span>
                <span className="text-slate-800 font-medium">{quotation.vehicleModel}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Filo Adedi & Vade: </span>
                <span className="font-mono text-slate-700">{quotation.vehicleCount} Araç · {quotation.termMonths} Ay · {quotation.annualKm?.toLocaleString('tr-TR')} KM</span>
              </div>
            </div>
          </div>

          {/* Itemized Calculation Breakdown Table */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Hesaplama Kırılımı ve Hizmet Kalemleri
            </span>

            {calc && calc.itemizedCharges && calc.itemizedCharges.length > 0 ? (
              <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5">Sıra</th>
                    <th className="p-2.5">Hizmet / Tarife Açıklaması</th>
                    <th className="p-2.5">Hesaplama Dayanağı</th>
                    <th className="p-2.5 text-right">Tutar (TL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {calc.itemizedCharges.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 font-semibold text-slate-900">{item.description}</td>
                      <td className="p-2.5 text-slate-500 font-mono text-[11px]">{item.calculationNote || '-'}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {item.amountTRY.toLocaleString('tr-TR')} TL
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan={3} className="p-2.5 text-right font-bold text-slate-700">
                      Ara Toplam (KDV Matrahı):
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      {calc.subtotalTRY.toLocaleString('tr-TR')} TL
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td colSpan={3} className="p-2.5 text-right text-slate-600">
                      Hesaplanan KDV (%{calc.vatRatePercent}):
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-800">
                      {calc.vatAmountTRY.toLocaleString('tr-TR')} TL
                    </td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={3} className="p-3 text-right uppercase text-xs tracking-wider">
                      Genel Toplam (KDV Dahil):
                    </td>
                    <td className="p-3 text-right font-mono text-base text-emerald-400">
                      {calc.grandTotalTRY.toLocaleString('tr-TR')} TL
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs">
                <div className="flex justify-between items-center py-1">
                  <span>Aylık Birim Araç Kirası:</span>
                  <strong className="font-mono">{quotation.monthlyRentPerVehicle.toLocaleString('tr-TR')} TL</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200">
                  <span>Toplam Aylık Filo Kira Tutarı ({quotation.vehicleCount} Araç):</span>
                  <strong className="font-mono text-sm text-slate-900">{quotation.totalMonthlyAmount.toLocaleString('tr-TR')} TL / Ay</strong>
                </div>
              </div>
            )}
          </div>

          {/* Formula and Assumptions */}
          {calc && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                Uygulanan Hesaplama Formülü & Koşullar
              </span>
              <p className="font-mono text-[11px] text-blue-900 bg-white p-2 rounded border border-slate-200">
                {calc.formulaDescription}
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                {calc.assumptions.map((asm, idx) => (
                  <li key={idx}>{asm}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Signatures Block */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Hazırlayan & Onaya Sunan
              </span>
              <div className="font-bold text-slate-900">{quotation.owner}</div>
              <div className="text-[11px] text-slate-500">Satış Destek Operasyon Uzmanı</div>
              <div className="h-12 border-b border-dashed border-slate-300 mt-2" />
              <span className="text-[10px] text-slate-400 mt-1 block">İmza / Paraf</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Müşteri Temsilcisi Onayı
              </span>
              <div className="font-bold text-slate-900">{quotation.customerRef}</div>
              <div className="text-[11px] text-slate-500">Filo Yetkilisi / Finans Direktörü</div>
              <div className="h-12 border-b border-dashed border-slate-300 mt-2" />
              <span className="text-[10px] text-slate-400 mt-1 block">Kaşe / Yetkili İmza</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
