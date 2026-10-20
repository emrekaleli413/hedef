import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Scale,
  Plus,
  FileText,
  Tag,
  Calendar,
  UserCheck,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useSalesOps } from '../../context/SalesOpsContext';
import { ContractClauseTemplate } from '../../types';
import { Modal } from '../common/Modal';

interface ClauseLibraryViewProps {
  onOpenGeneratorWithClause?: (clause: ContractClauseTemplate) => void;
}

export const ClauseLibraryView: React.FC<ClauseLibraryViewProps> = ({ onOpenGeneratorWithClause }) => {
  const { clauseTemplates, addClauseTemplate } = useSalesOps();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Clause Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState<ContractClauseTemplate['category']>('mileage');
  const [newRiskLevel, setNewRiskLevel] = useState<ContractClauseTemplate['riskLevel']>('standard');
  const [newStandardText, setNewStandardText] = useState('');
  const [newApprovedBy, setNewApprovedBy] = useState('Av. Zeynep Koç (Hukuk Müşaviri)');

  const categories = [
    { key: 'all', label: 'Tüm Maddeler' },
    { key: 'mileage', label: 'KM Aşımı & Havuzlama' },
    { key: 'termination', label: 'Erken İade & Fesih' },
    { key: 'indexation', label: 'TÜFE / Kira Yenileme' },
    { key: 'insurance', label: 'Kasko & Muafiyet' },
    { key: 'maintenance', label: 'Bakım & İkame' },
    { key: 'general', label: 'Kur / Genel Hükümler' }
  ];

  const handleCopyText = (clause: ContractClauseTemplate) => {
    navigator.clipboard.writeText(`${clause.code} - ${clause.title}\n\n${clause.standardText}`);
    setCopiedId(clause.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateClause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStandardText.trim()) return;

    const generatedCode = newCode.trim() || `MADDE-${newCategory.toUpperCase().slice(0, 3)}-${(clauseTemplates.length + 1).toString().padStart(2, '0')}`;

    addClauseTemplate({
      title: newTitle.trim(),
      code: generatedCode,
      category: newCategory,
      riskLevel: newRiskLevel,
      standardText: newStandardText.trim(),
      approvedBy: newApprovedBy.trim()
    });

    // Reset and close
    setNewTitle('');
    setNewCode('');
    setNewStandardText('');
    setIsAddModalOpen(false);
  };

  const filteredClauses = clauseTemplates.filter(clause => {
    if (selectedCategory !== 'all' && clause.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        clause.title.toLowerCase().includes(q) ||
        clause.code.toLowerCase().includes(q) ||
        clause.standardText.toLowerCase().includes(q) ||
        clause.approvedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Action and Filter Header */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Madde kodu, başlık veya kloz metninde ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto max-w-[500px]">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Yeni Madde Ekle</span>
        </button>
      </div>

      {/* Clause Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {filteredClauses.map(clause => {
          const isCopied = copiedId === clause.id;

          const riskBadge = {
            standard: {
              label: 'Standart Şablon (Yeşil)',
              bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
            },
            moderate: {
              label: 'Müzakere Edilebilir (Sarı)',
              bg: 'bg-amber-50 text-amber-800 border-amber-200'
            },
            high_risk: {
              label: 'Hukuk Onayı Şart (Kırmızı)',
              bg: 'bg-rose-50 text-rose-800 border-rose-200'
            }
          }[clause.riskLevel];

          return (
            <div
              key={clause.id}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between gap-3"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {clause.code}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${riskBadge.bg}`}>
                      {riskBadge.label}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyText(clause)}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded font-medium transition-colors border ${
                      isCopied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Madde metnini panoya kopyala"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Metni Kopyala</span>
                      </>
                    )}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  {clause.title}
                </h3>

                {/* Clause Body Text */}
                <div className="mt-2.5 p-3 bg-slate-50 border border-slate-100 rounded text-xs text-slate-700 leading-relaxed font-sans">
                  {clause.standardText}
                </div>
              </div>

              {/* Card Footer / Metadata */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-slate-400" />
                    Onaylayan: {clause.approvedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Onay Tarihi: {clause.legalApprovedDate}
                  </span>
                </div>

                {clause.applicableQuotationTypes && clause.applicableQuotationTypes.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-indigo-400" />
                    <span className="text-indigo-700 font-medium">
                      {clause.applicableQuotationTypes.includes('excess_mileage') && 'KM Zeyili '}
                      {clause.applicableQuotationTypes.includes('early_return') && 'Erken İade '}
                      {clause.applicableQuotationTypes.includes('contract_renewal') && 'Yenileme'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredClauses.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-400 text-xs">
          Arama kriterine uygun onaylı sözleşme maddesi bulunamadı.
        </div>
      )}

      {/* Add Clause Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Yeni Hukuk Onaylı Madde / Kloz Tanımla"
        >
          <form onSubmit={handleCreateClause} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Madde Kodu</label>
                <input
                  type="text"
                  placeholder="Örn: MADDE-KM-03 (Boş bırakılırsa oto-üretilir)"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Kategori</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="mileage">KM Aşımı & Havuzlama</option>
                  <option value="termination">Erken İade & Fesih</option>
                  <option value="indexation">TÜFE / Kira Yenileme</option>
                  <option value="insurance">Kasko & Muafiyet</option>
                  <option value="maintenance">Bakım & İkame</option>
                  <option value="general">Kur / Genel Hükümler</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Madde Başlığı</label>
              <input
                type="text"
                required
                placeholder="Örn: Özel Sektör Proje İptali Halinde Cezai Şartsız İade Klozu"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Risk Seviyesi</label>
                <select
                  value={newRiskLevel}
                  onChange={e => setNewRiskLevel(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="standard">Standart Şablon (Doğrudan Kullanılabilir)</option>
                  <option value="moderate">Müzakere Edilebilir (Satış Müdürü İnisiyatifi)</option>
                  <option value="high_risk">Yüksek Risk (Hukuk Müşavirliği Onayı Zorunlu)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Onaylayan Hukuk Yetkilisi</label>
                <input
                  type="text"
                  value={newApprovedBy}
                  onChange={e => setNewApprovedBy(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Standart Kloz Metni</label>
              <textarea
                required
                rows={4}
                placeholder="Sözleşmeye ve zeyilnameye aktarılacak yasal bağlayıcılığı olan tam metni giriniz..."
                value={newStandardText}
                onChange={e => setNewStandardText(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                Maddeyi Kaydet & Kütüphaneye Ekle
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
