import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Zap,
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
    runAllRulesEvaluation,
    portfolioMode,
    setPortfolioMode
  } = useSalesOps();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'overview':
        return 'Genel Bakış & Operasyonel Özet';
      case 'tasks':
        return 'İş Kuyruğu & Görev Yönetimi';
      case 'quotations':
        return 'Teklif & Zeyilname Yönetimi';
      case 'contracts':
        return 'Sözleşme Takibi & Proaktif Yenileme';
      case 'documents':
        return 'Evrak Kontrolü & Uyumluluk Matrisi';
      case 'disputes':
        return 'Fatura İtirazları & Mutabakat';
      case 'automation':
        return 'Otomasyon Kuralları & Süreç Motoru';
      case 'analytics':
        return 'Satış & Operasyon Analitiği';
      case 'datasources':
        return 'Kurumsal Veri Kaynakları & Entegrasyon';
      case 'settings':
        return 'Sistem Parametreleri & Ayarlar';
      case 'delivery':
        return 'Teslimat & PDI Hazırlık Takibi';
      case 'credit':
        return portfolioMode === 'B2C'
          ? 'Bireysel Findeks & TCKN İstihbaratı (Filomingo)'
          : 'Kurumsal Finansal İstihbarat & KKB';
      case 'prebilling':
        return 'Toplu HGS & Ceza Ön Fatura Eşleştirici';
      case 'customerportal':
        return 'B2B Müşteri Self-Servis Portalı';
      default:
        return 'Operasyon Merkezi';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 shrink-0 z-20">
      {/* Zone 1: Current Page Title & Context */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap truncate">
          {getPageTitle(activePage)}
        </h1>
        <span className="hidden md:inline-flex items-center text-xs text-slate-500 font-mono">
          · {portfolioMode === 'B2C' ? 'Filomingo B2C Modu' : 'Hedef Filo B2B Modu'}
        </span>
      </div>

      {/* Zone 2: Portfolio Mode Switcher (Hedef Filo B2B vs. Filomingo B2C) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setPortfolioMode('B2B')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              portfolioMode === 'B2B'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Kurumsal Filo Kiralama (Hedef Filo Modeli: VKN, Bilanço, DBS, 10-100 Araç)"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">B2B Kurumsal</span>
            <span className="text-[10px] opacity-75 font-mono">(Hedef Filo)</span>
          </button>
          <button
            onClick={() => setPortfolioMode('B2C')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              portfolioMode === 'B2C'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Bireysel & KOBİ Online Kiralama (Filomingo Modeli: TCKN, Findeks, Kredi Kartı Provizyon, 1 Araç)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">B2C Bireysel</span>
            <span className="text-[10px] opacity-75 font-mono">(Filomingo)</span>
          </button>
        </div>

        <button
          onClick={() => runAllRulesEvaluation()}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
          title="Tüm kuralları yeniden değerlendir"
        >
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span>Otomasyonu Tetikle</span>
        </button>
      </div>

      {/* Zone 3: Actions & Notifications */}
      <div className="flex items-center gap-3 shrink-0 relative">
        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kayıt</span>
          </button>

          {showActionMenu && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-30"
              onMouseLeave={() => setShowActionMenu(false)}
            >
              <button
                onClick={() => {
                  setShowActionMenu(false);
                  if (onOpenNewTaskModal) onOpenNewTaskModal();
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Yeni Görev Oluştur</span>
              </button>
              <button
                onClick={() => {
                  setShowActionMenu(false);
                  if (onOpenNewQuoteModal) onOpenNewQuoteModal();
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Yeni Teklif Hazırla</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Bildirimler"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl border border-slate-200 py-2 z-30">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  Süreç Bildirimleri & Loglar
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {notifications.length} bildirim
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
                      className="px-3 py-2 hover:bg-slate-50 flex items-start gap-2.5 text-xs"
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
                        className="text-slate-400 hover:text-slate-600 p-0.5"
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
