import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Users,
  Shield,
  RotateCcw,
  CheckCircle2,
  Info,
  Clock,
  Car,
  AlertTriangle
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { Modal } from '../common/Modal';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDemoData,
    teamMembers
  } = useSalesOps();

  const [renewalDays, setRenewalDays] = useState(settings.renewalWarningDays);
  const [extWaitDays, setExtWaitDays] = useState(settings.slaExternalResponseDays);
  const [approvalHours, setApprovalHours] = useState(settings.slaApprovalHours);
  const [fastTrackVehicles, setFastTrackVehicles] = useState(settings.fastTrackMaxVehicles);
  const [fastTrackMargin, setFastTrackMargin] = useState(settings.fastTrackMinMarginPercent);
  const [kmThreshold, setKmThreshold] = useState(settings.mileageOverageThresholdPercent);

  // Section 16.I Configurable Demo Pricing Engine State
  const [excessMileageRate, setExcessMileageRate] = useState(settings.excessMileageRatePerKm || 4.50);
  const [earlyReturnCompRate, setEarlyReturnCompRate] = useState(settings.earlyReturnCompensationRatePercent || 35.0);
  const [earlyReturnFixedFee, setEarlyReturnFixedFee] = useState(settings.earlyReturnFixedProcessingFee || 7500);
  const [earlyReturnRefurb, setEarlyReturnRefurb] = useState(settings.earlyReturnRefurbishmentProvision || 12000);
  const [defaultRenewalMonths, setDefaultRenewalMonths] = useState(settings.defaultRenewalDurationMonths || 24);
  const [defaultRenewalAdjustment, setDefaultRenewalAdjustment] = useState(settings.defaultRenewalAdjustmentPercent || 18.0);
  const [validityDays, setValidityDays] = useState(settings.quotationValidityDays || 15);
  const [vatRate, setVatRate] = useState(settings.vatTaxRatePercent || 20);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      renewalWarningDays: renewalDays,
      slaExternalResponseDays: extWaitDays,
      slaApprovalHours: approvalHours,
      fastTrackMaxVehicles: fastTrackVehicles,
      fastTrackMinMarginPercent: fastTrackMargin,
      mileageOverageThresholdPercent: kmThreshold,
      // Pricing engine settings
      excessMileageRatePerKm: excessMileageRate,
      earlyReturnCompensationRatePercent: earlyReturnCompRate,
      earlyReturnFixedProcessingFee: earlyReturnFixedFee,
      earlyReturnRefurbishmentProvision: earlyReturnRefurb,
      defaultRenewalDurationMonths: defaultRenewalMonths,
      defaultRenewalAdjustmentPercent: defaultRenewalAdjustment,
      quotationValidityDays: validityDays,
      vatTaxRatePercent: vatRate
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetConfirm = () => {
    resetToDemoData();
    setConfirmResetOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Sistem Parametreleri & İş Akışı Kuralları
            </h2>
            <span className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono">
              Prototip Ayarları
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            SLA eskalasyon eşikleri, sözleşme yenileme uyarı pencereleri, Fast-track onay sınırları ve ekip rolleri.
          </p>
        </div>

        <button
          onClick={() => setConfirmResetOpen(true)}
          className="px-3.5 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Demo Verilerini Sıfırla</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Sistem parametreleri başarıyla kaydedildi.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Otomasyon Eşikleri & Süreç Kuralları</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Renewal warning */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Sözleşme Yenileme Uyarı Penceresi (Gün)
              </label>
              <input
                type="number"
                min={15}
                max={180}
                value={renewalDays}
                onChange={e => setRenewalDays(parseInt(e.target.value) || 90)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Bitişine bu gün kalan sözleşmeler için proaktif görev önerilir (Varsayılan: 90 gün).
              </span>
            </div>

            {/* SLA External Wait Days */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Müşteri Dış Yanıt SLA Eşiği (İş Günü)
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={extWaitDays}
                onChange={e => setExtWaitDays(parseInt(e.target.value) || 3)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Bu süreyi aşan görevler için yönetici eskalasyonu tetiklenir (Varsayılan: 3 gün).
              </span>
            </div>

            {/* SLA Internal Approval Hours */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Dahili Onay SLA Eşiği (Saat)
              </label>
              <input
                type="number"
                min={4}
                max={72}
                value={approvalHours}
                onChange={e => setApprovalHours(parseInt(e.target.value) || 24)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Onay bekleyen teklif ve görevlerin azami bekleme süresi (Varsayılan: 24 saat).
              </span>
            </div>

            {/* Fast Track Max Vehicles */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Fast-Track Azami Araç Adedi
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={fastTrackVehicles}
                onChange={e => setFastTrackVehicles(parseInt(e.target.value) || 5)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Bu adede kadar olan teklifler komite onayını atlayabilir (Varsayılan: 5 araç).
              </span>
            </div>

            {/* Fast Track Min Gross Margin */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Fast-Track Asgari Brüt Kar Marjı (%)
              </label>
              <input
                type="number"
                step={0.5}
                min={5}
                max={30}
                value={fastTrackMargin}
                onChange={e => setFastTrackMargin(parseFloat(e.target.value) || 14.0)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Fast-Track otomatik onay için gerekli asgari kar marjı (Varsayılan: %14.0).
              </span>
            </div>

            {/* Mileage Overage Alert Threshold */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Aşırı KM Erken Uyarı Eşiği (%)
              </label>
              <input
                type="number"
                step={1}
                min={5}
                max={50}
                value={kmThreshold}
                onChange={e => setKmThreshold(parseFloat(e.target.value) || 15.0)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Yıllık sözleşme limitini bu oranda aşan araçlar için zeyilname uyarısı üretilir (Varsayılan: %15).
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
            >
              Parametreleri Kaydet
            </button>
          </div>
        </div>

        {/* Section 16.I Configurable Demo Pricing Engine Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-600" />
              <span>Demo Fiyatlandırma & Hesaplama Motoru (Section 16.I)</span>
            </h3>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono">
              Otomatik Teklif Motoru Parametreleri
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Otomatik teklif motoru (Kilometre Aşımı, Erken İade ve Sözleşme Yenileme) bu hesaplama kurallarını ve kurgusal tarife oranlarını kullanır. Değiştirilen değerler sonraki tüm hesaplamaları dinamik olarak etkiler.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1">
            {/* Excess Mileage Rate */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Kilometre Aşımı Birim Bedeli (TL/KM)
              </label>
              <input
                type="number"
                step={0.25}
                min={1}
                value={excessMileageRate}
                onChange={e => setExcessMileageRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Her 1 fazla kilometre için tahakkuk edecek ücret (Örn: 4.50 TL).
              </span>
            </div>

            {/* Early Return Compensation Rate */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Erken İade Fesih Tazminat Oranı (%)
              </label>
              <input
                type="number"
                step={1}
                min={5}
                max={100}
                value={earlyReturnCompRate}
                onChange={e => setEarlyReturnCompRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Kalan kira toplamına uygulanan ceza oranı (Örn: %35).
              </span>
            </div>

            {/* Early Return Fixed Processing Fee */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Erken İade Lojistik & De-fleeting Bedeli (TL)
              </label>
              <input
                type="number"
                step={500}
                value={earlyReturnFixedFee}
                onChange={e => setEarlyReturnFixedFee(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Plaka kapanışı ve araç çekme sabit operasyon ücreti.
              </span>
            </div>

            {/* Early Return Refurbishment Provision */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Erken İade Ekspertiz / Aşınma Karşılığı (TL)
              </label>
              <input
                type="number"
                step={500}
                value={earlyReturnRefurb}
                onChange={e => setEarlyReturnRefurb(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Bağımsız ekspertiz öncesi mahsup provizyon tutarı.
              </span>
            </div>

            {/* Default Renewal Duration */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Varsayılan Yenileme Vadesi (Ay)
              </label>
              <select
                value={defaultRenewalMonths}
                onChange={e => setDefaultRenewalMonths(parseInt(e.target.value) || 24)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              >
                <option value={12}>12 Ay</option>
                <option value={24}>24 Ay</option>
                <option value={36}>36 Ay</option>
                <option value={48}>48 Ay</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Yenileme teklifi açıldığında varsayılan olarak seçilen vade.
              </span>
            </div>

            {/* Default Renewal Price Adjustment */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Varsayılan Fiyat Güncelleme Oranı (%)
              </label>
              <input
                type="number"
                step={0.5}
                value={defaultRenewalAdjustment}
                onChange={e => setDefaultRenewalAdjustment(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Mevcut kiraya uygulanacak enflasyon/fonlama artışı (Örn: +%18.0).
              </span>
            </div>

            {/* Quotation Validity Days */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Teklif Geçerlilik Süresi (Gün)
              </label>
              <input
                type="number"
                min={3}
                max={60}
                value={validityDays}
                onChange={e => setValidityDays(parseInt(e.target.value) || 15)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Teklifin düzenlendiği günden itibaren geçerlilik süresi.
              </span>
            </div>

            {/* Applicable VAT Rate */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Uygulanan KDV Oranı (%)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={vatRate}
                onChange={e => setVatRate(parseFloat(e.target.value) || 20)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Matrah üzerine hesaplanan katma değer vergisi oranı (%20).
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
            >
              Fiyatlandırma Motoru Ayarlarını Kaydet
            </button>
          </div>
        </div>
      </form>

      {/* Team Members and Demo Roles */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Operasyon Ekibi & Demo Rolleri</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teamMembers.map(member => (
            <div
              key={member.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full ${member.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0`}
                >
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{member.name}</span>
                  <span className="text-[11px] text-slate-500 block">{member.role}</span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{member.email}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-slate-800 text-xs block">
                  {member.activeTasks}
                </span>
                <span className="text-[10px] text-slate-400 block">Görev</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Status Definitions */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>İş Akışı Statü Sözlüğü</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-slate-800 block">Yeni</span>
            <p className="text-slate-500 text-[11px] mt-0.5">Sisteme yeni girmiş veya otomasyonca açılmış, henüz işlem başlatılmamış görev.</p>
          </div>
          <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded">
            <span className="font-bold text-blue-900 block">İşlemde</span>
            <p className="text-slate-600 text-[11px] mt-0.5">Uzman tarafından üzerinde aktif çalışma, teklif hazırlığı veya analiz yürütülen iş.</p>
          </div>
          <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded">
            <span className="font-bold text-amber-900 block">Onay Bekliyor</span>
            <p className="text-slate-600 text-[11px] mt-0.5">Yönetici, risk veya kredi komitesi onayı bekleyen teklif veya bütçe kararı.</p>
          </div>
          <div className="p-2.5 bg-purple-50/60 border border-purple-200 rounded">
            <span className="font-bold text-purple-900 block">Dış Yanıt Bekliyor</span>
            <p className="text-slate-600 text-[11px] mt-0.5">Müşteri, servis istasyonu veya noter/ekspertiz kurumundan geri bildirim beklenen iş.</p>
          </div>
          <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded">
            <span className="font-bold text-emerald-900 block">Tamamlandı</span>
            <p className="text-slate-600 text-[11px] mt-0.5">Tüm kontrol adımları başarıyla bitirilmiş ve arşivlenmiş operasyonel süreç.</p>
          </div>
          <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded">
            <span className="font-bold text-rose-900 block">İptal</span>
            <p className="text-slate-600 text-[11px] mt-0.5">Müşteri talebiyle veya mükerrerlik sebebiyle kapatılan iş kaydı.</p>
          </div>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      {confirmResetOpen && (
        <Modal
          isOpen={confirmResetOpen}
          onClose={() => setConfirmResetOpen(false)}
          title="Demo Verilerini Sıfırla"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Bu işlem, yerel depolamadaki (localStorage) tüm görev, teklif, itiraz ve parametre değişikliklerini sıfırlayarak uygulamanın orijinal kurgusal demo veri setine dönmesini sağlayacaktır.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 text-xs hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                onClick={handleResetConfirm}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
              >
                Evet, Sıfırla
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
