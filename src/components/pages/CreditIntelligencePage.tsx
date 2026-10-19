import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Building,
  CreditCard,
  DollarSign,
  ChevronRight,
  Info,
  Clock,
  Zap
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { CreditCheckRecord } from '../../types';
import { Modal } from '../common/Modal';

export const CreditIntelligencePage: React.FC = () => {
  const { creditRecords, addCreditCheck } = useSalesOps();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<CreditCheckRecord | null>(null);

  // New inquiry modal state
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [newVkn, setNewVkn] = useState('3409182390');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newVehiclesRequested, setNewVehiclesRequested] = useState<number>(5);

  const filteredRecords = creditRecords.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.companyName.toLowerCase().includes(q) ||
      r.vkn.includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  });

  const getScoreColor = (score: number) => {
    if (score >= 1600) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 1400) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 1200) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newVkn.trim()) return;

    // Simulate realistic KKB score and risk tier based on VKN
    const randomSeed = parseInt(newVkn.slice(-3)) || 500;
    const score = Math.min(1850, Math.max(1150, 1300 + (randomSeed % 550)));
    const riskTier =
      score >= 1600
        ? 'Düşük Risk / A+'
        : score >= 1400
        ? 'Orta Risk / B'
        : 'Yüksek Risk / C';

    const recommendedLimit = newVehiclesRequested * 1500000;
    const collateralType =
      riskTier === 'Düşük Risk / A+'
        ? 'Teminatsız / Açık Limit'
        : riskTier === 'Orta Risk / B'
        ? 'Doğrudan Borçlandırma (DBS)'
        : 'Banka Teminat Mektubu';

    const collateralAmount = riskTier === 'Düşük Risk / A+' ? 0 : newVehiclesRequested * 350000;

    addCreditCheck({
      vkn: newVkn.trim(),
      companyName: newCompanyName.trim(),
      kkbScore: score,
      riskTier,
      recommendedLimitTRY: recommendedLimit,
      existingExposureTRY: 0,
      availableLimitTRY: recommendedLimit,
      requiredCollateralType: collateralType,
      requiredCollateralAmountTRY: collateralAmount,
      financialSummary: {
        turnoverTRY: newVehiclesRequested * 50000000,
        equityTRY: newVehiclesRequested * 15000000,
        netProfitTRY: newVehiclesRequested * 4000000,
        year: 2025
      },
      evaluationOutcome: riskTier === 'Düşük Risk / A+' ? 'Fast-Track Onaylandı' : 'Komite Onayı Bekliyor'
    });

    setIsInquiryModalOpen(false);
    setNewCompanyName('');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Kredi İstihbarat & Otomatik Limit Tahsis Motoru
            </h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono">
              KKB / Findeks Entegre
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Müşteri vergi kimlik numarası ile KKB risk skoru, finansal yeterlilik ve sözleşme öncesi gerekli teminat (Teminat Mektubu / DBS) tutarını otomatik hesaplayın.
          </p>
        </div>

        <button
          onClick={() => setIsInquiryModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni KKB Sorgulaması Yap</span>
        </button>
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Firma ünvanı veya Vergi Kimlik No (VKN) ile ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {filteredRecords.length} İstihbarat Kaydı
        </span>
      </div>

      {/* Credit Records Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 whitespace-nowrap">Kayıt ID</th>
                <th className="py-3 px-3 min-w-[220px]">Firma Ünvanı & VKN</th>
                <th className="py-3 px-3 whitespace-nowrap">KKB Skoru</th>
                <th className="py-3 px-3 whitespace-nowrap">Risk Sınıfı</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Tahsis Edilen Limit</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Mevcut Risk / Boş Limit</th>
                <th className="py-3 px-3 whitespace-nowrap">Önerilen Teminat Şartı</th>
                <th className="py-3 px-3 whitespace-nowrap">Otomasyon Kararı</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    Kriterlere uygun istihbarat kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(rec => (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {rec.id}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{rec.companyName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        VKN: {rec.vkn} · Sorgu: {rec.inquiryDate}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getScoreColor(rec.kkbScore)}`}>
                        {rec.kkbScore} / 1900
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap font-medium">
                      {rec.riskTier}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                      {rec.recommendedLimitTRY.toLocaleString('tr-TR')} TL
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono text-[11px]">
                      <span className="text-slate-500 block">Risk: {rec.existingExposureTRY.toLocaleString('tr-TR')} TL</span>
                      <span className="text-emerald-700 font-bold block">Boş: {rec.availableLimitTRY.toLocaleString('tr-TR')} TL</span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{rec.requiredCollateralType}</span>
                      {rec.requiredCollateralAmountTRY > 0 && (
                        <span className="text-[10px] text-slate-500 block font-mono">
                          {rec.requiredCollateralAmountTRY.toLocaleString('tr-TR')} TL
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          rec.evaluationOutcome === 'Fast-Track Onaylandı'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : rec.evaluationOutcome === 'Komite Onayı Bekliyor'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : rec.evaluationOutcome === 'Ek Teminat Şartlı'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {rec.evaluationOutcome}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="text-xs text-blue-600 font-semibold hover:underline">
                        Mali Rapor →
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Record Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Kredi Değerlendirme Raporu: ${selectedRecord.companyName}`}
          subtitle={`VKN: ${selectedRecord.vkn} · Rapor ID: ${selectedRecord.id}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Score & Outcome Header */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">KKB Ticari Kredi Skoru</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl font-mono font-bold px-2 py-0.5 rounded border ${getScoreColor(selectedRecord.kkbScore)}`}>
                    {selectedRecord.kkbScore}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{selectedRecord.riskTier}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sistem Kararı</span>
                <span className="text-sm font-bold text-slate-900 block mt-1">
                  {selectedRecord.evaluationOutcome}
                </span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border border-slate-200 rounded-lg p-3 space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                {selectedRecord.financialSummary.year} Mali Tablo Özeti (GİB Onaylı)
              </span>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded">
                  <span className="text-slate-400 block text-[10px]">Yıllık Net Ciro</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedRecord.financialSummary.turnoverTRY.toLocaleString('tr-TR')} TL
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded">
                  <span className="text-slate-400 block text-[10px]">Özkaynak Toplamı</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedRecord.financialSummary.equityTRY.toLocaleString('tr-TR')} TL
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded">
                  <span className="text-slate-400 block text-[10px]">Net Dönem Karı</span>
                  <span className={`font-mono font-bold text-sm ${selectedRecord.financialSummary.netProfitTRY >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {selectedRecord.financialSummary.netProfitTRY.toLocaleString('tr-TR')} TL
                  </span>
                </div>
              </div>
            </div>

            {/* Collateral Recommendation */}
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-1">
              <span className="font-bold text-blue-900 text-xs block">Önerilen Kredi Limiti ve Teminat Şartı:</span>
              <p className="text-slate-700 leading-relaxed text-xs">
                Bu firmanın risk sınıfı ve özkaynak oranı dikkate alınarak <strong>{selectedRecord.recommendedLimitTRY.toLocaleString('tr-TR')} TL</strong> azami filo kiralama limiti uygun görülmüştür. Sözleşme başlangıcında <strong>{selectedRecord.requiredCollateralType}</strong> ({selectedRecord.requiredCollateralAmountTRY.toLocaleString('tr-TR')} TL) şart koşulmuştur.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-900"
              >
                Kapat
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Inquiry Modal */}
      {isInquiryModalOpen && (
        <Modal
          isOpen={isInquiryModalOpen}
          onClose={() => setIsInquiryModalOpen(false)}
          title="Yeni Kurumsal KKB Kredi İstihbaratı Sorgula"
          subtitle="Vergi Kimlik Numarası üzerinden KKB & Findeks risk analiz simülasyonu"
          maxWidth="md"
        >
          <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Vergi Kimlik Numarası (VKN) *</label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="10 Haneli VKN girin..."
                value={newVkn}
                onChange={e => setNewVkn(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Firma Ticari Ünvanı *</label>
              <input
                type="text"
                required
                placeholder="Örn: Vestel Dayanıklı Tüketim Malları A.Ş."
                value={newCompanyName}
                onChange={e => setNewCompanyName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Talep Edilen Araç Filosu Adedi</label>
              <input
                type="number"
                min={1}
                max={200}
                value={newVehiclesRequested}
                onChange={e => setNewVehiclesRequested(parseInt(e.target.value) || 1)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Sistem, VKN ve finansal büyüklüğe göre tahmini KKB skoru ve teminat ihtiyacını anlık modelleyecektir.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-2xs"
              >
                Sorguyu Başlat & Limit Hesapla
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
