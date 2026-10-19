import React, { useState } from 'react';
import {
  Zap,
  Play,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  ShieldCheck,
  FileCheck,
  FileText,
  Car,
  Receipt,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { AutomationRule } from '../../types';
import { Modal } from '../common/Modal';

export const AutomationPage: React.FC = () => {
  const {
    automationRules,
    toggleRule,
    updateRuleParameter,
    runRuleSimulation,
    runAllRulesEvaluation,
    estimatedHoursSavedWeekly,
    tasks,
    quotations,
    contracts,
    documents,
    disputes
  } = useSalesOps();

  // Simulation preview modal
  const [simulationResult, setSimulationResult] = useState<{
    rule: AutomationRule;
    matchedCount: number;
    matchedRecords: any[];
    simulatedActionSummary: string;
  } | null>(null);

  // Edit threshold modal
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const handleRunSimulation = (rule: AutomationRule) => {
    const res = runRuleSimulation(rule.id);
    setSimulationResult({
      rule,
      matchedCount: res.matchedCount,
      matchedRecords: res.matchedRecords,
      simulatedActionSummary: res.simulatedActionSummary
    });
  };

  const getRuleIcon = (category: string) => {
    switch (category) {
      case 'Yenileme':
        return Clock;
      case 'KM Aşımı':
        return Car;
      case 'Evrak':
        return FileCheck;
      case 'Teklif':
        return Zap;
      case 'SLA':
        return AlertTriangle;
      case 'Fatura':
        return Receipt;
      default:
        return Zap;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Weekly Hours Saved Metric */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Satış Destek Operasyonları Otomasyon Motoru
            </h2>
            <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono">
              Tetikleyici → Koşul → Taslak Aksiyon
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Filo kiralama operasyonlarındaki tekrarlayan süreçleri otomatikleştirir. Tüm kurallar "Human-in-the-loop" prensibiyle çalışır; doğrudan işlem yapmak yerine akıllı taslaklar ve öncelikli görevler üretir.
          </p>
        </div>

        {/* Estimated Hours Saved Widget */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-4 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Otomasyon Tasarruf Metriği
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold font-mono text-emerald-700">
                ~{estimatedHoursSavedWeekly} saat
              </span>
              <span className="text-[11px] text-slate-500">/ hafta</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <button
            onClick={() => runAllRulesEvaluation()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Tüm Kuralları Çalıştır</span>
          </button>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automationRules.map(rule => {
          const Icon = getRuleIcon(rule.category);
          return (
            <div
              key={rule.id}
              className={`bg-white border rounded-lg p-5 flex flex-col justify-between transition-all ${
                rule.enabled
                  ? 'border-slate-200 shadow-2xs hover:border-blue-300'
                  : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div>
                {/* Header: Name, Category, Toggle */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                        rule.enabled
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs">{rule.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        {rule.id} · {rule.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleRule(rule.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {rule.description}
                </p>

                {/* Rule Specifications: Trigger, Conditions, Action */}
                <div className="mt-3 space-y-2 text-xs bg-slate-50 p-3 rounded border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Tetikleyici (Trigger):
                    </span>
                    <span className="text-slate-800 font-medium">{rule.trigger}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Çalışma Koşulu:
                    </span>
                    <span className="text-slate-700">{rule.conditions}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Otomasyon Çıktısı (Human-in-the-Loop):
                    </span>
                    <span className="text-blue-800 font-medium">{rule.suggestedAction}</span>
                  </div>
                </div>

                {/* Parameters preview */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span className="font-semibold text-slate-700">Parametreler:</span>
                  {Object.entries(rule.parameters).map(([key, val]) => (
                    <span key={key} className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {key}: <strong className="text-slate-800">{String(val)}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Last evaluated, Matched count, Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400 font-mono">
                  Son Değerlendirme: {rule.lastEvaluated.split(' ')[1] || '09:00'} ·{' '}
                  <span className="text-blue-700 font-bold">
                    {rule.matchedCount} Eşleşen Kayıt
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                    title="Parametre Eşiklerini Düzenle"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRunSimulation(rule)}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Kuralı Test Et</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulation Result Modal */}
      {simulationResult && (
        <Modal
          isOpen={!!simulationResult}
          onClose={() => setSimulationResult(null)}
          title={`Otomasyon Test Simülasyonu: ${simulationResult.rule.name}`}
          subtitle="Kural tetiklendiğinde etkilenecek kurgusal demo kayıtlar ve üretilen aksiyon taslağı"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900">
              <span className="font-bold block text-xs">Simülasyon Değerlendirme Özeti:</span>
              <p className="mt-1 leading-relaxed">{simulationResult.simulatedActionSummary}</p>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 text-xs mb-2">
                Eşleşen Demo Kayıtlar ({simulationResult.matchedRecords.length}):
              </h5>

              {simulationResult.matchedRecords.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center text-slate-500">
                  Mevcut filtre kriterlerine uyan aktif kayıt bulunamadı.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {simulationResult.matchedRecords.map((rec: any, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-blue-700">{rec.id}</span>
                        <span className="text-slate-700 font-semibold ml-2">
                          {rec.customerRef || rec.title}
                        </span>
                        <span className="text-slate-400 text-[11px] block mt-0.5">
                          {rec.vehicleModel ? `${rec.vehicleModel} · ${rec.plate || ''}` : rec.nextAction || rec.notes}
                        </span>
                      </div>
                      <div className="text-right font-mono text-[11px] shrink-0">
                        {rec.daysUntilRenewal !== undefined && (
                          <span className="text-amber-700 font-bold block">{rec.daysUntilRenewal} gün kaldı</span>
                        )}
                        {rec.projectedOverKmPercent !== undefined && (
                          <span className="text-rose-700 font-bold block">▲ +%{rec.projectedOverKmPercent.toFixed(1)} KM</span>
                        )}
                        {rec.grossMarginPercent !== undefined && (
                          <span className="text-emerald-700 font-bold block">Marj: %{rec.grossMarginPercent}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Şeffaf Simülasyon Prensibi</span>
              </div>
              Bu simülasyon harici sistemlere (e-posta, Teams, ERP) gerçek çağrı göndermez. Eşleşen kayıtları ve iş kuyruğuna açılacak görev taslaklarını gösterir.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSimulationResult(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-900"
              >
                Kapat
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Rule Parameters Modal */}
      {editingRule && (
        <Modal
          isOpen={!!editingRule}
          onClose={() => setEditingRule(null)}
          title={`Kural Parametrelerini Düzenle: ${editingRule.name}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-500">
              Bu otomasyon kuralının tetiklenme eşik değerlerini ayarlayabilirsiniz.
            </p>

            {Object.entries(editingRule.parameters).map(([key, val]) => (
              <div key={key}>
                <label className="font-semibold text-slate-700 block mb-1 font-mono">{key}</label>
                <input
                  type={typeof val === 'number' ? 'number' : 'text'}
                  defaultValue={val}
                  onBlur={e => {
                    const newVal = typeof val === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                    updateRuleParameter(editingRule.id, key, newVal);
                  }}
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setEditingRule(null)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
              >
                Tamam
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
