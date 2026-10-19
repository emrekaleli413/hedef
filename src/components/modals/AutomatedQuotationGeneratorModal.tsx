import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Calculator,
  Search,
  CheckCircle2,
  AlertCircle,
  Car,
  Clock,
  Printer,
  Save,
  Send,
  ArrowRight,
  ArrowLeft,
  Sliders,
  ShieldAlert,
  Info,
  Check
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { Contract, QuotationType, QuotationStatus, QuotationCalculationDetails } from '../../types';
import { Modal } from '../common/Modal';

interface AutomatedQuotationGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedContractId?: string;
  defaultType?: QuotationType;
}

type GeneratorStep = 'type_and_contract' | 'parameters' | 'preview_document';

export const AutomatedQuotationGeneratorModal: React.FC<AutomatedQuotationGeneratorModalProps> = ({
  isOpen,
  onClose,
  preSelectedContractId,
  defaultType = 'Aşırı KM Zeyilnamesi'
}) => {
  const {
    contracts,
    settings,
    createQuotation,
    teamMembers
  } = useSalesOps();

  // Wizard Step
  const [currentStep, setCurrentStep] = useState<GeneratorStep>('type_and_contract');

  // Selected Quotation Type
  const [selectedType, setSelectedType] = useState<QuotationType>(defaultType);

  // Selected Contract
  const [selectedContractId, setSelectedContractId] = useState<string>(preSelectedContractId || '');
  const [contractSearchQuery, setContractSearchQuery] = useState<string>('');

  // Kilometre Aşımı Parameters
  const [excessKm, setExcessKm] = useState<number>(10000);

  // Erken İade Parameters
  const [earlyReturnDate, setEarlyReturnDate] = useState<string>(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [remainingMonths, setRemainingMonths] = useState<number>(6);

  // Sözleşme Yenileme Parameters
  const [renewalDurationMonths, setRenewalDurationMonths] = useState<number>(
    settings.defaultRenewalDurationMonths || 24
  );
  const [renewalAdjustmentPercent, setRenewalAdjustmentPercent] = useState<number>(
    settings.defaultRenewalAdjustmentPercent || 18.0
  );

  // Additional commercial / notes
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [assignedOwner, setAssignedOwner] = useState<string>(teamMembers[0]?.name || 'Burak Kaya');
  const [validationError, setValidationError] = useState<string>('');

  // Generated Quotation Ref
  const [generatedRefId, setGeneratedRefId] = useState<string>('');

  // Sync preSelectedContractId if changed
  useEffect(() => {
    if (preSelectedContractId) {
      setSelectedContractId(preSelectedContractId);
    }
  }, [preSelectedContractId]);

  // When modal opens, generate a provisional ID
  useEffect(() => {
    if (isOpen) {
      const typeCode =
        selectedType === 'Aşırı KM Zeyilnamesi'
          ? 'KM'
          : selectedType === 'Erken Araç İadesi'
          ? 'EI'
          : 'YN';
      setGeneratedRefId(`TKF-2026-${typeCode}-${Math.floor(100 + Math.random() * 900)}`);
      setValidationError('');
    }
  }, [isOpen, selectedType]);

  // Find selected contract
  const selectedContract = useMemo(() => {
    return contracts.find(c => c.id === selectedContractId) || null;
  }, [contracts, selectedContractId]);

  // Filter contracts for search
  const filteredContracts = useMemo(() => {
    if (!contractSearchQuery.trim()) return contracts;
    const q = contractSearchQuery.toLowerCase();
    return contracts.filter(
      c =>
        c.id.toLowerCase().includes(q) ||
        c.customerRef.toLowerCase().includes(q) ||
        c.vehicleModel.toLowerCase().includes(q) ||
        c.plate.toLowerCase().includes(q)
    );
  }, [contracts, contractSearchQuery]);

  // Auto-fill parameters when contract is selected
  useEffect(() => {
    if (selectedContract) {
      // For excess KM: calculate projected or actual overage
      const overKm = Math.max(0, selectedContract.currentOdometerKm - selectedContract.contractLimitKm);
      setExcessKm(overKm > 0 ? overKm : 12000);

      // For early return: calculate months to end date
      const endD = new Date(selectedContract.endDate);
      const nowD = new Date();
      const diffMonths = Math.max(1, Math.round((endD.getTime() - nowD.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      setRemainingMonths(diffMonths);

      setAssignedOwner(selectedContract.assignedOwner || teamMembers[0]?.name || 'Burak Kaya');
    }
  }, [selectedContract, teamMembers]);

  // Calculation Breakdown Engine
  const calculationDetails: QuotationCalculationDetails = useMemo(() => {
    const vatRate = settings.vatTaxRatePercent || 20;

    if (selectedType === 'Aşırı KM Zeyilnamesi') {
      const ratePerKm = settings.excessMileageRatePerKm || 4.50;
      const subtotal = excessKm * ratePerKm;
      const vatAmount = subtotal * (vatRate / 100);
      const grandTotal = subtotal + vatAmount;

      return {
        formulaDescription: `Kilometre Aşımı Ücreti = Aşım Kilometresi (${excessKm.toLocaleString('tr-TR')} KM) × Birim KM Ücreti (${ratePerKm.toFixed(2)} TL/KM)`,
        parametersApplied: {
          'Aşım Kilometresi': `${excessKm.toLocaleString('tr-TR')} KM`,
          'Birim KM Ücreti': `${ratePerKm.toFixed(2)} TL / KM`,
          'KDV Oranı': `%${vatRate}`
        },
        itemizedCharges: [
          {
            description: `Sözleşme Dışı Kilometre Aşım Bedeli (${excessKm.toLocaleString('tr-TR')} KM × ${ratePerKm.toFixed(2)} TL)`,
            calculationNote: 'Telematik / servis bakım odometre farkı esasına göre hesaplanmıştır.',
            amountTRY: subtotal
          }
        ],
        subtotalTRY: subtotal,
        vatRatePercent: vatRate,
        vatAmountTRY: vatAmount,
        grandTotalTRY: grandTotal,
        assumptions: [
          `Birim kilometre aşım tarifesi (${ratePerKm.toFixed(2)} TL/KM) sistem parametrelerinden alınmıştır.`,
          'Tutar tek seferlik ek fatura veya kalan aylara eşit taksitle yansıtılabilir.',
          'KDV oranı %20 olarak uygulanmıştır.'
        ]
      };
    } else if (selectedType === 'Erken Araç İadesi') {
      const monthlyLease = selectedContract ? selectedContract.monthlyRentAmount / selectedContract.vehicleCount : 25000;
      const totalRemainingLease = remainingMonths * monthlyLease;
      const penaltyRate = settings.earlyReturnCompensationRatePercent || 35.0;
      const penaltyCharge = totalRemainingLease * (penaltyRate / 100);
      const fixedFee = settings.earlyReturnFixedProcessingFee || 7500;
      const refProvision = settings.earlyReturnRefurbishmentProvision || 12000;

      const subtotal = penaltyCharge + fixedFee + refProvision;
      const vatAmount = subtotal * (vatRate / 100);
      const grandTotal = subtotal + vatAmount;

      return {
        formulaDescription: `Erken İade Bedeli = (Kalan Vade [${remainingMonths} Ay] × Aylık Kira [${monthlyLease.toLocaleString('tr-TR')} TL] × Fesih Oranı [%${penaltyRate}]) + Lojistik Bedeli (${fixedFee.toLocaleString('tr-TR')} TL) + Ekspertiz/Aşınma Karşılığı (${refProvision.toLocaleString('tr-TR')} TL)`,
        parametersApplied: {
          'Kalan Vade': `${remainingMonths} Ay`,
          'Aylık Kira Bedeli': `${monthlyLease.toLocaleString('tr-TR')} TL`,
          'Erken Fesih Tazminat Oranı': `%${penaltyRate}`,
          'Sabit Lojistik / De-fleeting Bedeli': `${fixedFee.toLocaleString('tr-TR')} TL`,
          'Ekspertiz ve Aşınma Karşılığı': `${refProvision.toLocaleString('tr-TR')} TL`,
          'KDV Oranı': `%${vatRate}`
        },
        itemizedCharges: [
          {
            description: `Erken Sözleşme Fesih Tazminat Bedeli (Kalan ${remainingMonths} ay kirasının %${penaltyRate}'i)`,
            calculationNote: 'Kalan tüm kira talep edilmeyip, yasal amortisman telafi oranı uygulanmıştır.',
            amountTRY: penaltyCharge
          },
          {
            description: 'Lojistik, Plaka Kapanış ve De-fleeting İşlem Bedeli',
            calculationNote: 'Sabit operasyonel de-fleeting maliyeti.',
            amountTRY: fixedFee
          },
          {
            description: 'Ekspertiz ve İkinci El Amortisman Düzeltme Karşılığı',
            calculationNote: 'Yetkili servis ekspertiz raporu sonrası mahsuplaşılacaktır.',
            amountTRY: refProvision
          }
        ],
        subtotalTRY: subtotal,
        vatRatePercent: vatRate,
        vatAmountTRY: vatAmount,
        grandTotalTRY: grandTotal,
        assumptions: [
          'Kalan tüm kira vadeleri yerine yalnızca adil fesih tazminat oranı (%35) tahakkuk ettirilmiştir.',
          'Fiili araç iadesinde bağımsız ekspertiz tutanağı düzenlenecek ve nihai hasar farkı netleştirilecektir.',
          'Hesaplanan bedeller temsilidir, sözleşme maddelerine göre nihai mutabakat esastır.'
        ]
      };
    } else {
      // Sözleşme Yenileme
      const currentLease = selectedContract ? selectedContract.monthlyRentAmount / selectedContract.vehicleCount : 25000;
      const newMonthlyLease = currentLease * (1 + renewalAdjustmentPercent / 100);
      const vehicleCount = selectedContract ? selectedContract.vehicleCount : 1;
      const totalFleetMonthly = newMonthlyLease * vehicleCount;
      const contractTotal = totalFleetMonthly * renewalDurationMonths;
      const vatAmount = contractTotal * (vatRate / 100);
      const grandTotal = contractTotal + vatAmount;

      return {
        formulaDescription: `Yeni Aylık Kira = Mevcut Kira (${currentLease.toLocaleString('tr-TR')} TL) × (1 + Fiyat Güncelleme Oranı [%${renewalAdjustmentPercent}]) = ${newMonthlyLease.toLocaleString('tr-TR')} TL / Araç`,
        parametersApplied: {
          'Mevcut Aylık Kira': `${currentLease.toLocaleString('tr-TR')} TL`,
          'Önerilen Fiyat Güncelleme': `%${renewalAdjustmentPercent > 0 ? '+' : ''}${renewalAdjustmentPercent}`,
          'Yeni Vade Süresi': `${renewalDurationMonths} Ay`,
          'Filo Araç Sayısı': `${vehicleCount} Araç`,
          'KDV Oranı': `%${vatRate}`
        },
        itemizedCharges: [
          {
            description: `Birim Araç Yeni Dönem Aylık Kiralama Bedeli (${newMonthlyLease.toLocaleString('tr-TR')} TL × ${vehicleCount} Araç)`,
            calculationNote: `Aylık filo toplamı: ${totalFleetMonthly.toLocaleString('tr-TR')} TL / Ay`,
            amountTRY: totalFleetMonthly
          },
          {
            description: `Toplam ${renewalDurationMonths} Aylık Yenileme Sözleşme Hacmi (Matrah)`,
            calculationNote: `${renewalDurationMonths} ay boyunca periyodik bakım, kasko ve ikame araç dahil.`,
            amountTRY: contractTotal
          }
        ],
        subtotalTRY: contractTotal,
        vatRatePercent: vatRate,
        vatAmountTRY: vatAmount,
        grandTotalTRY: grandTotal,
        assumptions: [
          `Fiyat güncelleme oranı (%${renewalAdjustmentPercent}) mevcut piyasa fonlama maliyeti ve enflasyon projeksiyonlarına göre modellenmiştir.`,
          `Yıllık 25.000 KM kullanım, periyodik yetkili servis bakımı ve kış lastiği dahildir.`,
          'Teklif 15 gün geçerlidir.'
        ]
      };
    }
  }, [selectedType, selectedContract, excessKm, remainingMonths, renewalDurationMonths, renewalAdjustmentPercent, settings]);

  // Validation before proceeding
  const handleProceedToParameters = () => {
    if (!selectedContract) {
      setValidationError('Lütfen işlem yapılacak sözleşmeyi seçin.');
      return;
    }
    setValidationError('');
    setCurrentStep('parameters');
  };

  const handleProceedToPreview = () => {
    setValidationError('');
    setCurrentStep('preview_document');
  };

  // Final Action: Save as Draft or Submit for Approval
  const handleSaveQuotation = (finalStatus: QuotationStatus) => {
    if (!selectedContract) return;

    const vehicleCount = selectedContract.vehicleCount;
    const monthlyRentPerVehicle =
      selectedType === 'Sözleşme Yenileme'
        ? (selectedContract.monthlyRentAmount / vehicleCount) * (1 + renewalAdjustmentPercent / 100)
        : calculationDetails.subtotalTRY;

    createQuotation({
      customerRef: selectedContract.customerRef,
      customerCode: selectedContract.customerCode,
      quotationType: selectedType,
      vehicleCount: vehicleCount,
      vehicleModel: selectedContract.vehicleModel,
      termMonths: selectedType === 'Sözleşme Yenileme' ? renewalDurationMonths : 12,
      annualKm: selectedContract.contractLimitKm / (selectedContract.daysUntilRenewal > 365 ? 3 : 2),
      monthlyRentPerVehicle: monthlyRentPerVehicle,
      totalMonthlyAmount: selectedType === 'Sözleşme Yenileme' ? monthlyRentPerVehicle * vehicleCount : calculationDetails.grandTotalTRY,
      grossMarginPercent: 14.5,
      customerCreditScore: 'Düşük Risk / A+',
      owner: assignedOwner,
      status: finalStatus,
      notes: quoteNotes.trim() || `${selectedContract.id} sözleşmesi için otomatik üretilen ${selectedType} teklifi.`,
      relatedContractId: selectedContract.id,
      calculationDetails: calculationDetails,
      excessMileageKm: selectedType === 'Aşırı KM Zeyilnamesi' ? excessKm : undefined,
      earlyReturnMonthsRemaining: selectedType === 'Erken Araç İadesi' ? remainingMonths : undefined,
      renewalAdjustmentPercent: selectedType === 'Sözleşme Yenileme' ? renewalAdjustmentPercent : undefined
    });

    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Otomatik Teklif & Zeyilname Motoru"
      subtitle="Sözleşme verilerinden otomatik hesaplanan resmi teklif ve zeyilname belgesi"
      maxWidth="4xl"
    >
      <div className="space-y-5 text-xs">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 'type_and_contract'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              1
            </span>
            <span className={`font-semibold ${currentStep === 'type_and_contract' ? 'text-blue-900' : 'text-slate-600'}`}>
              Teklif Türü & Sözleşme Seçimi
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-300" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 'parameters'
                  ? 'bg-blue-600 text-white'
                  : currentStep === 'preview_document'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </span>
            <span className={`font-semibold ${currentStep === 'parameters' ? 'text-blue-900' : 'text-slate-600'}`}>
              Hesaplama & Parametreler
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-300" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 'preview_document'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              3
            </span>
            <span className={`font-semibold ${currentStep === 'preview_document' ? 'text-blue-900' : 'text-slate-600'}`}>
              Resmi Belge Önizleme & Onay
            </span>
          </div>
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* ================= STEP 1: TYPE & CONTRACT SELECTION ================= */}
        {currentStep === 'type_and_contract' && (
          <div className="space-y-5">
            {/* 3 Quotation Types Cards */}
            <div>
              <label className="text-slate-700 font-bold block mb-2">
                1. Teklif Türünü Belirleyin:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Kilometre Aşımı */}
                <div
                  onClick={() => setSelectedType('Aşırı KM Zeyilnamesi')}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedType === 'Aşırı KM Zeyilnamesi'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-xs">Kilometre Aşımı</span>
                    <Car className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Sözleşme limitini aşan araçlar için odometre bazlı ek kira ve aşım faturası teklifi.
                  </p>
                </div>

                {/* 2. Erken İade */}
                <div
                  onClick={() => setSelectedType('Erken Araç İadesi')}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedType === 'Erken Araç İadesi'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-xs">Erken İade</span>
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Sözleşme bitişinden önce aracı iade etmek isteyen müşteri için amortisman ve fesih hesabı.
                  </p>
                </div>

                {/* 3. Sözleşme Yenileme */}
                <div
                  onClick={() => setSelectedType('Sözleşme Yenileme')}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedType === 'Sözleşme Yenileme'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-xs">Sözleşme Yenileme</span>
                    <Calculator className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Mevcut sözleşme süresi dolmadan yeni dönem kiralama şartları ve revize fiyat teklifi.
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Selection Search & List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-700 font-bold block">
                  2. İlgili Sözleşmeyi Seçin (Otomatik Bilgi Çekimi):
                </label>
                <span className="text-[11px] text-slate-400">
                  Müşteri, araç ve tarife bilgileri sözleşmeden otomatik aktarılacaktır.
                </span>
              </div>

              {/* Search input */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Sözleşme No (KNT-...), Müşteri Adı veya Plaka ile arayın..."
                  value={contractSearchQuery}
                  onChange={e => setContractSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Contracts List */}
              <div className="border border-slate-200 rounded-lg max-h-56 overflow-y-auto divide-y divide-slate-100">
                {filteredContracts.map(c => {
                  const isSelected = selectedContractId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedContractId(c.id)}
                      className={`p-3 cursor-pointer transition-colors flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-blue-50/80 border-l-4 border-l-blue-600 font-medium'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">{c.id}</span>
                          <span className="font-semibold text-slate-900">{c.customerRef}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({c.plate})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{c.vehicleModel}</span>
                          <span>·</span>
                          <span>{c.vehicleCount} Araç</span>
                          <span>·</span>
                          <span>Bitiş: {c.endDate} ({c.daysUntilRenewal} gün kaldı)</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-slate-900 block">
                          {c.monthlyRentAmount.toLocaleString('tr-TR')} TL / Ay
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Limit: {c.contractLimitKm.toLocaleString('tr-TR')} KM
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Contract Preview Card */}
            {selectedContract && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold">Seçilen Sözleşme: {selectedContract.id} ({selectedContract.customerRef})</span>
                    <span className="text-[11px] block text-emerald-700">
                      Tüm müşteri ve araç verileri başarıyla yüklendi. Ekstra manuel veri girişi gerekmemektedir.
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-800">
                  {selectedContract.monthlyRentAmount.toLocaleString('tr-TR')} TL/Ay
                </span>
              </div>
            )}

            {/* Navigation button */}
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleProceedToParameters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>Parametrelere Geç</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PARAMETERS & CALCULATION ================= */}
        {currentStep === 'parameters' && selectedContract && (
          <div className="space-y-5">
            {/* Automatically Retrieved Contract Data Strip */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>Sözleşmeden Otomatik Çekilen Bilgiler</span>
                <span className="font-mono text-blue-700 font-bold">{selectedContract.id}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Müşteri</span>
                  <span className="font-semibold text-slate-800">{selectedContract.customerRef}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Araç & Plaka</span>
                  <span className="font-semibold text-slate-800">{selectedContract.vehicleModel} ({selectedContract.plate})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mevcut Aylık Kira</span>
                  <span className="font-mono font-bold text-slate-900">{selectedContract.monthlyRentAmount.toLocaleString('tr-TR')} TL</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sözleşme Bitiş & KM Sınırı</span>
                  <span className="font-mono text-slate-700">{selectedContract.endDate} · {selectedContract.contractLimitKm.toLocaleString('tr-TR')} KM</span>
                </div>
              </div>
            </div>

            {/* Dynamic Inputs Based on Quotation Type */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-4">
              <h4 className="font-bold text-slate-900 text-xs flex items-center justify-between">
                <span>Hesaplama Girdileri — {selectedType}</span>
                <span className="text-blue-700 font-mono text-[11px]">
                  Fiyatlandırma Motoru v2.4
                </span>
              </h4>

              {/* 1. Excess KM Inputs */}
              {selectedType === 'Aşırı KM Zeyilnamesi' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Aşılan Kilometre Miktarı (KM) *
                    </label>
                    <input
                      type="number"
                      min={100}
                      step={500}
                      value={excessKm}
                      onChange={e => setExcessKm(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Telematik odometre verisinden türetilen fark. Düzenlenebilir.
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Birim Kilometre Ücreti (Sistem Parametresi)
                    </label>
                    <div className="p-2 bg-slate-100 rounded border border-slate-200 font-mono font-bold text-slate-800 text-xs">
                      {settings.excessMileageRatePerKm.toFixed(2)} TL / KM
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Ayarlar menüsünden parametrik olarak güncellenebilir.
                    </span>
                  </div>
                </div>
              )}

              {/* 2. Early Return Inputs */}
              {selectedType === 'Erken Araç İadesi' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Kalan Sözleşme Süresi (Ay) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={48}
                      value={remainingMonths}
                      onChange={e => setRemainingMonths(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Sözleşme bitiş tarihine ({selectedContract.endDate}) kalan ay sayısı.
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Tahmini Erken İade Tarihi
                    </label>
                    <input
                      type="date"
                      value={earlyReturnDate}
                      onChange={e => setEarlyReturnDate(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* 3. Renewal Inputs */}
              {selectedType === 'Sözleşme Yenileme' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Yeni Dönem Kiralama Vadesi (Ay) *
                    </label>
                    <select
                      value={renewalDurationMonths}
                      onChange={e => setRenewalDurationMonths(parseInt(e.target.value) || 24)}
                      className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
                    >
                      <option value={12}>12 Ay Kiralama</option>
                      <option value={24}>24 Ay Kiralama</option>
                      <option value={36}>36 Ay Kiralama</option>
                      <option value={48}>48 Ay Kiralama</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Önerilen Fiyat Güncelleme Oranı (%) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={0.5}
                        value={renewalAdjustmentPercent}
                        onChange={e => setRenewalAdjustmentPercent(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-slate-50 focus:bg-white"
                      />
                      <span className="font-mono text-slate-500 font-semibold">%</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Mevcut aylık kiraya uygulanacak enflasyon ve fonlama düzeltme oranı.
                    </span>
                  </div>
                </div>
              )}

              {/* Notes & Owner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Sorumlu Satış Destek Uzmanı
                  </label>
                  <select
                    value={assignedOwner}
                    onChange={e => setAssignedOwner(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white"
                  >
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Teklif Notları & Gerekçe
                  </label>
                  <input
                    type="text"
                    placeholder="Müşteri görüşmesi, özel indirim veya zeyilname detayı..."
                    value={quoteNotes}
                    onChange={e => setQuoteNotes(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Breakdown Preview Box */}
            <div className="p-4 bg-slate-900 text-white rounded-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Şeffaf Hesaplama Özeti
                </span>
                <span className="font-mono text-emerald-400 text-xs">
                  {calculationDetails.formulaDescription.split('=')[0]}
                </span>
              </div>

              {/* Itemized breakdown table */}
              <div className="space-y-1.5 text-xs">
                {calculationDetails.itemizedCharges.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-baseline py-0.5 border-b border-slate-800/60">
                    <div>
                      <span className="text-slate-200">{item.description}</span>
                      {item.calculationNote && (
                        <span className="text-[10px] text-slate-400 block font-mono">{item.calculationNote}</span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-slate-100 shrink-0">
                      {item.amountTRY.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                ))}

                <div className="flex justify-between items-baseline pt-2 text-slate-300">
                  <span>Ara Toplam (Matrah):</span>
                  <span className="font-mono font-bold text-slate-200">
                    {calculationDetails.subtotalTRY.toLocaleString('tr-TR')} TL
                  </span>
                </div>

                <div className="flex justify-between items-baseline text-slate-400">
                  <span>Hesaplanan KDV (%{calculationDetails.vatRatePercent}):</span>
                  <span className="font-mono text-slate-300">
                    +{calculationDetails.vatAmountTRY.toLocaleString('tr-TR')} TL
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-slate-700 text-sm font-bold text-emerald-400">
                  <span>Genel Toplam (KDV Dahil):</span>
                  <span className="font-mono text-lg text-emerald-400">
                    {calculationDetails.grandTotalTRY.toLocaleString('tr-TR')} TL
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStep('type_and_contract')}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Geri</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToPreview}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>Resmi Belgeyi Oluştur & Önizle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PROFESSIONAL QUOTATION DOCUMENT ================= */}
        {currentStep === 'preview_document' && selectedContract && (
          <div className="space-y-4">
            {/* Action Bar Above Preview */}
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep('parameters')}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded font-semibold text-xs flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Girdileri Düzenle</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded font-semibold text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Yazdır / PDF Olarak Kaydet</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveQuotation('Taslak')}
                  className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Taslak Olarak Kaydet</span>
                </button>
                <button
                  onClick={() => handleSaveQuotation('Onay Bekliyor')}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dahili Onaya Gönder</span>
                </button>
              </div>
            </div>

            {/* PRINTABLE OFFICIAL BUSINESS DOCUMENT (Section 16.F) */}
            <div
              id="quotation-document-printable"
              className="bg-white border-2 border-slate-300 rounded-lg p-8 shadow-md text-slate-900 space-y-6 print:border-none print:shadow-none print:p-0"
            >
              {/* Mandatory Prominent Demo Disclaimer Watermark (Section 16.F) */}
              <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 text-center rounded font-mono font-bold text-[11px] uppercase tracking-wider">
                DEMO BELGESİ — TUTARLAR VE HESAPLAMA KURALLARI TEMSİLİDİR. GERÇEK TİCARİ TEKLİF DEĞİLDİR.
              </div>

              {/* Document Header & Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-5">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                    SalesOps Filo Kiralama ve Operasyon A.Ş.
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ticari Satış Destek Operasyonları Müdürlüğü · Maslak, Sarıyer / İstanbul
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Mersis: 0741-0982-1200-0018 · Vergi Dairesi: Boğaziçi 7410982120
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded mb-1">
                    {generatedRefId}
                  </div>
                  <div className="text-xs text-slate-600 font-mono">
                    Düzenleme: {new Date().toLocaleDateString('tr-TR')}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Geçerlilik: {new Date(Date.now() + (settings.quotationValidityDays || 15) * 86400000).toLocaleDateString('tr-TR')} ({settings.quotationValidityDays || 15} Gün)
                  </div>
                </div>
              </div>

              {/* Document Subject Title */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Belge Konusu</span>
                  <span className="text-sm font-bold text-slate-900">{selectedType} Resmi Fiyat Teklifi ve Zeyilname Şartları</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Onay Statüsü</span>
                  <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded text-[11px] font-mono">
                    Onay Bekliyor (Dahili İnceleme)
                  </span>
                </div>
              </div>

              {/* Customer and Contract Details Grid */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                {/* Left: Customer */}
                <div className="border border-slate-200 rounded p-3 space-y-1 bg-slate-50/50">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block border-b border-slate-200 pb-1 mb-1">
                    Müşteri Bilgileri
                  </span>
                  <div>
                    <span className="text-slate-400 text-[11px]">Ünvan: </span>
                    <strong className="text-slate-900">{selectedContract.customerRef}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Müşteri No: </span>
                    <span className="font-mono text-slate-700">{selectedContract.customerCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Yetkili Sorumlu: </span>
                    <span className="text-slate-700">{assignedOwner}</span>
                  </div>
                </div>

                {/* Right: Contract & Vehicle */}
                <div className="border border-slate-200 rounded p-3 space-y-1 bg-slate-50/50">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block border-b border-slate-200 pb-1 mb-1">
                    Sözleşme & Araç Referansı
                  </span>
                  <div>
                    <span className="text-slate-400 text-[11px]">Sözleşme No: </span>
                    <strong className="font-mono text-blue-700">{selectedContract.id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Araç Modeli: </span>
                    <span className="text-slate-800 font-medium">{selectedContract.vehicleModel}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Plaka / Adet: </span>
                    <span className="font-mono text-slate-700">{selectedContract.plate} ({selectedContract.vehicleCount} Araç)</span>
                  </div>
                </div>
              </div>

              {/* Calculation & Pricing Itemization Table */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Hesaplama Kırılımı ve Hizmet Kalemleri
                </span>

                <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2.5">Sıra</th>
                      <th className="p-2.5">Hizmet / Tarife Açıklaması</th>
                      <th className="p-2.5">Hesaplama Dayanağı & Not</th>
                      <th className="p-2.5 text-right">Tutar (TL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {calculationDetails.itemizedCharges.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{item.description}</td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">{item.calculationNote || '-'}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                          {item.amountTRY.toLocaleString('tr-TR')} TL
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td colSpan={3} className="p-2.5 text-right font-bold text-slate-700">
                        Ara Toplam (KDV Matrahı):
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {calculationDetails.subtotalTRY.toLocaleString('tr-TR')} TL
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td colSpan={3} className="p-2.5 text-right text-slate-600">
                        Hesaplanan KDV (%{calculationDetails.vatRatePercent}):
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-800">
                        {calculationDetails.vatAmountTRY.toLocaleString('tr-TR')} TL
                      </td>
                    </tr>
                    <tr className="bg-slate-900 text-white font-bold">
                      <td colSpan={3} className="p-3 text-right uppercase text-xs tracking-wider">
                        Genel Toplam (KDV Dahil):
                      </td>
                      <td className="p-3 text-right font-mono text-base text-emerald-400">
                        {calculationDetails.grandTotalTRY.toLocaleString('tr-TR')} TL
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Formula & Assumptions Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                  Uygulanan Hesaplama Formülü & Ticari Koşullar
                </span>
                <p className="font-mono text-[11px] text-blue-900 bg-white p-2 rounded border border-slate-200">
                  {calculationDetails.formulaDescription}
                </p>

                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                  {calculationDetails.assumptions.map((asm, idx) => (
                    <li key={idx}>{asm}</li>
                  ))}
                  <li>Bu teklif kabul edildiğinde ilgili sözleşmeye zeyilname olarak eklenir.</li>
                </ul>
              </div>

              {/* Signatures & Approval Blocks */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Hazırlayan & Onaya Sunan
                  </span>
                  <div className="font-bold text-slate-900">{assignedOwner}</div>
                  <div className="text-[11px] text-slate-500">Satış Destek Operasyon Uzmanı</div>
                  <div className="h-12 border-b border-dashed border-slate-300 mt-2" />
                  <span className="text-[10px] text-slate-400 mt-1 block">İmza / Paraf</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Müşteri Temsilcisi Onayı
                  </span>
                  <div className="font-bold text-slate-900">{selectedContract.customerRef}</div>
                  <div className="text-[11px] text-slate-500">Filo Yetkilisi / Finans Direktörü</div>
                  <div className="h-12 border-b border-dashed border-slate-300 mt-2" />
                  <span className="text-[10px] text-slate-400 mt-1 block">Kaşe / Yetkili İmza</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStep('parameters')}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Parametreleri Değiştir</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveQuotation('Taslak')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Taslak Olarak Kaydet</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQuotation('Onay Bekliyor')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dahili Onaya Gönder</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
