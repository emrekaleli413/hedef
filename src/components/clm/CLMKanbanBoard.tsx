import React, { useState } from 'react';
import {
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Building2,
  Car,
  Calendar,
  Layers,
  ChevronRight,
  Zap,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { Contract, CLMStage } from '../../types';

interface CLMKanbanBoardProps {
  onOpenGenerator: (contractId: string) => void;
}

const STAGES: {
  key: CLMStage;
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  headerBg: string;
  description: string;
}[] = [
  {
    key: 'draft',
    label: 'Taslak Hazırlık',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    borderColor: 'border-slate-300',
    headerBg: 'bg-slate-50',
    description: 'Şartlar ve kiralama parametreleri taslak aşamasında'
  },
  {
    key: 'internal_review',
    label: 'Hukuk & Finans İnceleme',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    borderColor: 'border-amber-300',
    headerBg: 'bg-amber-50/60',
    description: 'Kredi komitesi, teminat mektubu & özel kloz incelemesi'
  },
  {
    key: 'signature_pending',
    label: 'İmza & KEP Onayı',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    borderColor: 'border-indigo-300',
    headerBg: 'bg-indigo-50/60',
    description: 'Islak imza veya KEP/E-İmza mutabakatı bekleniyor'
  },
  {
    key: 'active_in_force',
    label: 'Yürürlükte (Aktif Filo)',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    headerBg: 'bg-emerald-50/60',
    description: 'Araçlar teslim edilmiş, operasyonel kira aktif'
  },
  {
    key: 'addendum_in_review',
    label: 'Zeyilname Sürecinde',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    borderColor: 'border-purple-300',
    headerBg: 'bg-purple-50/60',
    description: 'KM aşımı, erken iade veya araç değişikliği zeyili'
  },
  {
    key: 'renewal_pending',
    label: 'Yenileme Bekliyor',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    borderColor: 'border-rose-300',
    headerBg: 'bg-rose-50/60',
    description: 'T-90 gün penceresinde dönem sonu yenileme görüşmeleri'
  }
];

export const CLMKanbanBoard: React.FC<CLMKanbanBoardProps> = ({ onOpenGenerator }) => {
  const { contracts, updateContractCLMStage } = useSalesOps();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'B2B' | 'B2C'>('all');

  // Next stage transition mapper
  const getNextStage = (current: CLMStage): CLMStage | null => {
    switch (current) {
      case 'draft':
        return 'internal_review';
      case 'internal_review':
        return 'signature_pending';
      case 'signature_pending':
        return 'active_in_force';
      case 'active_in_force':
        return 'addendum_in_review';
      case 'addendum_in_review':
        return 'active_in_force';
      case 'renewal_pending':
        return 'active_in_force';
      default:
        return null;
    }
  };

  const getStageActionLabel = (current: CLMStage): string => {
    switch (current) {
      case 'draft':
        return 'İncelemeye Gönder';
      case 'internal_review':
        return 'İmzaya Aç (KEP)';
      case 'signature_pending':
        return 'Yürürlüğe Al';
      case 'active_in_force':
        return 'Zeyilname Başlat';
      case 'addendum_in_review':
        return 'Zeyili Onayla & Yürüt';
      case 'renewal_pending':
        return 'Yenilendi Olarak İşle';
      default:
        return 'Aşama İlerlet';
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (selectedSegment !== 'all' && c.segment && c.segment !== selectedSegment) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.customerRef.toLowerCase().includes(q) ||
        c.vehicleModel.toLowerCase().includes(q) ||
        c.plate.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate totals
  const totalVolume = filteredContracts.reduce((acc, c) => acc + c.monthlyRentAmount, 0);

  return (
    <div className="space-y-4">
      {/* Metrics & Filter Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Sözleşme no, müşteri, araç veya plaka ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              onClick={() => setSelectedSegment('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                selectedSegment === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tümü ({contracts.length})
            </button>
            <button
              onClick={() => setSelectedSegment('B2B')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                selectedSegment === 'B2B' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              B2B Filo
            </button>
            <button
              onClick={() => setSelectedSegment('B2C')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                selectedSegment === 'B2C' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              B2C Bireysel
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Aktif Portföy Hacmi</span>
            <span className="text-xs font-bold text-slate-900 font-mono">
              ₺{totalVolume.toLocaleString('tr-TR')} / ay
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageContracts = filteredContracts.filter(c => {
            const stageMatch = c.clmStage || 'active_in_force';
            return stageMatch === stage.key;
          });
          const stageTotalMonthly = stageContracts.reduce((sum, c) => sum + c.monthlyRentAmount, 0);

          return (
            <div
              key={stage.key}
              className="bg-slate-50/70 border border-slate-200 rounded-lg flex flex-col min-w-[260px] shadow-2xs"
            >
              {/* Column Header */}
              <div className={`p-2.5 border-b border-slate-200 rounded-t-lg ${stage.headerBg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{stage.label}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.badgeBg} ${stage.badgeText}`}>
                    {stageContracts.length}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="line-clamp-1">{stage.description}</span>
                </div>
                <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono font-medium text-slate-700">
                  <span>Toplam Hacim:</span>
                  <span>₺{stageTotalMonthly.toLocaleString('tr-TR')}</span>
                </div>
              </div>

              {/* Column Cards */}
              <div className="p-2 space-y-2 min-h-[360px]">
                {stageContracts.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-[11px] border border-dashed border-slate-200 rounded">
                    Bu aşamada sözleşme yok
                  </div>
                ) : (
                  stageContracts.map(contract => {
                    const nextStage = getNextStage(contract.clmStage || 'active_in_force');
                    const actionLabel = getStageActionLabel(contract.clmStage || 'active_in_force');

                    return (
                      <div
                        key={contract.id}
                        className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col gap-2"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
                              {contract.id}
                            </span>
                            {contract.segment && (
                              <span className="ml-1 text-[9px] font-semibold text-slate-600 bg-slate-100 px-1 py-0.5 rounded">
                                {contract.segment}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-900">
                            ₺{contract.monthlyRentAmount.toLocaleString('tr-TR')}
                            <span className="text-[9px] font-normal text-slate-400">/ay</span>
                          </span>
                        </div>

                        {/* Customer & Vehicle Info */}
                        <div>
                          <h4 className="text-xs font-semibold text-slate-900 line-clamp-1" title={contract.customerRef}>
                            {contract.customerRef}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1 mt-0.5">
                            <Car className="w-3 h-3 text-slate-400 shrink-0" />
                            {contract.vehicleModel}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {contract.plate} • {contract.vehicleCount} Araç
                          </p>
                        </div>

                        {/* Next Action / Operational Status */}
                        {contract.nextAction && (
                          <div className="bg-slate-50 border border-slate-100 p-1.5 rounded text-[10px] text-slate-600 line-clamp-2">
                            <span className="font-semibold text-slate-700">Aksiyon: </span>
                            {contract.nextAction}
                          </div>
                        )}

                        {/* Metric Bar */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Bitiş: {contract.endDate}
                          </span>
                          {contract.projectedOverKmPercent > 0 && (
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium text-[9px]">
                              KM: +%{contract.projectedOverKmPercent}
                            </span>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="pt-1 flex items-center gap-1.5">
                          {nextStage && (
                            <button
                              onClick={() => updateContractCLMStage(contract.id, nextStage)}
                              className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-[10px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                              title={`${actionLabel} aşamasına geçir`}
                            >
                              <span>{actionLabel}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => onOpenGenerator(contract.id)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded border border-slate-200"
                            title="Teklif / Zeyilname Motorunu Aç"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
