import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Info,
  CheckCircle,
  AlertCircle,
  X,
  Building2,
  UserCheck
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';

interface TopBarProps {
  onOpenNewTaskModal?: () => void;
  onOpenNewQuoteModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenNewTaskModal,
  onOpenNewQuoteModal
}) => {
  const {
    activePage,
    notifications,
    dismissNotification,
    portfolioMode,
    setPortfolioMode
  } = useSalesOps();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'overview':
        return 'Genel Bakış';
      case 'tasks':
        return 'İş Kuyruğu';
      case 'quotations':
        return 'Teklif Yönetimi';
      case 'contracts':
        return 'Sözleşmeler';
      case 'documents':
        return 'Evrak Kontrolü';
      case 'disputes':
        return 'Fatura İtirazları';
      case 'delivery':
        return 'Teslimat Takibi';
      case 'credit':
        return portfolioMode === 'B2C'
          ? 'Bireysel İstihbarat & Findeks'
          : 'Finansal İstihbarat & KKB';
      case 'prebilling':
        return 'HGS & Ceza Ön Fatura';
      case 'customerportal':
        return 'Müşteri Portalı';
      case 'automation':
        return 'Otomasyon Kuralları';
      case 'analytics':
        return 'Satış Analitiği';
      case 'datasources':
        return 'Veri Kaynakları';
      case 'settings':
        return 'Sistem Ayarları';
      default:
        return 'Operasyon Masası';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-6 shrink-0 z-20">
      {/* Zone 1: Clean Breadcrumb & Page Title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Operasyon /
        </span>
        <h1 className="text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap truncate">
          {getPageTitle(activePage)}
        </h1>
      </div>

      {/* Zone 2: Streamlined Portfolio Mode Switcher (B2B vs B2C) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setPortfolioMode('B2B')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              portfolioMode === 'B2B'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Hedef Filo B2B Kurumsal Kiralama"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hedef Filo B2B</span>
          </button>
          <button
            onClick={() => setPortfolioMode('B2C')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              portfolioMode === 'B2C'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Filomingo B2C Bireysel Kiralama"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Filomingo B2C</span>
          </button>
        </div>
      </div>

      {/* Zone 3: Actions & Notifications */}
      <div className="flex items-center gap-2 shrink-0 relative">
        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Kayıt</span>
          </button>

          {showActionMenu && (
            <div
              className="absolute right-0 mt-1.5 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30"
              onMouseLeave={() => setShowActionMenu(false)}
            >
              <button
                onClick={() => {
                  setShowActionMenu(false);
                  if (onOpenNewTaskModal) onOpenNewTaskModal();
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Yeni Görev</span>
              </button>
              <button
                onClick={() => {
                  setShowActionMenu(false);
                  if (onOpenNewQuoteModal) onOpenNewQuoteModal();
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Yeni Teklif</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Bildirimler"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-30">
              <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  Bildirimler
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {notifications.length}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Yeni bildirim bulunmuyor.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className="px-3.5 py-2 hover:bg-slate-50 flex items-start gap-2.5 text-xs"
                    >
                      {n.type === 'warning' ? (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : n.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 leading-snug">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                          {n.time}
                        </span>
                      </div>
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
