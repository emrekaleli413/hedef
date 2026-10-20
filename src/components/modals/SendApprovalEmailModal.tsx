import React, { useState } from 'react';
import {
  Mail,
  Send,
  Paperclip,
  CheckCircle2,
  X,
  FileText,
  Download,
  AlertCircle,
  Building2,
  UserCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Quotation } from '../../types';
import { downloadQuotationPDF } from '../../utils/pdfGenerator';
import { useSalesOps } from '../../context/SalesOpsContext';

interface SendApprovalEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  mode?: 'internal_approval' | 'customer_dispatch';
  onSuccess?: () => void;
}

export const SendApprovalEmailModal: React.FC<SendApprovalEmailModalProps> = ({
  isOpen,
  onClose,
  quotation,
  mode = 'internal_approval',
  onSuccess
}) => {
  const { updateQuotationStatus, addNotification } = useSalesOps();

  const isInternal = mode === 'internal_approval';

  const defaultRecipient = isInternal
    ? 'kredi-komite@hedeffilo.com'
    : `muhasebe@${quotation?.customerRef.toLowerCase().replace(/[^a-z0-9]/g, '') || 'firma'}.com.tr`;

  const [recipient, setRecipient] = useState(defaultRecipient);
  const [cc, setCc] = useState('satis-operasyon@hedeffilo.com');
  const [subject, setSubject] = useState(
    isInternal
      ? `[Dahili Onay Talebi] ${quotation?.id || 'TKF-2026'} · ${quotation?.customerRef || 'Müşteri'} (${quotation?.vehicleCount || 1} Araç - ${quotation?.quotationType || 'Teklif'})`
      : `[Hedef Filo Teklif Mektubu] ${quotation?.id || 'TKF-2026'} · ${quotation?.customerRef || 'Müşteri'}`
  );
  const [messageBody, setMessageBody] = useState(
    isInternal
      ? `Sayın Onay Komitesi,\n\n${quotation?.customerRef} firması için hazırlanan ${quotation?.quotationType} teklifi ekte resmi PDF olarak yer almaktadır.\n\nAraç: ${quotation?.vehicleCount} Adet ${quotation?.vehicleModel}\nAylık Birim Kira: ${quotation?.monthlyRentPerVehicle?.toLocaleString('tr-TR')} TL\nAylık Toplam: ${quotation?.totalMonthlyAmount?.toLocaleString('tr-TR')} TL\nKredi Risk Sınıfı: ${quotation?.customerCreditScore || 'A+'}\n\nİlgili teklifin değerlendirilerek onaylanmasını arz ederim.\n\nSaygılarımla,\n${quotation?.owner || 'Satış Destek Uzmanı'}`
      : `Sayın Yetkili,\n\n${quotation?.customerRef} adına talep etmiş olduğunuz filo kiralama koşullarına ilişkin resmi teklif mektubumuz ekte PDF olarak bilgilerinize sunulmuştur.\n\nTeklif detaylarınızı inceleyerek onayınızı portalımız veya e-posta yoluyla iletebilirsiniz.\n\nSaygılarımızla,\nHedef Filo Satış Operasyonları`
  );

  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync state when quotation changes
  React.useEffect(() => {
    if (quotation) {
      setRecipient(
        isInternal
          ? 'kredi-komite@hedeffilo.com'
          : `muhasebe@${quotation.customerRef.toLowerCase().replace(/[^a-z0-9]/g, '') || 'firma'}.com.tr`
      );
      setSubject(
        isInternal
          ? `[Dahili Onay Talebi] ${quotation.id} · ${quotation.customerRef} (${quotation.vehicleCount} Araç)`
          : `[Hedef Filo Teklif Mektubu] ${quotation.id} · ${quotation.customerRef}`
      );
    }
  }, [quotation, isInternal]);

  if (!quotation) return null;

  const handleSend = () => {
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);

      const targetStatus = isInternal ? 'Onay Bekliyor' : 'Gönderildi';
      updateQuotationStatus(quotation.id, targetStatus);

      addNotification(
        isInternal
          ? `E-posta Gönderildi: ${quotation.id} onay komitesine iletildi (${recipient}).`
          : `Teklif İletildi: ${quotation.id} resmi PDF teklifi müşteriye gönderildi (${recipient}).`,
        'success'
      );

      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1400);
    }, 700);
  };

  const handleDownloadPDF = () => {
    downloadQuotationPDF(quotation);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isInternal ? 'Dahili Onaya Gönder (Mail ile İlet)' : 'Müşteriye Resmi PDF Gönder'}
      subtitle={`${quotation.id} · ${quotation.customerRef}`}
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 animate-scale-in" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {isInternal ? 'Teklif Başarıyla Onaya Gönderildi!' : 'Teklif Müşteriye İletildi!'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {recipient} adresine e-posta ve ekli resmi PDF belgesi başarıyla sevk edildi.
          </p>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Email Header Fields */}
          <div className="space-y-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <label className="w-14 text-slate-500 font-medium text-[11px]">Kime:</label>
              <input
                type="email"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-14 text-slate-500 font-medium text-[11px]">Bilgi (CC):</label>
              <input
                type="text"
                value={cc}
                onChange={e => setCc(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-14 text-slate-500 font-medium text-[11px]">Konu:</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 font-semibold"
              />
            </div>
          </div>

          {/* Attached Document Chip */}
          <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-slate-900 block truncate text-xs">
                  {quotation.id}_{quotation.customerRef.replace(/[^a-zA-Z0-9]/g, '_')}_Teklif.pdf
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Resmi Onaylı PDF Belgesi · {quotation.vehicleCount} Araç
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded text-[11px] font-semibold shrink-0 cursor-pointer shadow-xs"
              title="PDF olarak cihazınıza indirin"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>PDF İndir</span>
            </button>
          </div>

          {/* Email Body */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">E-Posta Metni:</label>
            <textarea
              rows={6}
              value={messageBody}
              onChange={e => setMessageBody(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-[11px] text-slate-400">
              * Gönderim simülasyonu çalıştırılır ve teklif durumu güncellenir.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-3.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || !recipient.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs cursor-pointer"
              >
                {isSending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>İletiliyor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>E-Posta ile Gönder</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
