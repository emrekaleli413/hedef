import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Upload,
  ArrowRight,
  ShieldAlert,
  Info,
  Check
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { ExpenseDiscrepancyItem } from '../../types';
import { Modal } from '../common/Modal';

export const PreBillingReconciliationPage: React.FC = () => {
  const { expenseDiscrepancies, updateExpenseStatus, addNotification } = useSalesOps();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');

  const filteredExpenses = expenseDiscrepancies.filter(item => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.plate.toLowerCase().includes(q) ||
        item.customerRef.toLowerCase().includes(q) ||
        item.contractRef.toLowerCase().includes(q) ||
        item.expenseType.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'all' && item.reconciliationStatus !== statusFilter) return false;
    if (selectedBatchId !== 'all' && item.batchId !== selectedBatchId) return false;
    return true;
  });

  // Calculate totals
  const totalAmount = expenseDiscrepancies.reduce((acc, curr) => acc + curr.amountTRY, 0);
  const billableAmount = expenseDiscrepancies
    .filter(i => i.reconciliationStatus === 'Müşteriye Faturalanacak' || i.reconciliationStatus === 'Faturalandı')
    .reduce((acc, curr) => acc + curr.amountTRY, 0);
  const preventedDisputeAmount = expenseDiscrepancies
    .filter(i => i.reconciliationStatus === 'Şirket İçi İptal (İkame/Parkur)')
    .reduce((acc, curr) => acc + curr.amountTRY, 0);

  const handleApproveAllBillable = () => {
    expenseDiscrepancies.forEach(item => {
      if (item.isVehicleInCustomerCustody && item.reconciliationStatus === 'Müşteriye Faturalanacak') {
        updateExpenseStatus(item.id, 'Faturalandı');
      }
    });
    addNotification('Tüm onaylı kalemler ek faturaya aktarıldı.', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Toplu HGS & Ceza Ön Fatura Eşleştirici
            </h2>
            <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono">
              Fatura Öncesi İtiraz Önleme
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Karayolları HGS ve Trafik Ceza dökümlerini kiralama tarihleriyle otomatik eşleştirin. Serviste veya şirket parkurunda oluşan cezaları ayıklayarak müşteri itirazlarını önceden engelleyin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleApproveAllBillable}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Onaylananları Faturalandır</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500">İncelenen Toplam Gider Partisi</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {totalAmount.toLocaleString('tr-TR')} TL
            </span>
            <span className="text-xs text-slate-400">({expenseDiscrepancies.length} Kalem)</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">HGS + Ceza + İkame Farkı</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500">Müşteriye Doğrulanan Tutar</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              {billableAmount.toLocaleString('tr-TR')} TL
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">Fiili kullanım teyitli</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500">Önlenen Hatalı Yansıtma Tutarı</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 font-mono">
              {preventedDisputeAmount.toLocaleString('tr-TR')} TL
            </span>
          </div>
          <span className="text-[11px] text-rose-600 mt-0.5 block">Servis/Parkur cezaları elendi</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Plaka, müşteri veya sözleşme no ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="Müşteriye Faturalanacak">Müşteriye Faturalanacak</option>
            <option value="Şirket İçi İptal (İkame/Parkur)">Şirket İçi İptal</option>
            <option value="İnceleme Gerektiriyor">İnceleme Gerektiriyor</option>
            <option value="Faturalandı">Faturalandı</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 whitespace-nowrap">ID</th>
                <th className="py-3 px-3 whitespace-nowrap">Plaka</th>
                <th className="py-3 px-3 min-w-[180px]">Müşteri & Sözleşme</th>
                <th className="py-3 px-3 whitespace-nowrap">Gider Türü</th>
                <th className="py-3 px-3 whitespace-nowrap">Olay Tarihi / Saati</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Tutar</th>
                <th className="py-3 px-3 whitespace-nowrap">Zimmet Kontrolü</th>
                <th className="py-3 px-3 whitespace-nowrap">Mutabakat Durumu</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredExpenses.map(item => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {item.id}
                  </td>

                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {item.plate}
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{item.customerRef}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.contractRef}</div>
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800">
                    {item.expenseType}
                  </td>

                  <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap text-slate-600">
                    {item.eventDateTime}
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {item.amountTRY.toLocaleString('tr-TR')} TL
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {item.isVehicleInCustomerCustody ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Müşteri Zimmetinde</span>
                      </span>
                    ) : (
                      <span className="text-rose-700 font-bold flex items-center gap-1 text-[11px] bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Servis / Şirket Parkurunda</span>
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        item.reconciliationStatus === 'Müşteriye Faturalanacak'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : item.reconciliationStatus === 'Faturalandı'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : item.reconciliationStatus === 'Şirket İçi İptal (İkame/Parkur)'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.reconciliationStatus}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                    {item.reconciliationStatus !== 'Faturalandı' && (
                      <>
                        <button
                          onClick={() => updateExpenseStatus(item.id, 'Müşteriye Faturalanacak')}
                          className="px-2 py-1 text-[11px] text-blue-700 hover:bg-blue-50 rounded font-semibold border border-blue-200"
                        >
                          Müşteriye Aktar
                        </button>
                        <button
                          onClick={() => updateExpenseStatus(item.id, 'Şirket İçi İptal (İkame/Parkur)')}
                          className="px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-50 rounded font-semibold border border-rose-200"
                        >
                          İptal Et
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
