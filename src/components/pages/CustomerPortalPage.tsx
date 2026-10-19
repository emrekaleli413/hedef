import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Car,
  AlertTriangle,
  User,
  Building,
  Send,
  Zap,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  Smartphone
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { CustomerPortalRequest } from '../../types';
import { Modal } from '../common/Modal';

export const CustomerPortalPage: React.FC = () => {
  const {
    customerPortalRequests,
    addCustomerPortalRequest,
    updateCustomerPortalRequestStatus,
    createTask,
    contracts,
    addNotification,
    setActivePage
  } = useSalesOps();

  const [activeTab, setActiveTab] = useState<'backoffice' | 'client_preview'>('backoffice');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<CustomerPortalRequest | null>(null);

  // Client Simulation Form State
  const [simCustomer, setSimCustomer] = useState(contracts[0]?.customerRef || 'Borusan Lojistik Dağıtım A.Ş.');
  const [simType, setSimType] = useState<CustomerPortalRequest['requestType']>('Ek Araç Talebi');
  const [simPlate, setSimPlate] = useState(contracts[0]?.plate || '34 BRS 812');
  const [simDetails, setSimDetails] = useState('');
  const [simContact, setSimContact] = useState('Ahmet Karaca (Filo Yöneticisi)');
  const [simSubmittedSuccess, setSimSubmittedSuccess] = useState(false);

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filteredRequests = customerPortalRequests.filter(req => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        req.id.toLowerCase().includes(q) ||
        req.customerRef.toLowerCase().includes(q) ||
        req.details.toLowerCase().includes(q) ||
        (req.plate && req.plate.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (typeFilter !== 'all' && req.requestType !== typeFilter) return false;
    return true;
  });

  const getStatusBadge = (status: CustomerPortalRequest['status']) => {
    switch (status) {
      case 'Yeni':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Değerlendiriliyor':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Teklif Hazırlandı':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Onaylandı':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Kapatıldı':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleSimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simDetails.trim()) return;

    const newReq = addCustomerPortalRequest({
      customerRef: simCustomer,
      requestType: simType,
      plate: simType !== 'Ek Araç Talebi' ? simPlate : undefined,
      details: simDetails.trim(),
      contactPerson: simContact
    });

    // Automatically trigger SalesOps task
    createTask({
      title: `B2B Portaldan Talep: ${simCustomer} (${simType})`,
      processType:
        simType === 'Ek Araç Talebi'
          ? 'Teklif Hazırlama'
          : simType === 'Erken İade Başvurusu'
          ? 'Erken İade'
          : simType === 'KM Limiti Yükseltme'
          ? 'Aşırı KM'
          : 'Müşteri Takibi',
      customerRef: simCustomer,
      customerCode: 'CUST-PORTAL',
      sourceSystem: 'Otomasyon Motoru',
      owner: 'Deniz Yılmaz',
      priority: 'Yüksek',
      status: 'Yeni',
      nextAction: 'Müşteri talebini incele ve teklif/analiz taslağını oluştur',
      whatNeedsToBeDone: `B2B Müşteri Self-Servis Portalı üzerinden iletilen talep: ${simDetails}. İletişim: ${simContact}`,
      blocker: 'Yok - Müşteri teklif bekliyor'
    });

    addNotification(
      `B2B Portaldan yeni talep alındı (${newReq.id}) ve İş Kuyruğuna eklendi!`,
      'success'
    );

    setSimSubmittedSuccess(true);
    setSimDetails('');
    setTimeout(() => {
      setSimSubmittedSuccess(false);
      setActiveTab('backoffice');
    }, 1800);
  };

  const handleCreateTaskForRequest = (req: CustomerPortalRequest) => {
    createTask({
      title: `Portaldan İş Emri: ${req.customerRef} - ${req.requestType}`,
      processType:
        req.requestType === 'Ek Araç Talebi'
          ? 'Teklif Hazırlama'
          : req.requestType === 'Erken İade Başvurusu'
          ? 'Erken İade'
          : req.requestType === 'KM Limiti Yükseltme'
          ? 'Aşırı KM'
          : 'Müşteri Takibi',
      customerRef: req.customerRef,
      customerCode: 'CUST-AUTO',
      sourceSystem: 'Otomasyon Motoru',
      owner: 'Deniz Yılmaz',
      priority: 'Yüksek',
      status: 'İşlemde',
      nextAction: 'Portaldan iletilen talebe istinaden teklif hazırla',
      whatNeedsToBeDone: req.details,
      blocker: 'Yok'
    });
    updateCustomerPortalRequestStatus(req.id, 'Değerlendiriliyor');
    addNotification(`Talep için İş Kuyruğunda görev açıldı (${req.id})`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              B2B Müşteri Self-Servis Portalı & Talep Yönetimi
            </h2>
            <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono">
              Otomatik İş Emri Entegre
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Kurumsal filo müşterileri bu portal üzerinden ek araç, KM revizyonu, erken iade ve fatura mutabakatı taleplerini doğrudan sisteme iletir.
            Talepler satış destek iş kuyruğuna otomatik görev olarak düşer ve teklif motoruna bağlanır.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('backoffice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'backoffice'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Satış Destek Operasyonu</span>
            <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] rounded font-mono">
              {customerPortalRequests.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('client_preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'client_preview'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Müşteri Ekranı Simülasyonu</span>
          </button>
        </div>
      </div>

      {activeTab === 'backoffice' ? (
        <>
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Toplam Portaldan Gelen</span>
              <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">
                {customerPortalRequests.length}
              </div>
              <span className="text-[10px] text-blue-600 mt-0.5 inline-block font-mono">
                Doğrudan ERP/CRM entegre
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Yeni & İncelenmeyi Bekleyen</span>
              <div className="text-xl font-bold text-amber-600 mt-0.5 font-mono">
                {customerPortalRequests.filter(r => r.status === 'Yeni' || r.status === 'Değerlendiriliyor').length}
              </div>
              <span className="text-[10px] text-amber-700 mt-0.5 inline-block font-mono">
                SLA: &lt; 2 saat yanıt hedefi
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Teklif Aşamasına Geçen</span>
              <div className="text-xl font-bold text-purple-700 mt-0.5 font-mono">
                {customerPortalRequests.filter(r => r.status === 'Teklif Hazırlandı' || r.status === 'Onaylandı').length}
              </div>
              <span className="text-[10px] text-purple-700 mt-0.5 inline-block font-mono">
                Otomatik Teklif Motoru ile
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Ortalama Yanıt Süresi</span>
              <div className="text-xl font-bold text-emerald-700 mt-0.5 font-mono">
                1.4 Saat
              </div>
              <span className="text-[10px] text-emerald-700 mt-0.5 inline-block font-mono">
                Manuel sürece kıyasla %85 daha hızlı
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Talep No, Müşteri, Plaka veya içerik ara..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">Durum:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-700 text-xs focus:outline-hidden focus:border-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="Yeni">Yeni</option>
                <option value="Değerlendiriliyor">Değerlendiriliyor</option>
                <option value="Teklif Hazırlandı">Teklif Hazırlandı</option>
                <option value="Onaylandı">Onaylandı</option>
                <option value="Kapatıldı">Kapatıldı</option>
              </select>

              <span className="text-slate-400 text-[11px] ml-2">Tür:</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-700 text-xs focus:outline-hidden focus:border-blue-500"
              >
                <option value="all">Tüm Talep Türleri</option>
                <option value="Ek Araç Talebi">Ek Araç Talebi</option>
                <option value="KM Limiti Yükseltme">KM Limiti Yükseltme</option>
                <option value="Erken İade Başvurusu">Erken İade Başvurusu</option>
                <option value="Bakım / İkame Talebi">Bakım / İkame Talebi</option>
                <option value="Fatura İtirazı">Fatura İtirazı</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Talep No</th>
                  <th className="py-2.5 px-3">Müşteri / Yetkili</th>
                  <th className="py-2.5 px-3">Talep Türü</th>
                  <th className="py-2.5 px-3">İlgili Plaka</th>
                  <th className="py-2.5 px-3">Talep Özeti</th>
                  <th className="py-2.5 px-3">Gönderilme</th>
                  <th className="py-2.5 px-3">Durum</th>
                  <th className="py-2.5 px-3 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-blue-700">
                      {req.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{req.customerRef}</div>
                      <div className="text-[11px] text-slate-500">{req.contactPerson}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {req.requestType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {req.plate || '-'}
                    </td>
                    <td className="py-3 px-3 max-w-[280px]">
                      <p className="truncate text-slate-600 text-xs" title={req.details}>
                        {req.details}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-500 font-mono">
                      {req.dateSubmitted}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-sm border ${getStatusBadge(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                        >
                          İncele
                        </button>
                        {req.status === 'Yeni' && (
                          <button
                            onClick={() => handleCreateTaskForRequest(req)}
                            className="px-2 py-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-2xs flex items-center gap-1 transition-colors"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Görev Aç</span>
                          </button>
                        )}
                        {req.status === 'Değerlendiriliyor' && (
                          <button
                            onClick={() => {
                              updateCustomerPortalRequestStatus(req.id, 'Teklif Hazırlandı');
                              addNotification(`${req.id} için teklif süreci başlatıldı`, 'info');
                            }}
                            className="px-2 py-1 text-[11px] font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded transition-colors"
                          >
                            Teklife Çevir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      Arama kriterlerine uygun portal talebi bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Client Preview & Interactive Simulator */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Simulation Form */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    B2B Filo Müşteri Talep Formu
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kurumsal müşterinizin ekranında görünen self-servis talep modülü
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                Canlı Entegrasyon
              </span>
            </div>

            {simSubmittedSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">
                  Talebiniz Başarıyla İletildi!
                </h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Talebiniz kaydedildi, SalesOps Intelligence sisteminde anında görev açıldı ve sorumlu satış destek uzmanına atandı.
                </p>
                <div className="text-[11px] font-mono text-emerald-800 pt-2">
                  Satış Destek listesine yönlendiriliyorsunuz...
                </div>
              </div>
            ) : (
              <form onSubmit={handleSimSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Müşteri Şirket
                    </label>
                    <select
                      value={simCustomer}
                      onChange={e => setSimCustomer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                    >
                      {contracts.map(c => (
                        <option key={c.id} value={c.customerRef}>
                          {c.customerRef} ({c.plate})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Talep Türü
                    </label>
                    <select
                      value={simType}
                      onChange={e => setSimType(e.target.value as CustomerPortalRequest['requestType'])}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="Ek Araç Talebi">Ek Araç Talebi (Yeni Sipariş)</option>
                      <option value="KM Limiti Yükseltme">KM Limiti Yükseltme (Zeyilname)</option>
                      <option value="Erken İade Başvurusu">Erken İade Başvurusu</option>
                      <option value="Bakım / İkame Talebi">Bakım / İkame Talebi</option>
                      <option value="Fatura İtirazı">Fatura İtirazı / Mutabakat</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      İlgili Araç / Plaka
                    </label>
                    <input
                      type="text"
                      value={simPlate}
                      onChange={e => setSimPlate(e.target.value)}
                      placeholder="Örn: 34 BRS 812"
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Ek araç talebinde boş bırakılabilir.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Yetkili İletişim Kişisi & Unvan
                    </label>
                    <input
                      type="text"
                      value={simContact}
                      onChange={e => setSimContact(e.target.value)}
                      placeholder="Ad Soyad (Departman)"
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Talep Detayı & Beklenen Şartlar <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={simDetails}
                    onChange={e => setSimDetails(e.target.value)}
                    placeholder="Örn: 3 adet Renault Express Van ihtiyacımız oluştu. 24 ay, 30.000 KM teklifinizi bekliyoruz."
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded text-xs text-blue-800 flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Otomasyon Tetikleyicisi:</span> Form gönderildiğinde sistem arka planda müşterinin mevcut risk skorunu kontrol eder, İş Kuyruğuna ilgili kategoriyle yüksek öncelikli görev açar ve uygunsa otomatik teklif taslağı oluşturur.
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Talebi İlet & Süreci Başlat</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Info Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Self-Servis Portal Avantajları
              </h4>
              <ul className="text-xs text-slate-600 space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Sıfır E-posta Kaybı:</strong> Müşteri maillerinin gelen kutusunda unutulması veya gecikmesi engellenir.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Otomatik Ön Doğrulama:</strong> Araç plaka ve sözleşme bilgisi anında Miles/ERP verisiyle eşleştirilir.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Hızlı Teklif Üretimi:</strong> Erken iade ve aşırı KM taleplerinde formül motoru otomatik ön hesaplama yapar.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 text-white rounded-lg p-5 shadow-xs space-y-2">
              <span className="text-[11px] font-mono text-blue-400">Canlı Entegrasyon API</span>
              <h4 className="text-sm font-bold">REST Webhook / Portal SDK</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bu simülatör, gerçek kurumsal mobilite portalı veya WhatsApp for Business API üzerinden gelen payloadları simüle eder.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Talep Detayı: ${selectedRequest.id}`}
          subtitle={`${selectedRequest.customerRef} • ${selectedRequest.requestType}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs text-slate-800">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Yetkili İletişim</span>
                <span className="font-semibold text-slate-900">{selectedRequest.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">İletilme Zamanı</span>
                <span className="font-mono">{selectedRequest.dateSubmitted}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Plaka Bilgisi</span>
                <span className="font-mono">{selectedRequest.plate || 'Belirtilmedi'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mevcut Durum</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusBadge(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1 text-[11px]">Müşteri Talebi & Notlar</label>
              <div className="p-3 bg-white border border-slate-200 rounded leading-relaxed text-slate-900">
                {selectedRequest.details}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="text-[11px] text-slate-500">
                Durumu Güncelle:
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    updateCustomerPortalRequestStatus(selectedRequest.id, 'Değerlendiriliyor');
                    setIsDetailModalOpen(false);
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                >
                  Değerlendiriliyor
                </button>
                <button
                  onClick={() => {
                    handleCreateTaskForRequest(selectedRequest);
                    setIsDetailModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>İş Kuyruğuna Aktar</span>
                </button>
                <button
                  onClick={() => {
                    updateCustomerPortalRequestStatus(selectedRequest.id, 'Onaylandı');
                    setIsDetailModalOpen(false);
                  }}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
                >
                  Onayla & Kapat
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
