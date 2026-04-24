import { useState } from 'react';
import { Deal, Company, Contact, Manager, Course, stages, sourceOptions, segmentOptions, regionOptions } from '@/data/crm';
import Icon from '@/components/ui/icon';

interface AddDealModalProps {
  defaultStageId: string;
  companies: Company[];
  contacts: Contact[];
  managers: Manager[];
  courses: Course[];
  onClose: () => void;
  onAdd: (deal: Omit<Deal, 'id' | 'createdAt' | 'history'>) => void;
  onAddCompany: (data: Omit<Company, 'id'>) => Promise<Company>;
  onAddContact: (data: Omit<Contact, 'id'>) => Promise<Contact>;
}

// ─── Quick create company panel ───────────────────────────────────────────
function QuickCompanyForm({ companies, onCreate, onSelect }: {
  companies: Company[];
  onCreate: (data: Omit<Company, 'id'>) => Promise<Company>;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [segment, setSegment] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    const co = await onCreate({ name: name.trim(), legalEntities: [], segment, region: '', city });
    onSelect(co.id);
    setOpen(false);
    setName(''); setSegment(''); setCity('');
    setLoading(false);
  };

  const inp = "w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white";

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1 mt-1 transition-colors">
        <Icon name="Plus" size={11} /> Создать новую компанию
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Новая компания</p>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Название компании *" className={inp} autoFocus />
      <div className="grid grid-cols-2 gap-2">
        <select value={segment} onChange={e => setSegment(e.target.value)} className={inp}>
          <option value="">Сегмент</option>
          {segmentOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="Город" className={inp} />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400">Отмена</button>
        <button type="button" onClick={submit} disabled={!name.trim() || loading}
          className="text-xs px-2.5 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1">
          {loading && <Icon name="Loader" size={10} className="animate-spin" />}
          Создать и выбрать
        </button>
      </div>
    </div>
  );
}

// ─── Quick create contact panel ───────────────────────────────────────────
function QuickContactForm({ companyId, onCreate, onToggle }: {
  companyId: string;
  onCreate: (data: Omit<Contact, 'id'>) => Promise<Contact>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [isDM, setIsDM] = useState(false);
  const [loading, setLoading] = useState(false);

  const inp = "w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white";

  const submit = async () => {
    if (!fullName.trim() || loading) return;
    setLoading(true);
    const ct = await onCreate({
      fullName: fullName.trim(), position,
      phones: phone ? [{ id: `p${Date.now()}`, type: 'Рабочий', value: phone }] : [],
      emails: [],
      isDecisionMaker: isDM,
      companyId,
    });
    onToggle(ct.id);
    setOpen(false);
    setFullName(''); setPosition(''); setPhone(''); setIsDM(false);
    setLoading(false);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1 mt-1 transition-colors">
        <Icon name="Plus" size={11} /> Создать новый контакт
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Новый контакт</p>
      <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="ФИО *" className={inp} autoFocus />
      <div className="grid grid-cols-2 gap-2">
        <input value={position} onChange={e => setPosition(e.target.value)} placeholder="Должность" className={inp} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7..." className={inp} />
      </div>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsDM(p => !p)}>
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isDM ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}>
          {isDM && <Icon name="Check" size={10} className="text-white" />}
        </div>
        <span className="text-xs text-slate-600">ЛПР</span>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400">Отмена</button>
        <button type="button" onClick={submit} disabled={!fullName.trim() || loading}
          className="text-xs px-2.5 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1">
          {loading && <Icon name="Loader" size={10} className="animate-spin" />}
          Создать и добавить
        </button>
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────
export default function AddDealModal({ defaultStageId, companies, contacts, managers, courses, onClose, onAdd, onAddCompany, onAddContact }: AddDealModalProps) {
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

  const toggleCourse = (id: string) =>
    set('courseIds', form.courseIds.includes(id) ? form.courseIds.filter(c => c !== id) : [...form.courseIds, id]);
  const toggleContact = (id: string) =>
    set('contactIds', form.contactIds.includes(id) ? form.contactIds.filter(c => c !== id) : [...form.contactIds, id]);

  // Local contacts updated when new contact created
  const [localContacts, setLocalContacts] = useState(contacts);
  const handleAddContact = async (data: Omit<Contact, 'id'>) => {
    const ct = await onAddContact(data);
    setLocalContacts(prev => [...prev, ct]);
    return ct;
  };

  const [localCompanies, setLocalCompanies] = useState(companies);
  const handleAddCompany = async (data: Omit<Company, 'id'>) => {
    const co = await onAddCompany(data);
    setLocalCompanies(prev => [...prev, co]);
    return co;
  };

  const companyContacts = localContacts.filter(c => c.companyId === form.companyId);

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
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col">
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

            <div>
              <label className={lbl}>Курсы</label>
              <div className="flex flex-wrap gap-1.5">
                {courses.map(c => (
                  <button key={c.id} type="button" onClick={() => toggleCourse(c.id)}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${form.courseIds.includes(c.id) ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
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
                {localCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <QuickCompanyForm
                companies={localCompanies}
                onCreate={handleAddCompany}
                onSelect={id => { set('companyId', id); set('contactIds', []); }}
              />
            </div>

            {/* Contacts */}
            {form.companyId && (
              <div>
                <label className={lbl}>Контакты</label>
                <div className="space-y-1">
                  {companyContacts.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                      <div onClick={() => toggleContact(c.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${form.contactIds.includes(c.id) ? 'bg-slate-900 border-slate-900' : 'border-slate-300 group-hover:border-slate-500'}`}>
                        {form.contactIds.includes(c.id) && <Icon name="Check" size={10} className="text-white" />}
                      </div>
                      <span className="text-sm text-slate-700">{c.fullName}</span>
                      {c.isDecisionMaker && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded">ЛПР</span>}
                    </label>
                  ))}
                </div>
                <QuickContactForm
                  companyId={form.companyId}
                  onCreate={handleAddContact}
                  onToggle={id => toggleContact(id)}
                />
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
