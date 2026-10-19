import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  PieChart,
  Calendar,
  AlertTriangle,
  Zap,
  Info,
  Car,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';

export const AnalyticsPage: React.FC = () => {
  const {
    tasks,
    quotations,
    contracts,
    disputes,
    teamMembers,
    estimatedHoursSavedWeekly,
    avgCompletionDays
  } = useSalesOps();

  // Quotation status counts
  const quoteOutcomes = {
    'Kabul Edildi': quotations.filter(q => q.status === 'Kabul Edildi').length,
    'Onaylandı (Fast-Track)': quotations.filter(q => q.status === 'Onaylandı (Fast-Track)').length,
    Onaylandı: quotations.filter(q => q.status === 'Onaylandı').length,
    Gönderildi: quotations.filter(q => q.status === 'Gönderildi').length,
    'Onay Bekliyor': quotations.filter(q => q.status === 'Onay Bekliyor').length,
    İnceleniyor: quotations.filter(q => q.status === 'İnceleniyor').length,
    Reddedildi: quotations.filter(q => q.status === 'Reddedildi').length
  };

  // Lost reasons
  const lostReasons = [
    { reason: 'Yüksek Fiyat', count: 4, percent: 50 },
    { reason: 'Teslimat Süresi Uzun', count: 2, percent: 25 },
    { reason: 'Rakip Tercih Edildi', count: 1, percent: 12.5 },
    { reason: 'Bütçe İptali', count: 1, percent: 12.5 }
  ];

  // Process completion times (demo days)
  const processTimes = [
    { process: 'Teklif Hazırlama (Fast-Track)', days: 0.1, color: 'bg-emerald-600' },
    { process: 'Teklif Hazırlama (Standart)', days: 2.4, color: 'bg-blue-600' },
    { process: 'Sözleşme Yenileme', days: 3.8, color: 'bg-amber-600' },
    { process: 'Aşırı KM Zeyilnamesi', days: 2.9, color: 'bg-violet-600' },
    { process: 'Erken İade Ekspertiz', days: 5.2, color: 'bg-purple-600' },
    { process: 'Fatura İtiraz Çözümü', days: 4.1, color: 'bg-orange-600' }
  ];

  // Renewal workload by horizon
  const renewal30 = contracts.filter(c => c.daysUntilRenewal <= 30).length;
  const renewal60 = contracts.filter(c => c.daysUntilRenewal > 30 && c.daysUntilRenewal <= 60).length;
  const renewal90 = contracts.filter(c => c.daysUntilRenewal > 60 && c.daysUntilRenewal <= 90).length;

  // Dispute categories count
  const disputeCategories = [
    { cat: 'Hatalı Tutar', count: disputes.filter(d => d.category === 'Hatalı Tutar').length },
    { cat: 'Sözleşme Uyuşmazlığı', count: disputes.filter(d => d.category === 'Sözleşme Uyuşmazlığı').length },
    { cat: 'Çift Fatura', count: disputes.filter(d => d.category === 'Çift Fatura').length },
    { cat: 'Eksik Destekleyici Belge', count: disputes.filter(d => d.category === 'Eksik Destekleyici Belge').length }
  ];

  const overdueCount = tasks.filter(t => t.isOverdue || t.waitingDays >= 4).length;
  const overdueRatio = tasks.length > 0 ? Math.round((overdueCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Satış Destek & Operasyon Analitiği
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Süreç verimliliği, SLA uyumu, teklif dönüşüm metrikleri ve otomasyon tasarruf hesaplamaları.
          </p>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 shrink-0">
          <Zap className="w-5 h-5 text-blue-600" />
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-700 block">
              Tahmini Haftalık Zaman Tasarrufu
            </span>
            <span className="text-xl font-bold font-mono text-blue-900">
              ~{estimatedHoursSavedWeekly} Saat / Hafta
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500">Ortalama Tamamlanma Süresi</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{avgCompletionDays}</span>
            <span className="text-xs text-slate-400">iş günü</span>
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">Önceki çeyreğe göre -32%</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500">Geciken Görev Oranı (SLA Aşımı)</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 font-mono tabular-nums">%{overdueRatio}</span>
            <span className="text-xs text-slate-400">({overdueCount} görev)</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Hedef: &lt; %15</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500">Fast-Track Teklif Oranı</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">%28</span>
            <span className="text-xs text-slate-400">otomatik onay</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Komite bekleme: 0 gün</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500">Önümüzdeki 90 Gün Yenileme</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
              {renewal30 + renewal60 + renewal90}
            </span>
            <span className="text-xs text-slate-400">sözleşme</span>
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">Toplam 26 araç</span>
        </div>
      </div>

      {/* Main Grid: Process Times + Quotation Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average completion time by process */}
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Süreç Bazında Ortalama Tamamlanma Süreleri
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">İş Günü</span>
          </div>

          <div className="space-y-3">
            {processTimes.map((item, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-800 font-medium">{item.process}</span>
                  <span className="font-mono font-bold text-slate-900">{item.days} gün</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all`}
                    style={{ width: `${Math.min(100, item.days * 18)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quotation Outcomes & Breakdown */}
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Teklif Sonuçları & Durum Dağılımı
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Toplam {quotations.length} Teklif</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(quoteOutcomes).map(([status, count]) => (
              <div
                key={status}
                className="p-3 bg-slate-50 border border-slate-100 rounded flex flex-col justify-between"
              >
                <span className="text-[11px] text-slate-600 truncate">{status}</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1">{count}</span>
              </div>
            ))}
          </div>

          {/* Loss Reasons */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Kayıp Teklif Gerekçeleri Dağılımı
            </h4>
            <div className="space-y-1.5 text-xs">
              {lostReasons.map(lr => (
                <div key={lr.reason} className="flex items-center justify-between p-1 hover:bg-slate-50 rounded">
                  <span className="text-slate-700">{lr.reason}</span>
                  <span className="font-mono text-slate-500">
                    {lr.count} adet (%{lr.percent})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Grid: Renewal Timeline & Dispute Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Renewal Workload Timeline */}
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
            Yenileme İş Yükü Projeksiyonu (T-30 / 60 / 90 Gün)
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded">
              <span className="text-[11px] text-rose-700 font-bold block uppercase">T-30 Gün (Kritik)</span>
              <span className="text-2xl font-bold font-mono text-rose-900 mt-1 block">{renewal30}</span>
              <span className="text-[10px] text-rose-600 mt-1 block">Acil teklif sunulmalı</span>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded">
              <span className="text-[11px] text-amber-700 font-bold block uppercase">T-60 Gün (Öncelikli)</span>
              <span className="text-2xl font-bold font-mono text-amber-900 mt-1 block">{renewal60}</span>
              <span className="text-[10px] text-amber-600 mt-1 block">İkame araç belirleniyor</span>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <span className="text-[11px] text-blue-700 font-bold block uppercase">T-90 Gün (Planlanan)</span>
              <span className="text-2xl font-bold font-mono text-blue-900 mt-1 block">{renewal90}</span>
              <span className="text-[10px] text-blue-600 mt-1 block">Otomasyon izlemesinde</span>
            </div>
          </div>
        </div>

        {/* Invoice Dispute Categories */}
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
            Fatura İtiraz Kategorileri Dağılımı
          </h3>
          <div className="space-y-2.5">
            {disputeCategories.map(cat => (
              <div key={cat.cat} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-800 font-medium">{cat.cat}</span>
                  <span className="font-mono font-semibold text-slate-700">{cat.count} dosya</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, cat.count * 35)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explicit Disclaimer Banner */}
      <div className="p-3 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong>Demo Veri Bildirimi:</strong> Bu ekrandaki zaman tasarrufu ve analitik oranlar, kurulan prototip iş akışının kurgusal simülasyon hesaplamalarıdır. Gerçek kurumsal performans ölçümü yansıtmaz.
        </span>
      </div>
    </div>
  );
};
