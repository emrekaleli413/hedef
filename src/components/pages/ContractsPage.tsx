import React, { useState } from 'react';
import {
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Car,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  BookOpen,
  FolderArchive,
  BellRing,
  ListFilter,
  Building2,
  Eye,
  FileCheck2
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { Contract, RenewalStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { AutomatedQuotationGeneratorModal } from '../modals/AutomatedQuotationGeneratorModal';
import { CLMKanbanBoard } from '../clm/CLMKanbanBoard';
import { ClauseLibraryView } from '../clm/ClauseLibraryView';
import { ContractVaultView } from '../clm/ContractVaultView';
import { ComplianceCalendarView } from '../clm/ComplianceCalendarView';
import { SupplierContractsTab } from '../clm/SupplierContractsTab';
import { ContractDetailDrawer } from '../clm/ContractDetailDrawer';
import { PaperworkDocumentViewerModal } from '../modals/PaperworkDocumentViewerModal';

export const ContractsPage: React.FC = () => {
  const {
    contracts,
    createRenewalTaskForContract,
    settings,
    setActivePage,
    setSelectedTaskId,
    clauseTemplates,
    vaultDocuments,
    complianceAlerts,
    supplierContracts
  } = useSalesOps();

  const [activeTab, setActiveTab] = useState<'portfolio' | 'suppliers' | 'clm_kanban' | 'clause_library' | 'contract_vault' | 'compliance_calendar'>('portfolio');
  const [searchQuery, setSearchQuery] = useState('');
  const [renewalFilter, setRenewalFilter] = useState<'all' | '30' | '60' | '90' | 'overdue'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Automated Quotation Generator Modal state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorContractId, setGeneratorContractId] = useState<string | undefined>(undefined);

  // Contract Detail Drawer state
  const [selectedContractForDrawer, setSelectedContractForDrawer] = useState<Contract | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = (c: Contract) => {
    setSelectedContractForDrawer(c);
    setIsDrawerOpen(true);
  };

  // Paperwork modal state for customer contracts
  const [paperworkContract, setPaperworkContract] = useState<Contract | null>(null);

  const handleOpenGenerator = (contractId?: string) => {
    setGeneratorContractId(contractId);
    setIsGeneratorOpen(true);
  };

  const filteredContracts = contracts.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.id.toLowerCase().includes(q) ||
        c.customerRef.toLowerCase().includes(q) ||
        c.vehicleModel.toLowerCase().includes(q) ||
        c.plate.toLowerCase().includes(q) ||
        c.assignedOwner.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== 'all' && c.renewalStatus !== statusFilter) return false;

    if (renewalFilter === '30' && c.daysUntilRenewal > 30) return false;
    if (renewalFilter === '60' && c.daysUntilRenewal > 60) return false;
    if (renewalFilter === '90' && c.daysUntilRenewal > 90) return false;
    if (renewalFilter === 'overdue' && c.daysUntilRenewal > 0) return false;

    return true;
  });

  const handleCreateRenewalTask = (contractId: string) => {
    const res = createRenewalTaskForContract(contractId);
    if (res.success) {
      setActionFeedback({ message: res.message, type: 'success' });
    } else {
      setActionFeedback({ message: res.message, type: 'error' });
    }
    setTimeout(() => setActionFeedback(null), 5000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Sözleşme Portföyü & Proaktif Yenileme Takibi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sözleşme bitiş pencereleri (T-90/60/30), aşırı KM odometre takibi ve mükerrerlik korumalı yenileme görev yönetimi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded font-mono">
            Yenileme Eşiği: T-{settings.renewalWarningDays} Gün
          </span>
        </div>
      </div>

      {/* Action feedback toast */}
      {actionFeedback && (
        <div
          className={`p-3 rounded text-xs flex items-center justify-between ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{actionFeedback.message}</span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-500 hover:text-slate-800">
            ✕
          </button>
        </div>
      )}

      {/* CLM Tab Navigation */}
      <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'portfolio'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Sözleşme Portföyü & Liste</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            activeTab === 'portfolio' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {contracts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'suppliers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tedarikçi Sözleşmeleri</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            activeTab === 'suppliers' ? 'bg-blue-700 text-white' : 'bg-indigo-50 text-indigo-700'
          }`}>
            {supplierContracts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('clm_kanban')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'clm_kanban'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Yaşam Döngüsü Kanbanı (CLM)</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            activeTab === 'clm_kanban' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'
          }`}>
            6 Aşama
          </span>
        </button>

        <button
          onClick={() => setActiveTab('clause_library')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'clause_library'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Madde & Zeyil Kütüphanesi</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            activeTab === 'clause_library' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {clauseTemplates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('contract_vault')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'contract_vault'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>Doküman Kasası & Ek Evraklar</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            activeTab === 'contract_vault' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {vaultDocuments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('compliance_calendar')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'compliance_calendar'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Kritik Süre & Alarm Takvimi</span>
          {complianceAlerts.filter(a => !a.resolved).length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'compliance_calendar' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              {complianceAlerts.filter(a => !a.resolved).length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'portfolio' && (
        <>
      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Sözleşme no, plaka, müşteri adı veya araç ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Renewal Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-xs">
            <button
              onClick={() => setRenewalFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                renewalFilter === 'all'
                  ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tümü ({contracts.length})
            </button>
            <button
              onClick={() => setRenewalFilter('90')}
              className={`px-2.5 py-1 rounded transition-colors ${
                renewalFilter === '90'
                  ? 'bg-white font-semibold text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              T-90 Gün
            </button>
            <button
              onClick={() => setRenewalFilter('60')}
              className={`px-2.5 py-1 rounded transition-colors ${
                renewalFilter === '60'
                  ? 'bg-white font-semibold text-orange-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              T-60 Gün
            </button>
            <button
              onClick={() => setRenewalFilter('30')}
              className={`px-2.5 py-1 rounded transition-colors ${
                renewalFilter === '30'
                  ? 'bg-white font-semibold text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              T-30 Gün
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="Yenileme Bekliyor">Yenileme Bekliyor</option>
            <option value="Görüşülüyor">Görüşülüyor</option>
            <option value="Teklif İletildi">Teklif İletildi</option>
            <option value="Yenilendi">Yenilendi</option>
            <option value="İade Edilecek">İade Edilecek</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 whitespace-nowrap">Sözleşme ID</th>
                <th className="py-3 px-3 min-w-[190px]">Müşteri & Filo</th>
                <th className="py-3 px-3 whitespace-nowrap">Plaka / Model</th>
                <th className="py-3 px-3 whitespace-nowrap">Bitiş Tarihi</th>
                <th className="py-3 px-3 whitespace-nowrap">Kalan Süre</th>
                <th className="py-3 px-3 whitespace-nowrap">Fesih İhbarı</th>
                <th className="py-3 px-3 whitespace-nowrap">KM Projeksiyonu</th>
                <th className="py-3 px-3 whitespace-nowrap">Sorumlu</th>
                <th className="py-3 px-3 whitespace-nowrap">Entegrasyon</th>
                <th className="py-3 px-3 whitespace-nowrap">Yenileme Durumu</th>
                <th className="py-3 px-3 min-w-[160px]">Sonraki Aksiyon</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400 text-xs">
                    Kriterlere uygun sözleşme bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredContracts.map(c => {
                  const isExpiringSoon = c.daysUntilRenewal <= 90;
                  const isCriticalExpiration = c.daysUntilRenewal <= 30;
                  const hasKmOverage = c.projectedOverKmPercent >= 15;
                  const noticeDays = c.terminationNoticeDays || 60;
                  const isWithinNoticeWindow = c.daysUntilRenewal <= noticeDays && c.daysUntilRenewal > 0;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleOpenDrawer(c)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {c.id}
                      </td>

                      {/* Customer & Fleet */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {c.customerRef}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex flex-wrap items-center gap-1">
                          <span>{c.vehicleCount} Araç</span>
                          <span>·</span>
                          {c.tckn ? (
                            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1 rounded">
                              TCKN: {c.tckn}
                            </span>
                          ) : (
                            <span>{c.customerCode}</span>
                          )}
                          {c.paymentMethod && (
                            <span className="text-[10px] text-slate-600 bg-slate-100 px-1 rounded">
                              {c.paymentMethod}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Plate / Model */}
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-medium">{c.vehicleModel}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.plate}</div>
                      </td>

                      {/* End Date */}
                      <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap text-slate-600">
                        {c.endDate}
                      </td>

                      {/* Days until renewal */}
                      <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            isCriticalExpiration
                              ? 'text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded'
                              : isExpiringSoon
                              ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded'
                              : 'text-slate-600'
                          }`}
                        >
                          {c.daysUntilRenewal} gün
                        </span>
                      </td>

                      {/* Termination Notice Period & Warning */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-mono text-[11px] text-slate-700">
                          {noticeDays} Gün Öncesi
                        </div>
                        {isWithinNoticeWindow ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded inline-flex items-center gap-0.5 mt-0.5">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            İhbar Penceresi
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Standart Kural
                          </span>
                        )}
                      </td>

                      {/* Km projection & Overage warning */}
                      <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap">
                        <div className="text-slate-700">
                          {c.currentOdometerKm.toLocaleString('tr-TR')} / {c.contractLimitKm.toLocaleString('tr-TR')} KM
                        </div>
                        {hasKmOverage ? (
                          <span className="text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 px-1 rounded block mt-0.5">
                            ▲ +%{c.projectedOverKmPercent.toFixed(1)} Aşırı KM
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 block mt-0.5">
                            Nominal KM
                          </span>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-slate-800">{c.assignedOwner}</span>
                      </td>

                      {/* External Integrations (Sofico / Paperwork) */}
                      <td className="py-2.5 px-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <span
                            title={`Sofico ERP: ${c.soficoContractId || 'SOF-KNT'}`}
                            className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-mono font-bold"
                          >
                            SM
                          </span>
                          <button
                            type="button"
                            onClick={() => setPaperworkContract(c)}
                            title="Paperwork Belge Arşivinde Aç"
                            className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold transition-colors flex items-center gap-0.5"
                          >
                            <span>PW:{c.paperworkDocCount || 4}</span>
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge status={c.renewalStatus} />
                      </td>

                      {/* Next Action */}
                      <td className="py-2.5 px-3">
                        <div className="text-slate-600 text-[11px] truncate max-w-xs" title={c.nextAction}>
                          {c.nextAction}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(c)}
                          className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                          title="Detay Çekmecesini Aç"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Detay</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setGeneratorContractId(c.id);
                            setIsGeneratorOpen(true);
                          }}
                          className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                          title="Bu sözleşme için otomatik teklif üret"
                        >
                          Teklif Üret
                        </button>

                        {c.hasRenewalTask ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (c.renewalTaskId) {
                                setSelectedTaskId(c.renewalTaskId);
                                setActivePage('tasks');
                              }
                            }}
                            className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded hover:bg-slate-200 inline-flex items-center gap-1"
                            title="Aktif görevi görüntüle"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>{c.renewalTaskId}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCreateRenewalTask(c.id)}
                            className="px-2 py-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded shadow-2xs transition-colors inline-flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Görev</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Guidance */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>Toplam {filteredContracts.length} sözleşme kaydı listeleniyor (Tıklandığında Detay Çekmecesi açılır)</span>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              Sofico Miles ERP ve Paperwork EBYS ile iki yönlü canlı senkronizasyon aktiftir.
            </span>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Supplier Management Tab */}
      {activeTab === 'suppliers' && (
        <SupplierContractsTab />
      )}

      {activeTab === 'clm_kanban' && (
        <CLMKanbanBoard onOpenGenerator={handleOpenGenerator} />
      )}

      {activeTab === 'clause_library' && (
        <ClauseLibraryView onOpenGeneratorWithClause={() => handleOpenGenerator()} />
      )}

      {activeTab === 'contract_vault' && (
        <ContractVaultView />
      )}

      {activeTab === 'compliance_calendar' && (
        <ComplianceCalendarView onOpenGenerator={handleOpenGenerator} />
      )}

      {/* Dedicated Contract Detail Drawer */}
      <ContractDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedContractForDrawer(null);
        }}
        contract={selectedContractForDrawer}
        onOpenGenerator={handleOpenGenerator}
        onCreateRenewalTask={handleCreateRenewalTask}
      />

      {/* Customer Contract Paperwork Document Viewer Modal */}
      {paperworkContract && (
        <PaperworkDocumentViewerModal
          isOpen={!!paperworkContract}
          onClose={() => setPaperworkContract(null)}
          folderId={paperworkContract.paperworkFolderId || `PW-${paperworkContract.id}`}
          entityName={paperworkContract.customerRef}
          contractId={paperworkContract.id}
        />
      )}

      {/* Automated Quotation Generator Modal */}
      <AutomatedQuotationGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => {
          setIsGeneratorOpen(false);
          setGeneratorContractId(undefined);
        }}
        preSelectedContractId={generatorContractId}
      />
    </div>
  );
};
