import React from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  RefreshCw,
  Receipt,
  ArrowRight,
  TrendingUp,
  Plus,
  Truck,
  ShieldCheck,
  Globe,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';

interface OverviewPageProps {
  onOpenNewTask: () => void;
  onOpenNewQuote: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onOpenNewTask,
  onOpenNewQuote
}) => {
  const {
    tasks,
    totalOpenTasks,
    overdueTasksCount,
    waitingApprovalCount,
    monthlyQuotesCount,
    quoteConversionRate,
    upcomingRenewalsCount,
    openDisputesCount,
    avgCompletionDays,
    setActivePage,
    setSelectedTaskId,
    teamMembers,
    contracts,
    deliveryItems,
    creditRecords,
    expenseDiscrepancies,
    customerPortalRequests,
    portfolioMode
  } = useSalesOps();

  const pendingDeliveries = deliveryItems.filter(i => i.overallStatus !== 'Teslim Edildi').length;
  const pendingCredit = creditRecords.filter(
    r => r.evaluationOutcome === 'Komite Onayı Bekliyor' || r.evaluationOutcome === 'Ek Teminat Şartlı'
  ).length;
  const pendingExpenses = expenseDiscrepancies.filter(
    e => e.reconciliationStatus === 'Müşteriye Faturalanacak' || e.reconciliationStatus === 'İnceleme Gerektiriyor'
  ).length;
  const newPortalRequests = customerPortalRequests.filter(
    r => r.status === 'Yeni' || r.status === 'Değerlendiriliyor'
  ).length;

  // Urgent tasks requiring attention (Overdue, SLA breached or High/Critical priority)
  const urgentTasks = tasks
    .filter(
      t =>
        t.status !== 'Tamamlandı' &&
        t.status !== 'İptal' &&
        (t.isOverdue || t.isSlaBreached || t.priority === 'Kritik' || t.waitingDays >= 4)
    )
    .slice(0, 5);

  // Workload by owner
  const ownerWorkload = teamMembers.map(member => {
    const count = tasks.filter(
      t => t.owner === member.name && t.status !== 'Tamamlandı' && t.status !== 'İptal'
    ).length;
    return { ...member, count };
  });

  return (
    <div className="space-y-6">
      {/* 1. Header: Clean Overview Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {portfolioMode === 'B2C' ? 'Filomingo B2C Özeti' : 'Hedef Filo B2B Özeti'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Günlük kritik aksiyonlar, SLA durumları ve filo süreçlerinin anlık durumu.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Görev</span>
          </button>
          <button
            onClick={onOpenNewQuote}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Teklif Oluştur</span>
          </button>
        </div>
      </div>

      {/* 2. Core Operational KPIs (Curated 4-column strip, zero fluff) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overdue & SLA Warnings */}
        <div
          onClick={() => setActivePage('tasks')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-rose-400 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">SLA Aşımı & Acil</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 tabular-nums">
              {overdueTasksCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {totalOpenTasks} açık iş</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
            <span>Acil müdahale listesi</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 2: Waiting Approval */}
        <div
          onClick={() => setActivePage('tasks')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Onay Bekleyenler</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 tabular-nums">
              {waitingApprovalCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">yönetici / risk</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            <span>Onay kuyruğuna git</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 3: Quotations & Conversion */}
        <div
          onClick={() => setActivePage('quotations')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Bu Ayki Teklifler</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {monthlyQuotesCount}
            </span>
            <span className="text-xs text-emerald-600 font-semibold font-mono">
              %{quoteConversionRate} dönüşüm
            </span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-semibold flex items-center gap-1">
            <span>Teklif portföyünü aç</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 4: Upcoming Renewals (T-90) */}
        <div
          onClick={() => setActivePage('contracts')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Yaklaşan Yenilemeler</span>
            <RefreshCw className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600 tabular-nums">
              {upcomingRenewalsCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">T-90 gün vade</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
            <span>Sözleşme takvimine git</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. Operational Process Snapshot (Clean light grid, replacing the dark strip) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Filo Süreç Durumu
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Ort. Çözüm: {avgCompletionDays} gün
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {/* Delivery */}
          <button
            onClick={() => setActivePage('delivery')}
            className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-lg border border-slate-200/80 hover:border-blue-300 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">Teslimat</span>
              <Truck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {pendingDeliveries}
              </span>
              <span className="text-[11px] text-slate-500">araç hatta</span>
            </div>
          </button>

          {/* Credit Check */}
          <button
            onClick={() => setActivePage('credit')}
            className="p-3 bg-slate-50 hover:bg-cyan-50/60 rounded-lg border border-slate-200/80 hover:border-cyan-300 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold text-slate-700 group-hover:text-cyan-700">Kredi & KKB</span>
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {pendingCredit}
              </span>
              <span className="text-[11px] text-slate-500">komite/onay</span>
            </div>
          </button>

          {/* HGS & Toll Prebilling */}
          <button
            onClick={() => setActivePage('prebilling')}
            className="p-3 bg-slate-50 hover:bg-amber-50/60 rounded-lg border border-slate-200/80 hover:border-amber-300 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold text-slate-700 group-hover:text-amber-700">HGS & Ceza</span>
              <Receipt className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {pendingExpenses}
              </span>
              <span className="text-[11px] text-slate-500">mutabakat</span>
            </div>
          </button>

          {/* Customer Portal Requests */}
          <button
            onClick={() => setActivePage('customerportal')}
            className="p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-lg border border-slate-200/80 hover:border-emerald-300 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">Müşteri Portalı</span>
              <Globe className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {newPortalRequests}
              </span>
              <span className="text-[11px] text-slate-500">yeni talep</span>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Main Two-Column Layout: Urgent Tasks & Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Urgent Tasks */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Müdahale Gerektiren Görevler
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                SLA aşımı veya kritik risk taşıyan işler
              </p>
            </div>
            <button
              onClick={() => setActivePage('tasks')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Tüm İşler ({totalOpenTasks})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-1">
            {urgentTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Müdahale gerektiren acil görev bulunmuyor.
              </div>
            ) : (
              urgentTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setActivePage('tasks');
                  }}
                  className="py-3 hover:bg-slate-50/80 rounded-lg px-2 -mx-2 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-700">
                        {task.id}
                      </span>
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                      {task.isOverdue && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-mono">
                          Gecikmiş
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-semibold text-slate-900 truncate">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="text-slate-700 font-medium">{task.customerRef}</span>
                      <span>·</span>
                      <span>{task.owner}</span>
                      <span>·</span>
                      <span className="text-amber-700">Bekleme: {task.waitingDuration}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono block">
                      Termin: {task.dueDate}
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium block truncate max-w-xs mt-0.5">
                      {task.nextAction}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Team Workload & Upcoming Expirations */}
        <div className="space-y-6">
          {/* Team Workload */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Uzman İş Yükü
            </h3>
            <div className="space-y-3">
              {ownerWorkload.map(member => (
                <div key={member.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-800">{member.name}</span>
                    <span className="font-mono text-slate-500 font-semibold tabular-nums">
                      {member.count} iş
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, member.count * 20)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expiring Contracts (T-90) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Yenileme Vadesi (T-90)
              </h3>
              <button
                onClick={() => setActivePage('contracts')}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Tümü</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {contracts
                .filter(c => c.daysUntilRenewal <= 90)
                .slice(0, 3)
                .map(c => (
                  <div
                    key={c.id}
                    onClick={() => setActivePage('contracts')}
                    className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/60 hover:bg-blue-50/40 transition-colors cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-slate-900 block truncate">
                        {c.customerRef}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {c.vehicleCount} Araç · {c.vehicleModel}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-amber-700 font-bold font-mono block">
                        {c.daysUntilRenewal} gün
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {c.endDate}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
