import React, { useState } from 'react';
import {
  X,
  FileText,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Building,
  Car,
  User,
  Shield,
  CreditCard,
  Layers,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Plus,
  Send,
  Zap,
  FolderArchive,
  FileCheck2,
  HelpCircle,
  Percent,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { Contract, SupplierContract } from '../../types';
import { useSalesOps } from '../../context/SalesOpsContext';
import { PaperworkDocumentViewerModal } from '../modals/PaperworkDocumentViewerModal';

interface ContractDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract | null;
  supplierContract?: SupplierContract | null;
  onOpenGenerator?: (contractId: string) => void;
  onCreateRenewalTask?: (contractId: string) => void;
}

export const ContractDetailDrawer: React.FC<ContractDetailDrawerProps> = ({
  isOpen,
  onClose,
  contract,
  supplierContract,
  onOpenGenerator,
  onCreateRenewalTask
}) => {
  const {
    syncContractWithSofico,
    addContractInternalNote,
    createRenewalTaskForContract
  } = useSalesOps();

  const [activeTab, setActiveTab] = useState<'overview' | 'legal_terms' | 'amendments' | 'integrations' | 'notes'>('overview');
  const [newNoteText, setNewNoteText] = useState('');
  const [isSyncingSofico, setIsSyncingSofico] = useState(false);
  const [isPaperworkModalOpen, setIsPaperworkModalOpen] = useState(false);

  if (!isOpen || (!contract && !supplierContract)) return null;

  const isSupplier = !!supplierContract;
  const id = isSupplier ? supplierContract.id : contract!.id;
  const title = isSupplier ? supplierContract.supplierName : contract!.customerRef;
  const code = isSupplier ? supplierContract.taxNumber : contract!.customerCode;
  const startDate = isSupplier ? supplierContract.startDate : contract!.startDate;
  const endDate = isSupplier ? supplierContract.endDate : contract!.endDate;
  const daysRemaining = isSupplier ? supplierContract.daysUntilExpiry : contract!.daysUntilRenewal;
  const responsiblePerson = isSupplier ? supplierContract.responsiblePerson : contract!.assignedOwner;
  const department = isSupplier ? supplierContract.responsibleDepartment : (contract!.responsibleDepartment || 'Satış Destek & Operasyon');
  const terminationNoticeDays = isSupplier ? supplierContract.terminationNoticeDays : (contract!.terminationNoticeDays || 60);
  const terminationConditions = isSupplier ? supplierContract.terminationConditions : (contract!.terminationConditions || 'Sözleşme hitamından en az 60 gün önce yazılı fesih ihbarı verilmelidir.');
  const renewalConditions = isSupplier ? supplierContract.renewalConditions : (contract!.renewalConditions || 'TÜFE/ÜFE ortalaması oranında revizyonla 12 ay uzatma opsiyonu.');
  const penaltyRate = isSupplier ? undefined : contract!.earlyTerminationPenaltyRate || 30;
  
  const soficoId = isSupplier ? supplierContract.soficoSupplierId : (contract!.soficoContractId || `SOF-${contract!.id}`);
  const soficoSyncStatus = isSupplier ? supplierContract.soficoSyncStatus : (contract!.soficoSyncStatus || 'synced');
  const lastSoficoSync = isSupplier ? supplierContract.lastSoficoSync : (contract!.lastSoficoSync || '2026-10-20 10:00');
  
  const paperworkFolderId = isSupplier ? supplierContract.paperworkFolderId : (contract!.paperworkFolderId || `PW-${contract!.id}`);
  const paperworkDocCount = isSupplier ? supplierContract.paperworkDocCount : (contract!.paperworkDocCount || 4);

  const internalNotes = isSupplier ? (supplierContract.internalNotes || []) : (contract!.internalNotes || []);
  const linkedAmendments = isSupplier ? (supplierContract.amendments || []) : (contract!.linkedAmendments || []);
  const missingDocs = isSupplier ? (supplierContract.missingDocuments || []) : (contract!.missingDocuments || []);

  // Calculate termination deadline
  // If remaining days <= terminationNoticeDays, we are in the termination notice window!
  const isWithinTerminationWindow = daysRemaining <= terminationNoticeDays && daysRemaining > 0;
  const isTerminationOverdue = daysRemaining <= 0;

  const handleSyncSofico = async () => {
    setIsSyncingSofico(true);
    await new Promise(r => setTimeout(r, 700));
    await syncContractWithSofico(id, isSupplier);
    setIsSyncingSofico(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addContractInternalNote(id, newNoteText.trim(), isSupplier);
    setNewNoteText('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-2xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  isSupplier ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                }`}>
                  {isSupplier ? 'Tedarikçi Sözleşmesi' : (contract?.segment === 'B2C' ? 'B2C Bireysel Kiralama' : 'Kurumsal Filo Kiralama')}
                </span>
                <span className="font-mono text-xs text-slate-300 font-semibold">{id}</span>
                {contract?.clmStage && (
                  <span className="text-[10px] bg-slate-700/80 text-slate-200 px-2 py-0.5 rounded border border-slate-600">
                    Aşama: {contract.clmStage}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white mt-1 leading-snug">{title}</h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">VKN/Ref: {code}</p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Indicator Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/60 text-xs">
            <div className="bg-white/5 p-2 rounded border border-white/10">
              <span className="text-[10px] text-slate-400 block">Süre Durumu</span>
              <span className={`font-bold ${daysRemaining <= 30 ? 'text-rose-400' : daysRemaining <= 90 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {daysRemaining > 0 ? `${daysRemaining} Gün Kaldı` : 'Süresi Doldu'}
              </span>
            </div>

            <div className="bg-white/5 p-2 rounded border border-white/10">
              <span className="text-[10px] text-slate-400 block">Fesih İhbar Süresi</span>
              <span className={`font-bold ${isWithinTerminationWindow ? 'text-rose-400 flex items-center gap-1' : 'text-slate-200'}`}>
                {isWithinTerminationWindow && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                {terminationNoticeDays} Gün Öncesi
              </span>
            </div>

            <div className="bg-white/5 p-2 rounded border border-white/10">
              <span className="text-[10px] text-slate-400 block">Sofico Miles ERP</span>
              <span className="text-slate-200 font-medium flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${soficoSyncStatus === 'synced' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {soficoSyncStatus === 'synced' ? 'Eşitlendi' : 'Bekliyor'}
              </span>
            </div>
          </div>
        </div>

        {/* Termination Notice Critical Alert Banner (if approaching or within window) */}
        {isWithinTerminationWindow && (
          <div className="bg-rose-50 border-b border-rose-200 p-3.5 flex items-start gap-2.5 text-xs text-rose-900 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-950">
                Kritik Fesih / Yenileme İhbar Penceresi Uyarısı!
              </p>
              <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                Sözleşmenin bitimine <strong>{daysRemaining} gün</strong> kalmıştır ve sözleşme maddesi gereği fesih ihbarı <strong>en az {terminationNoticeDays} gün önce</strong> yazılı olarak bildirilmelidir. İhbar yapılmazsa sözleşme otomatik olarak uzayacaktır.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 flex items-center gap-1 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Genel Bilgiler & Taraflar
          </button>
          <button
            onClick={() => setActiveTab('legal_terms')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'legal_terms'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Fesih & Yenileme Şartları</span>
            {isWithinTerminationWindow && <span className="w-2 h-2 rounded-full bg-rose-500" />}
          </button>
          <button
            onClick={() => setActiveTab('amendments')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'amendments'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Zeyilnameler ({linkedAmendments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'integrations'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Sofico & Paperwork</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Dahili Notlar ({internalNotes.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {/* Missing documents warning if any */}
          {missingDocs.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Eksik Evrak veya Onay Uyarısı</span>
              </div>
              <ul className="mt-1 list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
                {missingDocs.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Essential Contract Card */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-500" />
                  <span>Sözleşme & Taraf Bilgileri</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Sözleşme Referansı</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{id}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Taraf Ünvanı</span>
                    <span className="font-semibold text-slate-800 text-xs">{title}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Sorumlu Yönetici</span>
                    <span className="font-medium text-slate-800 text-xs flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {responsiblePerson}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">İlgili Departman</span>
                    <span className="font-medium text-slate-800 text-xs">{department}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Sözleşme Başlangıç</span>
                    <span className="text-slate-800 font-mono text-xs">{startDate}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Sözleşme Bitiş</span>
                    <span className="text-slate-800 font-mono text-xs font-semibold">{endDate}</span>
                  </div>
                </div>
              </div>

              {/* Financial Terms Card */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Mali Şartlar & Ödeme Koşulları</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {isSupplier ? (
                    <>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Yıllık Hacim Taahhüdü</span>
                        <span className="font-bold text-slate-900 text-sm font-mono">
                          ₺{(supplierContract.annualVolumeTRY).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">İskonto / İndirim Oranı</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          %{supplierContract.discountRatePercent || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Ödeme Vadesi</span>
                        <span className="font-semibold text-slate-800 text-xs">
                          {supplierContract.paymentTermDays} Gün Vade
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Aylık Kira Bedeli</span>
                        <span className="font-bold text-slate-900 text-sm font-mono">
                          ₺{contract!.monthlyRentAmount.toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Ödeme Yöntemi</span>
                        <span className="font-semibold text-slate-800 text-xs">
                          {contract!.paymentMethod || 'DBS / Cari Hesap'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Teminat / Blokaj Tutarı</span>
                        <span className="font-bold text-slate-800 text-xs font-mono">
                          ₺{(contract!.depositBlockedAmountTRY || 0).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Vehicle / Service Scope Card */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span>{isSupplier ? 'Hizmet Kapsamı & SLA Taahhütleri' : 'Filo & Kilometre Kapsamı'}</span>
                </h3>

                {isSupplier ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Hizmet Kategorisi</span>
                      <span className="font-semibold text-slate-800">{supplierContract.categoryLabel}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">SLA Taahhüdü</span>
                      <p className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-700 font-mono text-[11px] leading-relaxed">
                        {supplierContract.slaCommitment}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Araç Modeli</span>
                      <span className="font-semibold text-slate-800">{contract!.vehicleModel}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Plaka / Filo Adedi</span>
                      <span className="font-mono text-slate-800 font-semibold">{contract!.plate} ({contract!.vehicleCount} Araç)</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Sözleşme KM Limiti</span>
                      <span className="font-mono text-slate-800">{contract!.contractLimitKm.toLocaleString('tr-TR')} KM</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Güncel Odometre</span>
                      <span className="font-mono text-slate-800 font-bold">{contract!.currentOdometerKm.toLocaleString('tr-TR')} KM</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LEGAL & TERMINATION CONDITIONS */}
          {activeTab === 'legal_terms' && (
            <div className="space-y-4">
              {/* Termination Notice Card */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span>Fesih İhbar Süresi & Bildirim Kuralı</span>
                  </h3>
                  <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-0.5 rounded font-mono">
                    {terminationNoticeDays} Gün İhbar Şartı
                  </span>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200 text-xs leading-relaxed text-slate-700 space-y-2">
                  <p className="font-medium text-slate-900">Sözleşme Maddesi:</p>
                  <blockquote className="border-l-3 border-rose-500 pl-3 italic text-slate-600">
                    "{terminationConditions}"
                  </blockquote>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block">Bitişe Kalan Süre</span>
                    <span className="text-xs font-bold font-mono text-slate-800">{daysRemaining} Gün</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block">Zorunlu İhbar Penceresi</span>
                    <span className={`text-xs font-bold font-mono ${isWithinTerminationWindow ? 'text-rose-600' : 'text-slate-800'}`}>
                      {isWithinTerminationWindow ? 'PENCERE İÇİNDE (ACİL)' : 'Henüz Gelmedi'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Renewal Conditions Card */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>Otomatik Yenileme & Endeksleme Koşulları</span>
                </h3>

                <div className="p-3 bg-white rounded border border-slate-200 text-xs leading-relaxed text-slate-700 space-y-2">
                  <p className="font-medium text-slate-900">Yenileme Hükmü:</p>
                  <blockquote className="border-l-3 border-blue-500 pl-3 italic text-slate-600">
                    "{renewalConditions}"
                  </blockquote>
                </div>
              </div>

              {/* Early Termination Penalty (for customer leasing) */}
              {!isSupplier && (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-amber-600" />
                    <span>Erken İade Cezai Şart Oranı</span>
                  </h3>

                  <div className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200">
                    <div className="text-2xl font-black text-amber-600 font-mono">
                      %{penaltyRate}
                    </div>
                    <div className="text-[11px] text-slate-600 leading-snug">
                      Sözleşme vadesinden önce tek taraflı fesih ve erken iade durumunda, kalan ayların kira toplamının %{penaltyRate}'si cayma bedeli olarak faturalandırılır.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LINKED AMENDMENTS & PROTOCOLS */}
          {activeTab === 'amendments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Bağlı Zeyilnameler ve Ek Protokoller</h3>
                  <p className="text-[11px] text-slate-500">Ana sözleşmeye eklenmiş tüm resmi tadiller ve protokoller</p>
                </div>
                {!isSupplier && onOpenGenerator && (
                  <button
                    onClick={() => onOpenGenerator(id)}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Zeyil Üret</span>
                  </button>
                )}
              </div>

              {linkedAmendments.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-xs text-slate-600">Henüz bağlı bir zeyilname veya protokol bulunmuyor.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">KM revizyonu veya erken iade durumunda teklif motorundan zeyil oluşturabilirsiniz.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {linkedAmendments.map((amendment, index) => (
                    <div
                      key={amendment.id || index}
                      className="p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          ZY
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                              {amendment.id}
                            </span>
                            <span className="font-semibold text-slate-800 text-xs">{amendment.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                            <span>Tür: <strong>{amendment.type}</strong></span>
                            <span>•</span>
                            <span>Tarih: {amendment.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                          {amendment.status}
                        </span>
                        <button
                          onClick={() => setIsPaperworkModalOpen(true)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Paperwork'te İncele"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXTERNAL INTEGRATIONS (SOFICO & PAPERWORK) */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              {/* Sofico Miles Card */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                      SM
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Sofico Miles ERP</h4>
                      <p className="text-[10px] text-slate-500">Filo Yönetim & Muhasebe Çekirdek Sistemi</p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                    soficoSyncStatus === 'synced' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {soficoSyncStatus === 'synced' ? 'EŞİTLENDİ (CANLI)' : 'SENKRONİZASYON BEKLİYOR'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Sofico Referans ID</span>
                    <span className="font-mono font-bold text-slate-800">{soficoId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Son Başarılı Senkronizasyon</span>
                    <span className="font-mono text-slate-800">{lastSoficoSync}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSyncingSofico}
                  onClick={handleSyncSofico}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSofico ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSofico ? 'Sofico Miles ile Eşitleniyor...' : 'Sofico Miles ile Anlık Eşitle'}</span>
                </button>
              </div>

              {/* Paperwork DMS Card */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                      PW
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Paperwork Belge Yönetim Sistemi</h4>
                      <p className="text-[10px] text-slate-500">Dijital Arşiv, E-İmza & KEP Doğrulama</p>
                    </div>
                  </div>

                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold">
                    {paperworkDocCount} Belge Arşivde
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Arşiv Klasör ID</span>
                    <span className="font-mono font-bold text-slate-800">{paperworkFolderId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Yasal Güvenlik</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3" /> 5070 Sayılı Kanun Uyumlu
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPaperworkModalOpen(true)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Paperwork Belge Arşivinde Aç & İncele</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: INTERNAL OPERATIONAL NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Yeni Operasyonel veya Hukuki Not Ekle
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    placeholder="Müşteri görüşmesi, teminat mektubu durumu veya zeyil kararı..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ekle</span>
                  </button>
                </div>
              </form>

              {/* Note history */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Kayıtlı Notlar ({internalNotes.length})
                </h4>

                {internalNotes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Henüz dahili not eklenmemiş.</p>
                ) : (
                  internalNotes.map((note, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans"
                    >
                      {note}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {!isSupplier && (
              <button
                type="button"
                onClick={() => {
                  if (onCreateRenewalTask) {
                    onCreateRenewalTask(id);
                  } else {
                    createRenewalTaskForContract(id);
                  }
                }}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Yenileme Görevi Aç</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsPaperworkModalOpen(true)}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Paperwork Belgesi</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isSupplier && onOpenGenerator && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGenerator(id);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Teklif & Zeyil Motoruna Aktar</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>

      {/* Paperwork Digital Archive Viewer Modal */}
      <PaperworkDocumentViewerModal
        isOpen={isPaperworkModalOpen}
        onClose={() => setIsPaperworkModalOpen(false)}
        folderId={paperworkFolderId}
        entityName={title}
        contractId={id}
        documents={isSupplier ? supplierContract?.documents : undefined}
      />
    </>
  );
};
