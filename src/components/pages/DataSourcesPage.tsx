import React from 'react';
import {
  Database,
  Server,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight,
  Shield,
  FileCode,
  Info
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';

export const DataSourcesPage: React.FC = () => {
  const { dataSources } = useSalesOps();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Kurumsal Veri Kaynakları & Entegrasyon Durumu
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Filo ERP (Miles), İş Zekası (Qlik Sense) ve manuel operasyon girişlerinin veri besleme mimarisi ve bağlantı sağlık göstergeleri.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded">
          <span>Ortam: Prototip Sandbox</span>
        </div>
      </div>

      {/* Connection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataSources.map(ds => {
          const isConnected = ds.status === 'Aktif' || ds.status === 'Aktif (Yerel Depolama)';
          return (
            <div
              key={ds.id}
              className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
                        isConnected
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs">{ds.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{ds.id}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {ds.status}
                  </span>
                </div>

                {/* Details list */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-baseline justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 text-[11px]">Son Başarılı Senkronizasyon:</span>
                    <span className="font-mono text-slate-700">{ds.lastSync}</span>
                  </div>

                  <div className="flex items-baseline justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 text-[11px]">Veri Tazeliği (Freshness):</span>
                    <span className="font-medium text-slate-800">{ds.dataFreshness}</span>
                  </div>

                  <div className="py-1">
                    <span className="text-slate-400 text-[11px] block mb-0.5">Planlanan Entegrasyon Yöntemi:</span>
                    <span className="font-mono text-slate-800 text-[11px] bg-slate-50 p-1.5 rounded block border border-slate-100">
                      {ds.plannedMethod}
                    </span>
                  </div>

                  <div className="py-1">
                    <span className="text-slate-400 text-[11px] block mb-0.5">Entegrasyon Notları & Durum:</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{ds.notes}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  Kayıt Sayısı: {ds.recordCount}
                </span>

                {!isConnected ? (
                  <span className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Entegrasyon Bekleniyor</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Lokal Veri Aktif</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Technical Architecture Overview */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Planlanan Kurumsal Veri Akışı Mimarisi</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <span className="font-bold text-slate-800 block">1. ERP & Telematik (Miles)</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Araç servis bakım odometreleri, sözleşme başlangıç/bitiş tarihleri ve kasko/hasar verileri Miles ERP servislerinden SOAP/REST arabirimi ile periyodik olarak çekilecektir.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <span className="font-bold text-slate-800 block">2. Satış BI & Raporlama (Qlik)</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Müşteri bazlı kar marjları, teklif dönüşüm oranları ve satış ekibi hedef realizasyonları kurumsal Qlik Engine REST API üzerinden çift yönlü senkronize edilecektir.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <span className="font-bold text-slate-800 block">3. Satış Operasyon Motoru (SalesOps)</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Tüm kural kontrolleri (T-90 yenileme, %15 aşırı KM, SLA aşımı, Fast-track onay) SalesOps Intelligence motorunda çalışarak kullanıcılara eylem odaklı iş kuyruğu sunar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
