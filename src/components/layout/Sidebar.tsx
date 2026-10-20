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
  isUrgent?: boolean;
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
      title: 'SATIŞ & OPERASYON',
      items: [
        { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
        {
          id: 'tasks',
          label: 'İş Kuyruğu',
          icon: CheckSquare,
          badge: totalOpenTasks
        },
        { id: 'quotations', label: 'Teklifler', icon: FileText },
        {
          id: 'contracts',
          label: 'Sözleşmeler',
          icon: RefreshCw,
          badge: upcomingRenewalsCount
        },
        {
          id: 'documents',
          label: 'Evraklar',
          icon: FolderCheck,
          badge: missingDocRiskScore > 20 ? 1 : undefined,
          isUrgent: missingDocRiskScore > 20
        }
      ]
    },
    {
      title: 'FİLO & FİNANS',
      items: [
        {
          id: 'delivery',
          label: 'Teslimat',
          icon: Truck,
          badge: pendingDeliveries
        },
        {
          id: 'credit',
          label: 'Kredi & KKB',
          icon: ShieldCheck,
          badge: pendingCredit > 0 ? pendingCredit : undefined
        },
        {
          id: 'prebilling',
          label: 'HGS & Ceza',
          icon: Receipt,
          badge: pendingExpenses > 0 ? pendingExpenses : undefined
        },
        {
          id: 'disputes',
          label: 'İtirazlar',
          icon: AlertTriangle,
          badge: openDisputesCount > 0 ? openDisputesCount : undefined
        },
        {
          id: 'customerportal',
          label: 'Müşteri Portalı',
          icon: Globe,
          badge: pendingPortalReqs > 0 ? pendingPortalReqs : undefined
        }
      ]
    },
    {
      title: 'SİSTEM & ANALİTİK',
      items: [
        { id: 'analytics', label: 'Analitik', icon: BarChart3 },
        { id: 'automation', label: 'Otomasyon', icon: Zap },
        { id: 'datasources', label: 'Entegrasyonlar', icon: Database },
        { id: 'settings', label: 'Ayarlar', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
          <Car className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-white text-sm tracking-tight leading-tight truncate">
            SalesOps
          </span>
          <span className="text-[11px] text-slate-400 truncate">
            Filo Operasyonları
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
        {sections.map(section => (
          <div key={section.title} className="space-y-0.5">
            <div className="px-2.5 pb-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              {section.title}
            </div>
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
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
                      className={`ml-2 px-1.5 py-0.2 text-[10px] font-mono rounded font-semibold tabular-nums ${
                        item.isUrgent
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isActive
                          ? 'bg-blue-700 text-blue-100'
                          : 'bg-slate-800 text-slate-400'
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

      {/* Clean User Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
            DY
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">Deniz Yılmaz</div>
            <div className="text-[10px] text-slate-400 truncate">Satış Destek</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
