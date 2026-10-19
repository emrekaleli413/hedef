import React from 'react';
import { TaskStatus, QuotationStatus, DocumentStatus, DisputeStatus } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus | QuotationStatus | DocumentStatus | DisputeStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyles = () => {
    switch (status) {
      // Success / Approved / Completed states
      case 'Tamamlandı':
      case 'Onaylandı':
      case 'Onaylandı (Fast-Track)':
      case 'Kabul Edildi':
      case 'Çözümlendi (İptal/Düzeltme)':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';

      // In progress / Reviewing
      case 'İşlemde':
      case 'İnceleniyor':
      case 'Kontrol Ediliyor':
      case 'Müşteri Görüşmesi':
        return 'bg-blue-50 text-blue-800 border-blue-200';

      // Waiting approval / Warning
      case 'Onay Bekliyor':
      case 'Yenileme Bekliyor':
      case 'Bekleniyor':
        return 'bg-amber-50 text-amber-800 border-amber-200';

      // External response / Blocking
      case 'Dış Yanıt Bekliyor':
      case 'Gönderildi':
      case 'Görüşülüyor':
        return 'bg-purple-50 text-purple-800 border-purple-200';

      // Critical / Missing / Rejected
      case 'Eksik':
      case 'Reddedildi':
      case 'Reddedildi (Geçerli Fatura)':
      case 'İptal':
      case 'Süresi Doldu':
        return 'bg-rose-50 text-rose-800 border-rose-200';

      // New / Default
      case 'Yeni':
      case 'Taslak':
      case 'Gerekli':
      case 'Alındı':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded whitespace-nowrap ${pad} ${getStyles()}`}
    >
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const getStyles = () => {
    switch (priority) {
      case 'Kritik':
        return 'text-rose-700 font-bold bg-rose-50 border-rose-200';
      case 'Yüksek':
        return 'text-orange-700 font-semibold bg-orange-50 border-orange-200';
      case 'Orta':
        return 'text-amber-800 font-medium bg-amber-50 border-amber-200';
      case 'Düşük':
      default:
        return 'text-slate-600 font-normal bg-slate-50 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] border whitespace-nowrap ${getStyles()}`}>
      {priority}
    </span>
  );
};
