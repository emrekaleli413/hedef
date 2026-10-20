import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  Search,
  Building2,
  Zap,
  BellRing,
  Shield,
  Layers,
  Wrench,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { ContractComplianceAlert } from '../../types';

interface ComplianceCalendarViewProps {
  onOpenGenerator: (contractId: string) => void;
}

export const ComplianceCalendarView: React.FC<ComplianceCalendarViewProps> = ({ onOpenGenerator }) => {
  const { complianceAlerts, resolveComplianceAlert } = useSalesOps();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterParty, setFilterParty] = useState<'all' | 'customer' | 'supplier'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const alertTypeLabels: Record<ContractComplianceAlert['alertType'], string> = {
    guarantee_expiry: 'Teminat Mektubu Vadesi',
    interim_km_audit: 'Ara KM Denetimi & Aşım Sinyali',
    option_deadline: 'Opsiyon Bildirim Son Tarihi',
    contract_expiry: 'Hukuki Yetki / Sözleşme Bitiş',
    maintenance_sla: 'Tedarikçi SLA & Bakım Taahhüdü',
    indexation_notice: 'TÜFE/ÜFE Endeksleme & Kira Tebliği'
  };

  const filteredAlerts = complianceAlerts.filter(alert => {
    if (!showResolved && alert.resolved) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterParty !== 'all' && (alert.partyType || 'customer') !== filterParty) return false;

    if (filterCategory === 'guarantee' && alert.alertType !== 'guarantee_expiry') return false;
    if (filterCategory === 'mileage' && alert.alertType !== 'interim_km_audit') return false;
    if (filterCategory === 'sla' && alert.alertType !== 'maintenance_sla') return false;
    if (filterCategory === 'indexation' && alert.alertType !== 'indexation_notice') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(q) ||
        alert.customerTitle.toLowerCase().includes(q) ||
        alert.contractId.toLowerCase().includes(q) ||
        alert.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = complianceAlerts.filter(a => !a.resolved && a.severity === 'critical').length;
  const warningCount = complianceAlerts.filter(a => !a.resolved && a.severity === 'warning').length;
  const lowCount = complianceAlerts.filter(a => !a.resolved && a.severity === 'low').length;
  const supplierAlertCount = complianceAlerts.filter(a => !a.resolved && a.partyType === 'supplier').length;

  return (
    <div className="space-y-4">
      {/* Top Banner with Agiloft / Ironclad Benchmark Badge */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Kritik Süre & Sözleşme Taahhüt Takvimi
            </h2>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
              Agiloft & Ironclad CLM Modeli
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sözleşme sonrası periyodik ara denetimler, banka teminatları, imza sirküleri geçerlilikleri ve tedarikçi SLA yükümlülükleri
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md font-mono border border-slate-200">
            Aktif Yükümlülük: {complianceAlerts.filter(a => !a.resolved).length}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-rose-900 block">Kritik Yükümlülük</span>
              <span className="text-[10px] text-rose-700">Teminat & Hukuk Blokajı</span>
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-rose-800">{criticalCount}</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-900 block">Operasyonel Uyarı</span>
              <span className="text-[10px] text-amber-700">KM Aşım & Erken Sinyal</span>
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-amber-800">{warningCount}</span>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-900 block">Tedarikçi SLA</span>
              <span className="text-[10px] text-indigo-700">Lastik, Servis & Kasko</span>
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-indigo-800">{supplierAlertCount}</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-900 block">Planlı Denetim</span>
              <span className="text-[10px] text-blue-700">Bakım & Muayene Ajandası</span>
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-blue-800">{lowCount}</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Alarm, müşteri, tedarikçi veya sözleşme no ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Party Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              onClick={() => setFilterParty('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filterParty === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tüm Taraflar
            </button>
            <button
              onClick={() => setFilterParty('customer')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filterParty === 'customer' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Müşteri
            </button>
            <button
              onClick={() => setFilterParty('supplier')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filterParty === 'supplier' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tedarikçi ({supplierAlertCount})
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">Tüm Yükümlülük Türleri</option>
            <option value="guarantee">Banka Teminat Mektubu</option>
            <option value="mileage">Ara Kilometre Denetimi</option>
            <option value="sla">Tedarikçi SLA / Bakım</option>
            <option value="indexation">TÜFE/ÜFE Kira Revizyonu</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={e => setShowResolved(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[11px]">Çözümlenenleri göster</span>
          </label>
        </div>
      </div>

      {/* Alerts Timeline List */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => {
          const severityConfig = {
            critical: {
              badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
              borderLeft: 'border-l-4 border-l-rose-500',
              badgeText: 'Kritik Seviye'
            },
            warning: {
              badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
              borderLeft: 'border-l-4 border-l-amber-500',
              badgeText: 'Uyarı'
            },
            low: {
              badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
              borderLeft: 'border-l-4 border-l-blue-500',
              badgeText: 'Bilgilendirme'
            }
          }[alert.severity];

          const isSupplier = alert.partyType === 'supplier';

          return (
            <div
              key={alert.id}
              className={`bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-shadow ${severityConfig.borderLeft} ${
                alert.resolved ? 'opacity-60 bg-slate-50' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityConfig.badgeBg}`}>
                      {severityConfig.badgeText}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      isSupplier ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {isSupplier ? 'Tedarikçi Taahhüdü' : 'Müşteri Taahhüdü'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-semibold">
                      {alert.contractId}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{alert.customerTitle}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                      {alertTypeLabels[alert.alertType] || alert.alertType}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 pt-0.5">
                    {alert.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {alert.description}
                  </p>

                  {/* Penalty / Risk Callout (Agiloft model) */}
                  {alert.penaltyOrRisk && (
                    <div className="p-2.5 bg-rose-50/70 border border-rose-200/80 rounded text-xs text-rose-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-rose-950">Hukuki / Mali Risk (Agiloft Kuralı): </strong>
                        <span>{alert.penaltyOrRisk}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded text-xs text-slate-800">
                    <span className="font-semibold text-slate-900">Gerekli Satış Destek & Operasyon Aksiyonu: </span>
                    {alert.actionRequired}
                  </div>
                </div>

                {/* Right Side / Deadlines and Actions */}
                <div className="flex flex-col items-end justify-between gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Vade / Son Tarih</span>
                    <span className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {alert.dueDate}
                    </span>
                    <span className={`text-[11px] font-semibold block mt-0.5 ${
                      alert.daysRemaining <= 15 ? 'text-rose-700 font-bold' : 'text-amber-700'
                    }`}>
                      Kalan Süre: {alert.daysRemaining} Gün
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!alert.resolved ? (
                      <button
                        onClick={() => resolveComplianceAlert(alert.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Taahhüt Sağlandı</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold px-2 py-1 bg-emerald-50 rounded">
                        <CheckCircle2 className="w-4 h-4" />
                        Tamamlandı
                      </span>
                    )}

                    {!isSupplier && (
                      <button
                        onClick={() => onOpenGenerator(alert.contractId)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Teklif / Zeyil Motoru</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-400 text-xs">
          Arama kriterine uygun aktif yükümlülük veya taahhüt kaydı bulunamadı.
        </div>
      )}
    </div>
  );
};

