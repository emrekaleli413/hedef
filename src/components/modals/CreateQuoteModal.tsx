import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useSalesOps } from '../../context/SalesOpsContext';
import { QuotationType } from '../../types';
import { Zap, AlertCircle } from 'lucide-react';

interface CreateQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateQuoteModal: React.FC<CreateQuoteModalProps> = ({ isOpen, onClose }) => {
  const { createQuotation, teamMembers, settings } = useSalesOps();

  const [customerRef, setCustomerRef] = useState('');
  const [customerCode, setCustomerCode] = useState('CUST-100');
  const [quotationType, setQuotationType] = useState<QuotationType>('Yeni Teklif');
  const [vehicleCount, setVehicleCount] = useState<number>(3);
  const [vehicleModel, setVehicleModel] = useState('Renault Megane Sedan 1.3 TCe Touch EDC');
  const [termMonths, setTermMonths] = useState<number>(36);
  const [annualKm, setAnnualKm] = useState<number>(30000);
  const [monthlyRentPerVehicle, setMonthlyRentPerVehicle] = useState<number>(27500);
  const [grossMarginPercent, setGrossMarginPercent] = useState<number>(15.5);
  const [customerCreditScore, setCustomerCreditScore] = useState<'Düşük Risk / A+' | 'Orta Risk / B' | 'Yüksek Risk / C'>('Düşük Risk / A+');
  const [owner, setOwner] = useState(teamMembers[0]?.name || 'Burak Kaya');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Check fast track criteria
  const isFastTrack =
    vehicleCount <= settings.fastTrackMaxVehicles &&
    grossMarginPercent >= settings.fastTrackMinMarginPercent &&
    customerCreditScore === 'Düşük Risk / A+';

  const totalMonthlyAmount = vehicleCount * monthlyRentPerVehicle;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerRef.trim()) {
      setError('Lütfen müşteri referansını doldurun.');
      return;
    }

    createQuotation({
      customerRef: customerRef.trim(),
      customerCode: customerCode.trim() || 'CUST-100',
      quotationType,
      vehicleCount,
      vehicleModel,
      termMonths,
      annualKm,
      monthlyRentPerVehicle,
      totalMonthlyAmount,
      grossMarginPercent,
      customerCreditScore,
      owner,
      notes: notes.trim() || 'Yeni teklif'
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yeni Kiralama Teklifi Hazırla"
      subtitle="Filo kiralama, zeyilname veya yenileme teklif çalışması"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">
            {error}
          </div>
        )}

        {/* Fast Track Banner */}
        {isFastTrack ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2.5 text-emerald-800">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-[11px] leading-snug">
              <span className="font-bold">Fast-Track Otomasyonu Uygun:</span> Araç adedi (≤{settings.fastTrackMaxVehicles}), kar marjı (≥%{settings.fastTrackMinMarginPercent}) ve kredi skoru kriteri sağlandığından, teklif komite onayını atlayarak doğrudan <strong>Onaylandı (Fast-Track)</strong> statüsüne geçecektir.
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded flex items-center gap-2 text-amber-800 text-[11px]">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Teklif standart onay akışına girecektir (Yönetim veya Risk Komitesi onayı beklenir).
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Müşteri Ünvanı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Borusan Lojistik Dağıtım A.Ş."
              value={customerRef}
              onChange={e => setCustomerRef(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Teklif Tipi
            </label>
            <select
              value={quotationType}
              onChange={e => setQuotationType(e.target.value as QuotationType)}
              className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden bg-white"
            >
              <option value="Yeni Teklif">Yeni Teklif</option>
              <option value="Teklif Revizyonu">Teklif Revizyonu</option>
              <option value="Sözleşme Yenileme">Sözleşme Yenileme</option>
              <option value="Aşırı KM Zeyilnamesi">Aşırı KM Zeyilnamesi</option>
              <option value="Erken Araç İadesi">Erken Araç İadesi</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">
              Araç Modeli & Donanım
            </label>
            <input
              type="text"
              value={vehicleModel}
              onChange={e => setVehicleModel(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Araç Adedi
            </label>
            <input
              type="number"
              min={1}
              max={200}
              value={vehicleCount}
              onChange={e => setVehicleCount(parseInt(e.target.value) || 1)}
              className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Vade (Ay)
            </label>
            <select
              value={termMonths}
              onChange={e => setTermMonths(parseInt(e.target.value))}
              className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
            >
              <option value={12}>12 Ay</option>
              <option value={24}>24 Ay</option>
              <option value={36}>36 Ay</option>
              <option value={48}>48 Ay</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Yıllık KM Sınırı
            </label>
            <select
              value={annualKm}
              onChange={e => setAnnualKm(parseInt(e.target.value))}
              className="w-full text-xs border border-slate-300 rounded p-2 bg-white font-mono"
            >
              <option value={20000}>20.000 KM</option>
              <option value={25000}>25.000 KM</option>
              <option value={30000}>30.000 KM</option>
              <option value={40000}>40.000 KM</option>
              <option value={55000}>55.000 KM</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Birim Araç Kirası (TL/Ay)
            </label>
            <input
              type="number"
              step={500}
              value={monthlyRentPerVehicle}
              onChange={e => setMonthlyRentPerVehicle(parseFloat(e.target.value) || 0)}
              className="w-full text-xs border border-slate-300 rounded p-2 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Brüt Kar Marjı (%)
            </label>
            <input
              type="number"
              step={0.1}
              value={grossMarginPercent}
              onChange={e => setGrossMarginPercent(parseFloat(e.target.value) || 0)}
              className="w-full text-xs border border-slate-300 rounded p-2 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Müşteri KKB Risk Skoru
            </label>
            <select
              value={customerCreditScore}
              onChange={e => setCustomerCreditScore(e.target.value as any)}
              className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
            >
              <option value="Düşük Risk / A+">Düşük Risk / A+ (Fast-Track Uyumlu)</option>
              <option value="Orta Risk / B">Orta Risk / B (Birim Onayı Gerekir)</option>
              <option value="Yüksek Risk / C">Yüksek Risk / C (Komite & Ek Teminat)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Sorumlu Satış Destek Uzmanı
            </label>
            <select
              value={owner}
              onChange={e => setOwner(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 bg-white"
            >
              {teamMembers.map(m => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Financial Summary Pill */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Toplam Aylık Filo Kira Tutarı (Fiktif Demo):</span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {totalMonthlyAmount.toLocaleString('tr-TR')} TL / Ay
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[11px]">Tahmini Brüt Kar Marjı:</span>
            <span className="text-sm font-bold text-emerald-700 font-mono">
              %{grossMarginPercent.toFixed(1)}
            </span>
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Özel Teklif Notları & Koşullar
          </label>
          <textarea
            rows={2}
            placeholder="İkame araç segmenti, kış lastiği adedi veya teslimat tarihi notları..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded p-2"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium border border-slate-300 rounded hover:bg-slate-50 text-slate-700"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shadow-2xs"
          >
            Teklifi Kaydet & Sürece Al
          </button>
        </div>
      </form>
    </Modal>
  );
};
