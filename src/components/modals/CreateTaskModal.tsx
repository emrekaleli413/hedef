import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useSalesOps } from '../../context/SalesOpsContext';
import { ProcessType, TaskPriority } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { createTask, teamMembers } = useSalesOps();

  const [title, setTitle] = useState('');
  const [customerRef, setCustomerRef] = useState('');
  const [customerCode, setCustomerCode] = useState('CUST-100');
  const [processType, setProcessType] = useState<ProcessType>('Teklif Hazırlama');
  const [owner, setOwner] = useState(teamMembers[0]?.name || 'Burak Kaya');
  const [priority, setPriority] = useState<TaskPriority>('Orta');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [whatNeedsToBeDone, setWhatNeedsToBeDone] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [blocker, setBlocker] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerRef.trim()) {
      setError('Lütfen görev başlığı ve müşteri referansını eksiksiz doldurun.');
      return;
    }

    createTask({
      title: title.trim(),
      customerRef: customerRef.trim(),
      customerCode: customerCode.trim() || 'CUST-100',
      processType,
      owner,
      priority,
      dueDate,
      whatNeedsToBeDone: whatNeedsToBeDone.trim() || title.trim(),
      nextAction: nextAction.trim() || 'İlk inceleme başlatılacak',
      blocker: blocker.trim() || 'Engel bulunmuyor',
      sourceSystem: 'Manuel',
      status: 'Yeni'
    });

    // Reset & close
    setTitle('');
    setCustomerRef('');
    setWhatNeedsToBeDone('');
    setNextAction('');
    setBlocker('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yeni Operasyonel Görev Oluştur"
      subtitle="Filo satış destek süreç kuyruğuna yeni iş kaydı ekleyin"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Görev Başlığı *
          </label>
          <input
            type="text"
            required
            placeholder="Örn: Trendyol Express - 15 Araçlık Sözleşme Yenileme Teklif Hazırlığı"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Müşteri Ünvanı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Ekol Lojistik A.Ş."
              value={customerRef}
              onChange={e => setCustomerRef(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Müşteri Kodu
            </label>
            <input
              type="text"
              placeholder="Örn: CUST-409"
              value={customerCode}
              onChange={e => setCustomerCode(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Süreç Tipi
            </label>
            <select
              value={processType}
              onChange={e => setProcessType(e.target.value as ProcessType)}
              className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden bg-white"
            >
              <option value="Teklif Hazırlama">Teklif Hazırlama</option>
              <option value="Sözleşme Yenileme">Sözleşme Yenileme</option>
              <option value="Erken İade">Erken İade</option>
              <option value="Aşırı KM">Aşırı KM</option>
              <option value="Evrak Takibi">Evrak Takibi</option>
              <option value="Fatura İtirazı">Fatura İtirazı</option>
              <option value="Müşteri Takibi">Müşteri Takibi</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Sorumlu Uzman
            </label>
            <select
              value={owner}
              onChange={e => setOwner(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden bg-white"
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
              Öncelik
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden bg-white"
            >
              <option value="Düşük">Düşük</option>
              <option value="Orta">Orta</option>
              <option value="Yüksek">Yüksek</option>
              <option value="Kritik">Kritik</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Hedef Termin Tarihi
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Bir Sonraki Aksiyon
            </label>
            <input
              type="text"
              placeholder="Örn: Müşteri filo müdürü aranacak ve opsiyonlar iletilecek"
              value={nextAction}
              onChange={e => setNextAction(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Ne Yapılması Gerekiyor? (İşin Tanımı)
          </label>
          <textarea
            rows={2}
            placeholder="Bu görev tamamlandığında ne elde edilecek? Müşteri talepleri ve operasyonel hedefler..."
            value={whatNeedsToBeDone}
            onChange={e => setWhatNeedsToBeDone(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Mevcut Engel / Blocker (Varsa)
          </label>
          <input
            type="text"
            placeholder="Örn: İkinci el ekspertiz raporu henüz tamamlanmadı"
            value={blocker}
            onChange={e => setBlocker(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded p-2 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium border border-slate-300 rounded hover:bg-slate-50 text-slate-700"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shadow-2xs"
          >
            Görevi Kaydet
          </button>
        </div>
      </form>
    </Modal>
  );
};
