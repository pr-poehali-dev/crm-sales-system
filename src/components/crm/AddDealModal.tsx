import { useState } from 'react';
import { Deal, Company, Contact, Manager, Course, stages, sourceOptions } from '@/data/crm';
import Icon from '@/components/ui/icon';

interface AddDealModalProps {
  defaultStageId: string;
  companies: Company[];
  contacts: Contact[];
  managers: Manager[];
  courses: Course[];
  onClose: () => void;
  onAdd: (deal: Omit<Deal, 'id' | 'createdAt' | 'history'>) => void;
}

export default function AddDealModal({ defaultStageId, companies, contacts, managers, courses, onClose, onAdd }: AddDealModalProps) {
  const [form, setForm] = useState({
    title: '',
    stageId: defaultStageId,
    amount: '',
    source: '',
    courseIds: [] as string[],
    studentCount: '',
    startDate: '',
    endDate: '',
    accountManagerId: '',
    invoiceNumber: '',
    invoiceDate: '',
    paymentDate: '',
    companyId: '',
    contactIds: [] as string[],
    tags: '',
  });

  const set = (k: keyof typeof form, v: string | string[]) => setForm(prev => ({ ...prev, [k]: v }));

  const toggleCourse = (id: string) => {
    set('courseIds', form.courseIds.includes(id) ? form.courseIds.filter(c => c !== id) : [...form.courseIds, id]);
  };
  const toggleContact = (id: string) => {
    set('contactIds', form.contactIds.includes(id) ? form.contactIds.filter(c => c !== id) : [...form.contactIds, id]);
  };

  const companyContacts = contacts.filter(c => c.companyId === form.companyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd({
      title: form.title,
      stageId: form.stageId,
      amount: Number(form.amount) || 0,
      source: form.source,
      courseIds: form.courseIds,
      studentCount: Number(form.studentCount) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
      accountManagerId: form.accountManagerId,
      invoiceNumber: form.invoiceNumber,
      invoiceDate: form.invoiceDate,
      paymentDate: form.paymentDate,
      companyId: form.companyId,
      contactIds: form.contactIds,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
    onClose();
  };

  const inp = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors bg-white";
  const lbl = "text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900">Новая сделка</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-5 space-y-4">
            <div>
              <label className={lbl}>Название *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Название сделки" required className={inp} />
            </div>

            <div>
              <label className={lbl}>Этап</label>
              <select value={form.stageId} onChange={e => set('stageId', e.target.value)} className={inp}>
                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Сумма (₽)</label>
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" className={`${inp} font-mono`} />
              </div>
              <div>
                <label className={lbl}>Источник</label>
                <select value={form.source} onChange={e => set('source', e.target.value)} className={inp}>
                  <option value="">Выбрать...</option>
                  {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Courses */}
            <div>
              <label className={lbl}>Курсы</label>
              <div className="flex flex-wrap gap-1.5">
                {courses.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCourse(c.id)}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${form.courseIds.includes(c.id) ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Студентов</label>
                <input type="number" value={form.studentCount} onChange={e => set('studentCount', e.target.value)} placeholder="0" className={inp} />
              </div>
              <div>
                <label className={lbl}>Дата старта</label>
                <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Дата окончания</label>
                <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inp} />
              </div>
            </div>

            <div>
              <label className={lbl}>Аккаунт менеджер</label>
              <select value={form.accountManagerId} onChange={e => set('accountManagerId', e.target.value)} className={inp}>
                <option value="">Выбрать...</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Номер счета</label>
                <input value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} placeholder="СЧ-2026/001" className={inp} />
              </div>
              <div>
                <label className={lbl}>Дата выставления</label>
                <input type="date" value={form.invoiceDate} onChange={e => set('invoiceDate', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Дата оплаты</label>
                <input type="date" value={form.paymentDate} onChange={e => set('paymentDate', e.target.value)} className={inp} />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className={lbl}>Компания</label>
              <select value={form.companyId} onChange={e => { set('companyId', e.target.value); set('contactIds', []); }} className={inp}>
                <option value="">Выбрать...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Contacts */}
            {form.companyId && companyContacts.length > 0 && (
              <div>
                <label className={lbl}>Контакты</label>
                <div className="space-y-1">
                  {companyContacts.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                      <div
                        onClick={() => toggleContact(c.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${form.contactIds.includes(c.id) ? 'bg-slate-900 border-slate-900' : 'border-slate-300 group-hover:border-slate-500'}`}
                      >
                        {form.contactIds.includes(c.id) && <Icon name="Check" size={10} className="text-white" />}
                      </div>
                      <span className="text-sm text-slate-700">{c.fullName}</span>
                      {c.isDecisionMaker && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded">ЛПР</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 px-5 pb-5 flex-shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 transition-colors">
              Отмена
            </button>
            <button type="submit" className="flex-1 py-2.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium">
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}