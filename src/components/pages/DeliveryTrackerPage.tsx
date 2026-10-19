import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText,
  Calendar,
  Share2,
  Copy,
  Info
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { DeliveryTrackerItem, DeliveryStepStatus } from '../../types';
import { Modal } from '../common/Modal';

export const DeliveryTrackerPage: React.FC = () => {
  const { deliveryItems, updateDeliveryStep } = useSalesOps();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<DeliveryTrackerItem | null>(null);
  const [shareTrackingModalItem, setShareTrackingModalItem] = useState<DeliveryTrackerItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredItems = deliveryItems.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.customerRef.toLowerCase().includes(q) ||
      item.orderRef.toLowerCase().includes(q) ||
      item.vehicleModel.toLowerCase().includes(q) ||
      item.assignedPlates.some(p => p.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: DeliveryTrackerItem['overallStatus']) => {
    switch (status) {
      case 'Teslim Edildi':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Sevkiyatta':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Hazırlıkta (PDI/Ruhsat)':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Sipariş Alındı':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStepIcon = (status: DeliveryStepStatus) => {
    switch (status) {
      case 'Tamamlandı':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'İşlemde':
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'Gecikmiş':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'Bekliyor':
      default:
        return <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />;
    }
  };

  const handleCopyLink = (token: string) => {
    navigator.clipboard?.writeText(`https://teslimat.demo-fleet.com/takip/${token}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Araç Teslimat & Hazırlık Süreç Takip Matrisi
            </h2>
            <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono">
              6 Aşamalı Operasyonel Hazırlık
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Teklifi onaylanan filoların distribütör siparişinden teslim tesellüm tutanağına kadar tüm hazırlık adımlarını takip edin ve müşteriye canlı takip linki sağlayın.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Aktif Teslimatlar</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {deliveryItems.filter(d => d.overallStatus !== 'Teslim Edildi').length} Filo Siparişi
            </span>
          </div>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Müşteri, sipariş no, model veya plaka ile ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {filteredItems.length} Sevkiyat Dosyası
        </span>
      </div>

      {/* Deliveries Grid */}
      <div className="space-y-4">
        {filteredItems.map(item => {
          const completedCount = item.steps.filter(s => s.status === 'Tamamlandı').length;
          const progressPercent = Math.round((completedCount / item.steps.length) * 100);

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
            >
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700 text-xs">{item.id}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-bold text-slate-900 text-sm">{item.customerRef}</span>
                    <span className="text-slate-400 text-xs font-mono">({item.orderRef})</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                    <span className="font-semibold text-slate-800">{item.quantity} Adet · {item.vehicleModel}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">Tahmini Teslimat: <strong className="font-mono text-slate-800">{item.estimatedDeliveryDate}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded border ${getStatusBadge(item.overallStatus)}`}>
                    {item.overallStatus}
                  </span>

                  <button
                    onClick={() => setShareTrackingModalItem(item)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                    title="Müşteri Canlı Takip Bağlantısını Önizle"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Müşteri Takip Linki</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Hazırlık Süreç İlerlemesi ({completedCount} / {item.steps.length} Aşama)</span>
                  <span className="font-mono font-bold text-blue-700">%{progressPercent}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Sequential 6-Steps Workflow */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                {item.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded border flex flex-col justify-between ${
                      step.status === 'Tamamlandı'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : step.status === 'İşlemde'
                        ? 'bg-blue-50/50 border-blue-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-slate-400">Adım {idx + 1}</span>
                        {getStepIcon(step.status)}
                      </div>
                      <span className="font-semibold text-slate-800 text-[11px] leading-snug block">
                        {step.name}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 truncate">{step.responsible}</span>
                      <select
                        value={step.status}
                        onChange={e => updateDeliveryStep(item.id, step.id, e.target.value as DeliveryStepStatus)}
                        className="bg-white border border-slate-300 rounded text-[10px] font-semibold text-slate-700 py-0.5 px-1"
                      >
                        <option value="Bekliyor">Bekliyor</option>
                        <option value="İşlemde">İşlemde</option>
                        <option value="Tamamlandı">Tamamlandı</option>
                        <option value="Gecikmiş">Gecikmiş</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Assigned Plates strip */}
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-mono">
                <span className="text-slate-400">Atanan Plakalar:</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.assignedPlates.map(p => (
                    <span key={p} className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold border border-slate-200">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share / Customer Live Tracking Preview Modal */}
      {shareTrackingModalItem && (
        <Modal
          isOpen={!!shareTrackingModalItem}
          onClose={() => setShareTrackingModalItem(null)}
          title="Müşteri Canlı Araç Teslimat Takip Portalı (Önizleme)"
          subtitle={`Sipariş: ${shareTrackingModalItem.orderRef} · ${shareTrackingModalItem.customerRef}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-between text-blue-900">
              <div>
                <span className="font-bold text-xs">Canlı Takip Bağlantısı:</span>
                <span className="font-mono text-[11px] block text-blue-700">
                  https://teslimat.demo-fleet.com/takip/{shareTrackingModalItem.trackingToken}
                </span>
              </div>
              <button
                onClick={() => handleCopyLink(shareTrackingModalItem.trackingToken)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded font-semibold text-xs flex items-center gap-1 shadow-2xs hover:bg-blue-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Kopyalandı!' : 'Linki Kopyala'}</span>
              </button>
            </div>

            {/* Simulated Customer-Facing Screen */}
            <div className="border-2 border-slate-200 rounded-lg p-5 bg-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Filo Araç Hazırlık & Teslimat Durumu</h3>
                  <span className="text-slate-500 text-xs">{shareTrackingModalItem.quantity} Adet {shareTrackingModalItem.vehicleModel}</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-semibold text-xs">
                  Tahmini Teslimat: {shareTrackingModalItem.estimatedDeliveryDate}
                </span>
              </div>

              <div className="space-y-3">
                {shareTrackingModalItem.steps.map((st, i) => (
                  <div key={st.id} className="flex items-center gap-3 p-2 rounded bg-slate-50 border border-slate-100">
                    <div className="shrink-0">{getStepIcon(st.status)}</div>
                    <div className="flex-1">
                      <span className="font-semibold text-slate-800 text-xs">{st.name}</span>
                      {st.completedDate && (
                        <span className="text-[10px] text-emerald-700 block font-mono">Tamamlanma: {st.completedDate}</span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-600">{st.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShareTrackingModalItem(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-900"
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
