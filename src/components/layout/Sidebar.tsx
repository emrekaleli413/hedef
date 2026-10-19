import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  RefreshCw,
  FolderCheck,
  AlertTriangle,
  Zap,
  BarChart3,
  Database,
  Settings,
  Car,
  Truck,
  ShieldCheck,
  Receipt,
  Globe
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    totalOpenTasks,
    upcomingRenewalsCount,
    missingDocRiskScore,
    openDisputesCount,
    deliveryItems,
    creditRecords,
    expenseDiscrepancies,
    customerPortalRequests
  } = useSalesOps();

  const pendingDeliveries = deliveryItems.filter(i => i.overallStatus !== 'Teslim Edildi').length;
  const pendingCredit = creditRecords.filter(r => r.evaluationOutcome === 'Komite Onayı Bekliyor' || r.evaluationOutcome === 'Ek Teminat Şartlı').length;
  const pendingExpenses = expenseDiscrepancies.filter(e => e.reconciliationStatus === 'Müşteriye Faturalanacak' || e.reconciliationStatus === 'İnceleme Gerektiriyor').length;
  const pendingPortalReqs = customerPortalRequests.filter(r => r.status === 'Yeni' || r.status === 'Değerlendiriliyor').length;

  const sections: NavSection[] = [
    {
      title: 'Operasyonel Çalışma Masası',
      items: [
        { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
        {
          id: 'tasks',
          label: 'İş Kuyruğu',
          icon: CheckSquare,
          badge: totalOpenTasks,
          badgeColor: 'bg-blue-600 text-white'
        },
        { id: 'quotations', label: 'Teklif Yönetimi', icon: FileText },
        {
          id: 'contracts',
          label: 'Sözleşme ve Yenileme',
          icon: RefreshCw,
          badge: upcomingRenewalsCount,
          badgeColor: 'bg-amber-500 text-white'
        },
        {
          id: 'documents',
          label: 'Evrak Kontrolü',
          icon: FolderCheck,
          badge: missingDocRiskScore > 20 ? 1 : undefined,
          badgeColor: 'bg-rose-600 text-white'
        },
        {
          id: 'disputes',
          label: 'Fatura İtirazları',
          icon: AlertTriangle,
          badge: openDisputesCount,
          badgeColor: 'bg-orange-500 text-white'
        }
      ]
    },
    {
      title: 'Otomasyon & İleri Süreçler',
      items: [
        {
          id: 'delivery',
          label: 'Teslimat & Hazırlık',
          icon: Truck,
          badge: pendingDeliveries,
          badgeColor: 'bg-indigo-600 text-white'
        },
        {
          id: 'credit',
          label: 'Finansal İstihbarat & KKB',
          icon: ShieldCheck,
          badge: pendingCredit > 0 ? pendingCredit : undefined,
          badgeColor: 'bg-cyan-600 text-white'
        },
        {
          id: 'prebilling',
          label: 'HGS & Ceza Ön Fatura',
          icon: Receipt,
          badge: pendingExpenses > 0 ? pendingExpenses : undefined,
          badgeColor: 'bg-amber-600 text-white'
        },
        {
          id: 'customerportal',
          label: 'B2B Müşteri Portalı',
          icon: Globe,
          badge: pendingPortalReqs > 0 ? pendingPortalReqs : undefined,
          badgeColor: 'bg-emerald-600 text-white'
        },
        { id: 'automation', label: 'Otomasyon Kuralları', icon: Zap }
      ]
    },
    {
      title: 'Analitik & Sistem',
      items: [
        { id: 'analytics', label: 'Satış Analitiği', icon: BarChart3 },
        { id: 'datasources', label: 'Veri Kaynakları', icon: Database },
        { id: 'settings', label: 'Ayarlar', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
          <Car className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white text-base tracking-tight leading-none">
            SalesOps Intelligence
          </span>
          <span className="text-[11px] text-slate-400 mt-1 font-mono tracking-tight">
            Filo Satış Operasyonları
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {sections.map(section => (
          <div key={section.title} className="space-y-0.5">
            <div className="px-3 pb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {section.title}
            </div>
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-2 px-1.5 py-0.2 text-[10px] font-mono rounded font-semibold ${
                        item.badgeColor || 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User profile & Demo mode indicator */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            DY
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">Deniz Yılmaz</div>
            <div className="text-[11px] text-slate-400 truncate">Kıdemli Satış Destek</div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between px-2 text-[11px] text-slate-400">
          <span>Demo Çalışma Alanı</span>
          <span className="text-emerald-400 font-mono text-[10px]">v2.4 Aktif</span>
        </div>
      </div>
    </aside>
  );
};
