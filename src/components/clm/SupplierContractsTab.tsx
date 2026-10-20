import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  FileCheck2,
  RefreshCw,
  FolderArchive,
  ChevronRight,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  Wrench,
  Disc,
  Truck,
  Car,
  BatteryCharging,
  FileSearch,
  Shield,
  Eye
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { SupplierContract, SupplierCategory } from '../../types';
import { ContractDetailDrawer } from './ContractDetailDrawer';
import { PaperworkDocumentViewerModal } from '../modals/PaperworkDocumentViewerModal';

export const SupplierContractsTab: React.FC = () => {
  const {
    supplierContracts,
    syncContractWithSofico
  } = useSalesOps();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expiryFilter, setExpiryFilter] = useState<'all' | '30' | '60' | '90' | 'expired'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Selected contract for drawer
  const [selectedSupplierContract, setSelectedSupplierContract] = useState<SupplierContract | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Paperwork modal state
  const [paperworkModalContract, setPaperworkModalContract] = useState<SupplierContract | null>(null);

  // Syncing state per item
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleOpenDrawer = (item: SupplierContract) => {
    setSelectedSupplierContract(item);
    setIsDrawerOpen(true);
  };

  const handleSyncSofico = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSyncingId(id);
    await new Promise(r => setTimeout(r, 600));
    await syncContractWithSofico(id, true);
    setSyncingId(null);
  };

  const handleOpenPaperwork = (item: SupplierContract, e: React.MouseEvent) => {
    e.stopPropagation();
    setPaperworkModalContract(item);
  };

  // Filtered supplier contracts
  const filteredContracts = useMemo(() => {
    return supplierContracts.filter(c => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          c.id.toLowerCase().includes(q) ||
          c.supplierName.toLowerCase().includes(q) ||
          c.taxNumber.toLowerCase().includes(q) ||
          c.categoryLabel.toLowerCase().includes(q) ||
          c.responsiblePerson.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedCategory !== 'all' && c.category !== selectedCategory) {
        return false;
      }

      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }

      if (expiryFilter === '30' && c.daysUntilExpiry > 30) return false;
      if (expiryFilter === '60' && c.daysUntilExpiry > 60) return false;
      if (expiryFilter === '90' && c.daysUntilExpiry > 90) return false;
      if (expiryFilter === 'expired' && c.daysUntilExpiry > 0) return false;

      return true;
    });
  }, [supplierContracts, searchQuery, selectedCategory, expiryFilter, statusFilter]);

  // Operational metrics
  const totalActive = supplierContracts.filter(c => c.status === 'Aktif').length;
  const expiringWithin90 = supplierContracts.filter(c => c.daysUntilExpiry <= 90 && c.daysUntilExpiry > 0).length;
  const criticalTerminationNotice = supplierContracts.filter(c => c.daysUntilExpiry <= c.terminationNoticeDays && c.daysUntilExpiry > 0).length;
  const missingDocsCount = supplierContracts.filter(c => (c.missingDocuments && c.missingDocuments.length > 0)).length;

  const getCategoryIcon = (category: SupplierCategory) => {
    switch (category) {
      case 'authorized_service':
        return <Wrench className="w-3.5 h-3.5 text-blue-600" />;
      case 'tire_supply':
        return <Disc className="w-3.5 h-3.5 text-amber-600" />;
      case 'road_assistance':
        return <Truck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'vehicle_procurement':
        return <Car className="w-3.5 h-3.5 text-indigo-600" />;
      case 'spare_parts':
        return <BatteryCharging className="w-3.5 h-3.5 text-orange-600" />;
      case 'inspection':
        return <FileSearch className="w-3.5 h-3.5 text-violet-600" />;
      case 'insurance':
        return <Shield className="w-3.5 h-3.5 text-cyan-600" />;
      default:
        return <Building2 className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Description Banner */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Tedarikçi Yönetimi & Sözleşme Kütüphanesi
            </h2>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
              Tedarikçi Masası
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Yetkili servisler, lastik, çekici/asistans, yedek parça ve kasko sağlayıcılarının çerçeve protokolleri, SLA ve fesih ihbar süreleri takibi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md font-mono border border-slate-200">
            Toplam: {supplierContracts.length} Tedarikçi Kaydı
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Aktif Tedarikçi</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{totalActive}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Yürürlükteki anlaşmalar</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">90 Günde Bitenler</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-600">{expiringWithin90}</div>
          <p className="text-[10px] text-amber-700 mt-0.5">Yenileme değerlendirmesi</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Fesih İhbarı Yaklaşan</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600">{criticalTerminationNotice}</div>
          <p className="text-[10px] text-rose-700 mt-0.5">İhbar süresi penceresinde</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Eksik Evrak / Belge</span>
            <ShieldAlert className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-xl font-bold text-violet-700">{missingDocsCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">İmza sirküleri / yetki</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-1 items-center gap-2 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tedarikçi adı, VKN, sözleşme referansı veya kategori ara..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="authorized_service">Yetkili Servis & Onarım</option>
            <option value="tire_supply">Lastik Tedariki & Otel</option>
            <option value="road_assistance">7/24 Yol Yardım & Çekici</option>
            <option value="vehicle_procurement">Yeni Araç Tedariki</option>
            <option value="spare_parts">Akü & Yedek Parça</option>
            <option value="inspection">İade Ekspertiz</option>
            <option value="insurance">Filo Kasko & Sigorta</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={expiryFilter}
            onChange={e => setExpiryFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Tüm Bitiş Pencereleri</option>
            <option value="30">Son 30 Gün (Kritik)</option>
            <option value="60">Son 60 Gün</option>
            <option value="90">Son 90 Gün</option>
            <option value="expired">Süresi Dolanlar</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="Aktif">Aktif</option>
            <option value="Süresi Dolmak Üzere">Süresi Dolmak Üzere</option>
            <option value="İncelemede">İncelemede</option>
            <option value="Yenilendi">Yenilendi</option>
          </select>
        </div>
      </div>

      {/* Supplier Contracts Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5">Tedarikçi & Ref No</th>
                <th className="py-3 px-3">Hizmet Kategorisi</th>
                <th className="py-3 px-3">Geçerlilik Tarihleri</th>
                <th className="py-3 px-3">Fesih İhbarı & Pencere</th>
                <th className="py-3 px-3">Mali Hacim & Şartlar</th>
                <th className="py-3 px-3">Sorumlu Masası</th>
                <th className="py-3 px-3">Sofico / PW</th>
                <th className="py-3 px-3">Risk</th>
                <th className="py-3 px-3 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Arama kriterlerine uygun tedarikçi sözleşmesi bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredContracts.map(item => {
                  const isWithinNotice = item.daysUntilExpiry <= item.terminationNoticeDays && item.daysUntilExpiry > 0;
                  const isSyncing = syncingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDrawer(item)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      {/* Supplier & Ref */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-blue-100 text-slate-700 transition-colors mt-0.5">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {item.supplierName}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                              <span>Ref: {item.id}</span>
                              <span>•</span>
                              <span>VKN: {item.taxNumber}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-medium text-slate-800 block">
                          {item.categoryLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px] block" title={item.slaCommitment}>
                          SLA: {item.slaCommitment.slice(0, 24)}...
                        </span>
                      </td>

                      {/* Start / End Date & Days */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] font-mono text-slate-800">
                          {item.startDate} → {item.endDate}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                            item.daysUntilExpiry <= 30
                              ? 'bg-rose-100 text-rose-800'
                              : item.daysUntilExpiry <= 90
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}>
                            {item.daysUntilExpiry} Gün Kaldı
                          </span>
                        </div>
                      </td>

                      {/* Termination Notice Period & Deadline Warning */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold font-mono ${
                            isWithinNotice ? 'text-rose-600 flex items-center gap-1' : 'text-slate-700'
                          }`}>
                            {isWithinNotice && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                            {item.terminationNoticeDays} Gün Öncesi
                          </span>
                        </div>
                        <span className={`text-[10px] block mt-0.5 ${
                          isWithinNotice ? 'text-rose-700 font-bold' : 'text-slate-400'
                        }`}>
                          {isWithinNotice ? '⚠️ İhbar Penceresinde' : 'Bildirim Beklemede'}
                        </span>
                      </td>

                      {/* Financials & Terms */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 font-mono text-[11px]">
                          ₺{(item.annualVolumeTRY / 1000000).toFixed(1)}M / Yıl
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          {item.discountRatePercent ? <span>İskonto: %{item.discountRatePercent}</span> : null}
                          <span>•</span>
                          <span>{item.paymentTermDays} Gün Vade</span>
                        </div>
                      </td>

                      {/* Responsible Person */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800 text-[11px] block">
                          {item.responsiblePerson}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                          {item.responsibleDepartment}
                        </span>
                      </td>

                      {/* Integrations (Sofico / Paperwork) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            title={`Sofico ID: ${item.soficoSupplierId}`}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1 ${
                              item.soficoSyncStatus === 'synced' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            SM
                          </span>
                          <span
                            title={`Paperwork Klasör: ${item.paperworkFolderId} (${item.paperworkDocCount} Evrak)`}
                            className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold"
                          >
                            PW:{item.paperworkDocCount}
                          </span>
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                          item.riskScore === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                          item.riskScore === 'A' ? 'bg-blue-100 text-blue-800' :
                          item.riskScore === 'B' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.riskScore}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleSyncSofico(item.id, e)}
                            disabled={isSyncing}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Sofico Miles ile Eşitle"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleOpenPaperwork(item, e)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Paperwork Dijital Arşiv Belgesi"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(item)}
                            className="px-2.5 py-1 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detay</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Detail Drawer for Supplier */}
      <ContractDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        supplierContract={selectedSupplierContract}
      />

      {/* Paperwork Document Viewer Modal */}
      {paperworkModalContract && (
        <PaperworkDocumentViewerModal
          isOpen={!!paperworkModalContract}
          onClose={() => setPaperworkModalContract(null)}
          folderId={paperworkModalContract.paperworkFolderId}
          entityName={paperworkModalContract.supplierName}
          contractId={paperworkModalContract.id}
          documents={paperworkModalContract.documents}
        />
      )}
    </div>
  );
};
