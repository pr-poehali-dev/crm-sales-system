import { useState } from 'react';
import { Deal, Stage, stages } from '@/data/crm';
import Icon from '@/components/ui/icon';

interface AddDealModalProps {
  defaultStageId: string;
  onClose: () => void;
  onAdd: (deal: Omit<Deal, 'id' | 'createdAt'>) => void;
}

export default function AddDealModal({ defaultStageId, onClose, onAdd }: AddDealModalProps) {
  const [form, setForm] = useState({
    title: '',
    company: '',
    contact: '',
    amount: '',
    stageId: defaultStageId,
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd({
      title: form.title,
      company: form.company,
      contact: form.contact,
      amount: Number(form.amount) || 0,
      stageId: form.stageId,
      priority: form.priority,
      dueDate: form.dueDate || new Date().toISOString().split('T')[0],
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Новая сделка</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Название *</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Название сделки"
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Компания</label>
              <input
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                placeholder="ООО Название"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Контакт</label>
              <input
                value={form.contact}
                onChange={e => setForm({ ...form, contact: e.target.value })}
                placeholder="Иван Петров"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Сумма (₽)</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="100000"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Срок</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Этап</label>
              <select
                value={form.stageId}
                onChange={e => setForm({ ...form, stageId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors bg-white cursor-pointer"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Приоритет</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors bg-white cursor-pointer"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Теги (через запятую)</label>
            <input
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              placeholder="IT, Крупный, SaaS"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              Создать сделку
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
