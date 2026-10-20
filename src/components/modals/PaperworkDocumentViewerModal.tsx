import React from 'react';
import {
  FileText,
  X,
  Download,
  Printer,
  ShieldCheck,
  Calendar,
  ExternalLink,
  CheckCircle2,
  FileCheck2,
  Building,
  Hash,
  Clock
} from 'lucide-react';

interface PaperworkDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  entityName: string;
  contractId: string;
  documents?: Array<{
    id: string;
    title: string;
    type?: string;
    uploadedAt: string;
    fileName: string;
    status?: string;
  }>;
}

export const PaperworkDocumentViewerModal: React.FC<PaperworkDocumentViewerModalProps> = ({
  isOpen,
  onClose,
  folderId,
  entityName,
  contractId,
  documents = []
}) => {
  const [selectedDocIndex, setSelectedDocIndex] = React.useState(0);

  if (!isOpen) return null;

  const currentDoc = documents[selectedDocIndex] || {
    id: 'PW-MAIN-01',
    title: 'Ana Çerçeve Sözleşmesi & İmzalı Nüsha',
    type: 'Sözleşme',
    uploadedAt: '2026-01-10',
    fileName: `${contractId.toLowerCase()}_ana_sozlesme_imzali.pdf`,
    status: 'valid'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-blue-300">
                  Paperwork DMS • Kurumsal Belge Arşivi
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> E-İmza & KEP Doğrulandı
                </span>
              </div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 mt-0.5">
                <span>{entityName}</span>
                <span className="text-slate-400 font-mono text-xs">({contractId})</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded border border-white/15 text-slate-200">
              Klasör: {folderId}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar list + Document Viewer */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document list sidebar */}
          <div className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200 bg-white">
              <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Dijitalleştirilmiş Belgeler ({documents.length > 0 ? documents.length : 1})
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Paperwork Güvenli Doküman Kasası</p>
            </div>

            <div className="p-2 space-y-1 overflow-y-auto flex-1">
              {(documents.length > 0 ? documents : [currentDoc]).map((doc, idx) => (
                <button
                  key={doc.id || idx}
                  onClick={() => setSelectedDocIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 ${
                    selectedDocIndex === idx
                      ? 'bg-blue-50 border border-blue-200 shadow-2xs'
                      : 'hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${
                    selectedDocIndex === idx ? 'text-blue-600' : 'text-slate-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      selectedDocIndex === idx ? 'text-blue-900 font-semibold' : 'text-slate-800'
                    }`}>
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                      <span>{doc.type || 'Evrak'}</span>
                      <span>•</span>
                      <span>{doc.uploadedAt}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-slate-200 bg-white text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paperwork API v4.8
              </span>
              <span className="font-mono text-[10px] text-slate-400">SSL 256-bit</span>
            </div>
          </div>

          {/* Main preview window */}
          <div className="flex-1 bg-slate-100 p-4 flex flex-col overflow-y-auto">
            {/* Document Action Toolbar */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-xs font-bold text-slate-800">{currentDoc.title}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{currentDoc.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(`'${currentDoc.fileName}' güvenli bağlantı üzerinden indiriliyor.`)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>İndir (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır</span>
                </button>
              </div>
            </div>

            {/* Document Sheet Simulation */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-md p-8 max-w-3xl mx-auto w-full font-serif text-slate-800 space-y-6 flex-1">
              {/* Paperwork Stamp & Barcode Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 font-sans">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm tracking-widest text-slate-900">HEDEF FİLO</span>
                    <span className="text-[11px] text-slate-500">| Kurumsal Sözleşme Arşivi</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Paperwork Elektronik Belge ve Arşiv Sistemi (EBYS)</p>
                </div>
                <div className="text-right">
                  <div className="inline-block border border-dashed border-slate-400 p-1.5 rounded bg-slate-50 text-[10px] font-mono text-slate-600 text-left">
                    <div>BARKOD: <strong>PW-{contractId}-2026</strong></div>
                    <div>TARİH: {currentDoc.uploadedAt}</div>
                    <div className="text-emerald-700 font-bold">DURUM: ARŞİVLENDİ</div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h1 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  {currentDoc.title}
                </h1>
                <p className="text-xs text-slate-600 italic font-sans">
                  Sözleşme Referansı: {contractId} • Taraf: {entityName}
                </p>
              </div>

              {/* Simulated legal text */}
              <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                <p>
                  İşbu belge, <strong>Hedef Filo Hizmetleri A.Ş.</strong> ile <strong>{entityName}</strong> arasında akdedilmiş bulunan{' '}
                  <strong>{contractId}</strong> referans numaralı sözleşme ilişkisinin ayrılmaz bir parçasını teşkil etmektedir.
                </p>
                <p>
                  Belge muhteviyatındaki tüm şartlar, cezai yükümlülükler, fesih ihbar süreleri ve mali şartlar tarafların yetkili temsilcileri tarafından e-imza / noter huzurunda imza altına alınmış olup, Paperwork Dijital Arşiv Sistemi üzerinde zaman damgasıyla kriptografik olarak muhafaza edilmektedir.
                </p>

                <div className="my-4 p-4 bg-slate-50 rounded border border-slate-200 font-sans text-xs space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Paperwork Doğrulama & Zaman Damgası Özeti
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div><strong>Belge ID:</strong> {currentDoc.id}</div>
                    <div><strong>Klasör Ref:</strong> {folderId}</div>
                    <div><strong>Dosya Adı:</strong> {currentDoc.fileName}</div>
                    <div><strong>Yüklenme:</strong> {currentDoc.uploadedAt}</div>
                    <div><strong>TÜBİTAK Zaman Damgası:</strong> 20261020-093120-TR-TSA</div>
                    <div><strong>Hukuki Geçerlilik:</strong> 5070 Sayılı Elektronik İmza Kanunu Uyumlu</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  Not: Orijinal ıslak imzalı nüsha veya KEP onaylı e-imza paketi Paperwork sunucularında güvenli olarak saklanmaktadır. Gerektiğinde hukuk departmanı arşivinden fiziksel dosya talep edilebilir.
                </p>
              </div>

              {/* Signatures Footer */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-6 font-sans text-xs">
                <div className="p-3 border border-slate-200 rounded bg-slate-50/50">
                  <p className="font-bold text-slate-900">KİRAYA VEREN / FİLO YÖNETİMİ</p>
                  <p className="text-[11px] text-slate-600">Hedef Filo Hizmetleri A.Ş.</p>
                  <div className="mt-4 pt-2 border-t border-dashed border-slate-300 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> E-İmza ile Onaylanmıştır
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded bg-slate-50/50">
                  <p className="font-bold text-slate-900">MÜŞTERİ / TEDARİKÇİ</p>
                  <p className="text-[11px] text-slate-600">{entityName}</p>
                  <div className="mt-4 pt-2 border-t border-dashed border-slate-300 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Yetkili Temsilci İmzalı
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Paperwork Belge Yönetim Sistemi Entegrasyonu</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
