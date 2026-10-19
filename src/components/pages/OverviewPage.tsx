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
  ShieldAlert,
  Car,
  ChevronRight,
  Truck,
  ShieldCheck,
  Globe,
  Zap
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
    waitingExternalResponseCount,
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
    portfolioMode,
    setPortfolioMode
  } = useSalesOps();

  const pendingDeliveries = deliveryItems.filter(i => i.overallStatus !== 'Teslim Edildi').length;
  const pendingCredit = creditRecords.filter(r => r.evaluationOutcome === 'Komite Onayı Bekliyor' || r.evaluationOutcome === 'Ek Teminat Şartlı').length;
  const preventedDisputesAmount = expenseDiscrepancies
    .filter(e => e.reconciliationStatus === 'Şirket İçi İptal (İkame/Parkur)')
    .reduce((a, b) => a + b.amountTRY, 0);
  const newPortalRequests = customerPortalRequests.filter(r => r.status === 'Yeni' || r.status === 'Değerlendiriliyor').length;

  // Urgent tasks: Overdue, SLA breached or High/Critical priority waiting
  const urgentTasks = tasks
    .filter(
      t =>
        t.status !== 'Tamamlandı' &&
        t.status !== 'İptal' &&
        (t.isOverdue || t.isSlaBreached || t.priority === 'Kritik' || t.waitingDays >= 4)
    )
    .slice(0, 5);

  // Status distribution
  const statusCounts = {
    Yeni: tasks.filter(t => t.status === 'Yeni').length,
    İşlemde: tasks.filter(t => t.status === 'İşlemde').length,
    'Onay Bekliyor': tasks.filter(t => t.status === 'Onay Bekliyor').length,
    'Dış Yanıt Bekliyor': tasks.filter(t => t.status === 'Dış Yanıt Bekliyor').length,
    Tamamlandı: tasks.filter(t => t.status === 'Tamamlandı').length
  };

  // Workload by owner
  const ownerWorkload = teamMembers.map(member => {
    const count = tasks.filter(
      t => t.owner === member.name && t.status !== 'Tamamlandı' && t.status !== 'İptal'
    ).length;
    return { ...member, count };
  });

  // Key bottlenecks based on B2B vs. B2C portfolio mode
  const bottlenecks = portfolioMode === 'B2C'
    ? [
        {
          title: 'Kredi Kartı Provizyon Blokajları',
          detail: 'Sanal POS çekimlerinde limit yetersizliği nedeniyle provizyon bekleyen bireysel başvurular bulunuyor.',
          severity: 'high'
        },
        {
          title: 'Sürücü Belgesi 2 Yıl Kuralı',
          detail: 'Kasko poliçesi asgari 2 yıl ehliyet şartına takılan başvurularda 2. sürücü veya kefil aranıyor.',
          severity: 'medium'
        },
        {
          title: '14 Gün Yasal Tüketici Cayma Süreci',
          detail: '6502 sayılı kanun kapsamında cayma hakkını kullanan müşterilerin araç iade ve depozito iadesi inceleniyor.',
          severity: 'high'
        }
      ]
    : [
        {
          title: 'Müşteri Dış Yanıt Süresi',
          detail: `${waitingExternalResponseCount} görev müşteri geri bildirimi / ekspertiz onayı bekliyor. Ortalama bekleme: 4.8 gün.`,
          severity: 'high'
        },
        {
          title: 'Zorunlu Sözleşme Evrakları',
          detail: 'Yeni onaylanan 2 sözleşmede güncel imza sirküleri ve KKB onayı eksikliği teslimatı durduruyor.',
          severity: 'medium'
        },
        {
          title: 'Aşırı KM Telematik Mutabakatı',
          detail: '25 araçlık kurye filosunda %35 aşım saptandı; zeyilname onayı gelmeden ek fatura kesilemiyor.',
          severity: 'high'
        }
      ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions with Mode Switcher Banner */}
      <div className={`border rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
        portfolioMode === 'B2C'
          ? 'bg-gradient-to-r from-rose-50/70 via-white to-pink-50/50 border-rose-200'
          : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-lg">
              {portfolioMode === 'B2C'
                ? 'Filomingo Modeli — B2C Bireysel Kiralama Komuta Masası'
                : 'Hedef Filo Modeli — B2B Kurumsal Filo Komuta Masası'}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded font-mono font-semibold border ${
              portfolioMode === 'B2C'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {portfolioMode === 'B2C' ? 'B2C Bireysel & KOBİ' : 'B2B Kurumsal Filo'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            {portfolioMode === 'B2C'
              ? 'Tekil araçlık bireysel abonelikler, TCKN Findeks kredi notu sorguları, kredi kartı provizyon hataları, E-Devlet sürücü belgesi onayları ve 6502 Sayılı Tüketici Kanunu 14 gün cayma süreçleri tek merkezden yönetilmektedir.'
              : 'Kurumsal filo satış destek süreçleri, VKN ve KKB limitleri, sözleşme yenileme pencereleri, toplu HGS mutabakatı ve bekleyen SLA eskalasyonları tek merkezden yönetilmektedir.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Görev Oluştur</span>
          </button>
          {/* Section 16 Priority Feature: Prominent Yeni Teklif Oluştur button */}
          <button
            onClick={onOpenNewQuote}
            className={`flex items-center gap-1.5 px-4 py-2 text-white rounded text-xs font-bold shadow-sm transition-colors ${
              portfolioMode === 'B2C'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{portfolioMode === 'B2C' ? 'Bireysel Teklif Oluştur' : 'Yeni Teklif Oluştur'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
        {/* Open Tasks */}
        <div
          onClick={() => setActivePage('tasks')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Açık Görevler</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {totalOpenTasks}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">işlemde</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 flex items-center gap-1">
            <span>İş kuyruğunu aç</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          onClick={() => setActivePage('tasks')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-rose-400 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Geciken Görevler</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 tabular-nums">
              {overdueTasksCount}
            </span>
            <span className="text-[11px] text-rose-600 font-mono">SLA aşımı</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
            <span>Acil müdahale</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Waiting Approval */}
        <div
          onClick={() => setActivePage('tasks')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-amber-400 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Onay Bekleyenler</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 tabular-nums">
              {waitingApprovalCount}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">yönetici/risk</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 flex items-center gap-1">
            <span>Onay kuyruğu</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Waiting External Responses */}
        <div
          onClick={() => setActivePage('tasks')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-purple-400 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Dış Yanıt Bekleyenler</span>
            <ShieldAlert className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-700 tabular-nums">
              {waitingExternalResponseCount}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">müşteri/servis</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-600 flex items-center gap-1">
            <span>Takip listesi</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Monthly Quotes */}
        <div
          onClick={() => setActivePage('quotations')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Hazırlanan Teklifler</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {monthlyQuotesCount}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">bu ay</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 flex items-center gap-1">
            <span>Teklif portföyü</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Conversion Rate */}
        <div
          onClick={() => setActivePage('analytics')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-emerald-400 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Teklif Dönüşüm Oranı</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 tabular-nums">
              %{quoteConversionRate}
            </span>
            <span className="text-[11px] text-emerald-700 font-mono">kabul/onay</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Sektör ortalaması: %38
          </div>
        </div>

        {/* Renewals Approaching */}
        <div
          onClick={() => setActivePage('contracts')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-amber-400 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Yaklaşan Yenilemeler</span>
            <RefreshCw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 tabular-nums">
              {upcomingRenewalsCount}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">T-90 gün</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 flex items-center gap-1">
            <span>Sözleşme takibi</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Open Invoice Disputes */}
        <div
          onClick={() => setActivePage('disputes')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-orange-400 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Açık Fatura İtirazları</span>
            <Receipt className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-600 tabular-nums">
              {openDisputesCount}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">mutabakat</span>
          </div>
          <div className="mt-2 text-[11px] text-orange-600 flex items-center gap-1">
            <span>İtirazları yönet</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Avg Completion Time */}
        <div
          onClick={() => setActivePage('analytics')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Ort. Çözüm Süresi</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {avgCompletionDays}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">iş günü</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            Otomasyon öncesi: 6.4 gün
          </div>
        </div>
      </div>

      {/* Satış Destek Otomasyon Merkezleri Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-lg p-5 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-850 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Satış Destek Süreç Otomasyon Merkezleri
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            4 Entegre Akıllı Modül Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-3.5">
          {/* Module 1: Delivery */}
          <div
            onClick={() => setActivePage('delivery')}
            className="p-3.5 rounded-md bg-slate-850/80 border border-slate-750 hover:border-blue-500 hover:bg-slate-800 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-400 transition-colors">
                  Teslimat & PDI Hazırlık
                </span>
                <Truck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-white font-mono">
                  {pendingDeliveries}
                </span>
                <span className="text-[11px] text-slate-400">sipariş hatta</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Ruhsat, kasko, telematik montajı ve müşteri SMS canlı takip bağlantısı.
              </p>
            </div>
            <div className="mt-3 text-[11px] text-blue-400 flex items-center gap-1 font-semibold">
              <span>Süreci Yönet</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Module 2: Credit */}
          <div
            onClick={() => setActivePage('credit')}
            className="p-3.5 rounded-md bg-slate-850/80 border border-slate-750 hover:border-cyan-500 hover:bg-slate-800 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">
                  Finansal İstihbarat & KKB
                </span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-white font-mono">
                  {pendingCredit}
                </span>
                <span className="text-[11px] text-slate-400">komite/teminat</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Anlık VKN sorgulama, DBS/teminat mektubu önerisi ve Fast-track onay motoru.
              </p>
            </div>
            <div className="mt-3 text-[11px] text-cyan-400 flex items-center gap-1 font-semibold">
              <span>Risk & Limit Paneli</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Module 3: Pre-billing */}
          <div
            onClick={() => setActivePage('prebilling')}
            className="p-3.5 rounded-md bg-slate-850/80 border border-slate-750 hover:border-amber-500 hover:bg-slate-800 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-amber-400 transition-colors">
                  HGS & Ceza Ön Fatura
                </span>
                <Receipt className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  ₺{preventedDisputesAmount.toLocaleString('tr-TR')}
                </span>
                <span className="text-[10px] text-slate-400">önlenen itiraz</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Fatura öncesi zimmet kontrolü; ikame/servis giderlerini otomatik filtreler.
              </p>
            </div>
            <div className="mt-3 text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
              <span>Mutabakat Masası</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Module 4: Customer Portal */}
          <div
            onClick={() => setActivePage('customerportal')}
            className="p-3.5 rounded-md bg-slate-850/80 border border-slate-750 hover:border-emerald-500 hover:bg-slate-800 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-emerald-400 transition-colors">
                  B2B Müşteri Portalı
                </span>
                <Globe className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-white font-mono">
                  {newPortalRequests}
                </span>
                <span className="text-[11px] text-slate-400">yeni talep</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Ek araç, KM artırımı ve iade talepleri doğrudan iş kuyruğuna aktarılır.
              </p>
            </div>
            <div className="mt-3 text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <span>Talep Masası & Simülatör</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Operational Split: Urgent Tasks + Workload/Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Tasks Requiring Immediate Attention */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Öncelikli & Müdahale Gerektiren Görevler
              </h2>
              <p className="text-xs text-slate-500">
                SLA aşımı riski bulunan veya kritik öncelikli operasyonel işler
              </p>
            </div>
            <button
              onClick={() => setActivePage('tasks')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Tümünü Gör ({totalOpenTasks})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {urgentTasks.map(task => (
              <div
                key={task.id}
                onClick={() => {
                  setSelectedTaskId(task.id);
                  setActivePage('tasks');
                }}
                className="py-3 hover:bg-slate-50 rounded px-2 -mx-2 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-700">
                      {task.id}
                    </span>
                    <span className="text-slate-300">·</span>
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
                    <span>Sorumlu: {task.owner}</span>
                    <span>·</span>
                    <span className="text-amber-700">Bekleme: {task.waitingDuration}</span>
                  </div>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block font-mono">
                    Termin: {task.dueDate}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600 truncate block max-w-xs">
                    {task.nextAction}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Workload by Owner & Current Bottlenecks */}
        <div className="space-y-6">
          {/* Workload by Owner */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Uzman Başına İş Yükü Dağılımı
            </h3>
            <div className="space-y-2.5">
              {ownerWorkload.map(member => (
                <div key={member.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-800">{member.name}</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {member.count} aktif görev
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, member.count * 18)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Bottlenecks */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Operasyonel Darboğazlar
              </h3>
            </div>
            <div className="space-y-3">
              {bottlenecks.map((b, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1"
                >
                  <div className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>{b.title}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        b.severity === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.severity === 'high' ? 'Kritik SLA' : 'İzleniyor'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{b.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution & Upcoming Renewals Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Görev Statü Dağılımı
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div
                key={status}
                className="p-3 bg-slate-50 border border-slate-100 rounded flex flex-col justify-between"
              >
                <span className="text-[11px] text-slate-600">{status}</span>
                <span className="text-xl font-bold text-slate-900 mt-1 tabular-nums font-mono">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Contract Expiration Notice */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Önümüzdeki 90 Gün Biten Sözleşmeler
              </h3>
              <button
                onClick={() => setActivePage('contracts')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Yenilemeleri Gör</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Erken teklif sunulmayan sözleşmelerde müşteri kaybı riski oluşur. Otomasyon kuralları T-90 günü geldiğinde proaktif görev önerir.
            </p>
            <div className="space-y-2">
              {contracts
                .filter(c => c.daysUntilRenewal <= 90)
                .slice(0, 3)
                .map(c => (
                  <div
                    key={c.id}
                    className="p-2 border border-slate-200 rounded bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{c.customerRef}</span>
                      <span className="text-[11px] text-slate-500 block">
                        {c.vehicleCount} Araç · {c.vehicleModel}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-700 font-bold font-mono">
                        {c.daysUntilRenewal} gün kaldı
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Bitiş: {c.endDate}
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
