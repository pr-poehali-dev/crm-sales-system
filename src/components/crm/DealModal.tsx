import { useState } from 'react';
import {
  Deal, Company, Contact, Manager, Course, HistoryItem, HistoryTask,
  TaskPriority, taskPriorityLabel, stages, sourceOptions, segmentOptions, regionOptions,
  LegalEntity, Phone, Email,
} from '@/data/crm';
import Icon from '@/components/ui/icon';

interface DealModalProps {
  deal: Deal;
  companies: Company[];
  contacts: Contact[];
  managers: Manager[];
  courses: Course[];
  onClose: () => void;
  onUpdate: (deal: Deal) => void;
  onUpdateCompany: (company: Company) => void;
  onUpdateContact: (contact: Contact) => void;
}

type Tab = 'info' | 'history';

function formatDt(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const taskPriorityStyle: Record<string, string> = {
  low:    'text-slate-500 bg-slate-100',
  medium: 'text-amber-700 bg-amber-50 border border-amber-200',
  high:   'text-rose-700 bg-rose-50 border border-rose-200',
};

const taskPriorityDot: Record<string, string> = {
  low: 'bg-slate-300',
  medium: 'bg-amber-400',
  high: 'bg-rose-500',
};

// ─── Inline editable field ────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      {children}
    </div>
  );
}

function EditableText({ value, onChange, placeholder, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? '—'}
      className={`w-full text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5 transition-colors ${mono ? 'font-mono' : ''}`}
    />
  );
}

function EditableSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5 transition-colors appearance-none cursor-pointer"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function EditableDate({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5 transition-colors"
    />
  );
}

// ─── Company edit mini-modal ──────────────────────────────────────────────
function CompanyEditModal({ company, onClose, onSave }: { company: Company; onClose: () => void; onSave: (c: Company) => void }) {
  const [form, setForm] = useState<Company>({ ...company });
  const [leInput, setLeInput] = useState('');

  const addLE = () => {
    if (!leInput.trim()) return;
    setForm(p => ({ ...p, legalEntities: [...p.legalEntities, { id: `le${Date.now()}`, name: leInput.trim() }] }));
    setLeInput('');
  };

  const inp = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white";
  const lbl = "text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Редактировать компанию</h3>
          <button onClick={onClose}><Icon name="X" size={16} className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          <div><label className={lbl}>Наименование</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inp} /></div>
          <div>
            <label className={lbl}>Юр. лица</label>
            <div className="flex gap-2 mb-2">
              <input value={leInput} onChange={e => setLeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLE())} placeholder="Добавить юр. лицо" className={`${inp} flex-1`} />
              <button type="button" onClick={addLE} className="px-3 py-2 bg-slate-900 text-white rounded-lg flex-shrink-0"><Icon name="Plus" size={14} /></button>
            </div>
            {form.legalEntities.map(le => (
              <div key={le.id} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-sm mb-1">
                <span>{le.name}</span>
                <button onClick={() => setForm(p => ({ ...p, legalEntities: p.legalEntities.filter(l => l.id !== le.id) }))}><Icon name="X" size={12} className="text-slate-400 hover:text-rose-500" /></button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className={lbl}>Сегмент</label><select value={form.segment} onChange={e => setForm(p => ({ ...p, segment: e.target.value }))} className={inp}><option value="">—</option>{segmentOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className={lbl}>Регион</label><select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} className={inp}><option value="">—</option>{regionOptions.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            <div><label className={lbl}>Город</label><input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className={inp} /></div>
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2 text-sm border border-slate-200 rounded-lg text-slate-600">Отмена</button>
          <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2 text-sm bg-slate-900 text-white rounded-lg font-medium">Сохранить</button>
        </div>
      </div>
    </div>
  );
}

// ─── Contact edit mini-modal ─────────────────────────────────────────────
function ContactEditModal({ contact, companies, onClose, onSave }: {
  contact: Contact; companies: Company[]; onClose: () => void; onSave: (c: Contact) => void;
}) {
  const [form, setForm] = useState<Contact>({ ...contact, phones: contact.phones.map(p => ({ ...p })), emails: contact.emails.map(e => ({ ...e })) });
  const phoneTypes = ['Рабочий', 'Личный', 'Мобильный', 'Другой'];
  const emailTypes = ['Рабочий', 'Личный', 'Другой'];
  const inp = "px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white";
  const lbl = "text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Редактировать контакт</h3>
          <button onClick={onClose}><Icon name="X" size={16} className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          <div><label className={lbl}>ФИО</label><input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} className={`${inp} w-full`} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={lbl}>Компания</label>
              <select value={form.companyId} onChange={e => setForm(p => ({ ...p, companyId: e.target.value }))} className={`${inp} w-full`}>
                <option value="">—</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Должность</label><input value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} className={`${inp} w-full`} /></div>
          </div>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setForm(p => ({ ...p, isDecisionMaker: !p.isDecisionMaker }))}>
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${form.isDecisionMaker ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}>
              {form.isDecisionMaker && <Icon name="Check" size={10} className="text-white" />}
            </div>
            <span className="text-sm text-slate-700">ЛПР</span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1"><label className={lbl} style={{ margin: 0 }}>Телефоны</label>
              <button type="button" onClick={() => setForm(p => ({ ...p, phones: [...p.phones, { id: `ph${Date.now()}`, type: 'Рабочий', value: '' }] }))} className="text-[11px] text-slate-500 flex items-center gap-0.5"><Icon name="Plus" size={11} />Добавить</button>
            </div>
            {form.phones.map(ph => (
              <div key={ph.id} className="flex gap-2 mb-1.5">
                <select value={ph.type} onChange={e => setForm(p => ({ ...p, phones: p.phones.map(x => x.id === ph.id ? { ...x, type: e.target.value } : x) }))} className={`${inp} w-24 flex-shrink-0`}>{phoneTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                <input value={ph.value} onChange={e => setForm(p => ({ ...p, phones: p.phones.map(x => x.id === ph.id ? { ...x, value: e.target.value } : x) }))} className={`${inp} flex-1`} placeholder="+7..." />
                {form.phones.length > 1 && <button onClick={() => setForm(p => ({ ...p, phones: p.phones.filter(x => x.id !== ph.id) }))}><Icon name="X" size={13} className="text-slate-400 hover:text-rose-500" /></button>}
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1"><label className={lbl} style={{ margin: 0 }}>Email</label>
              <button type="button" onClick={() => setForm(p => ({ ...p, emails: [...p.emails, { id: `em${Date.now()}`, type: 'Рабочий', value: '' }] }))} className="text-[11px] text-slate-500 flex items-center gap-0.5"><Icon name="Plus" size={11} />Добавить</button>
            </div>
            {form.emails.map(em => (
              <div key={em.id} className="flex gap-2 mb-1.5">
                <select value={em.type} onChange={e => setForm(p => ({ ...p, emails: p.emails.map(x => x.id === em.id ? { ...x, type: e.target.value } : x) }))} className={`${inp} w-24 flex-shrink-0`}>{emailTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                <input type="email" value={em.value} onChange={e => setForm(p => ({ ...p, emails: p.emails.map(x => x.id === em.id ? { ...x, value: e.target.value } : x) }))} className={`${inp} flex-1`} placeholder="email@..." />
                {form.emails.length > 1 && <button onClick={() => setForm(p => ({ ...p, emails: p.emails.filter(x => x.id !== em.id) }))}><Icon name="X" size={13} className="text-slate-400 hover:text-rose-500" /></button>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2 text-sm border border-slate-200 rounded-lg text-slate-600">Отмена</button>
          <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-2 text-sm bg-slate-900 text-white rounded-lg font-medium">Сохранить</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main DealModal ───────────────────────────────────────────────────────
export default function DealModal({ deal, companies, contacts, managers, courses, onClose, onUpdate, onUpdateCompany, onUpdateContact }: DealModalProps) {
  const [tab, setTab] = useState<Tab>('info');
  const [historyText, setHistoryText] = useState('');
  const [historyType, setHistoryType] = useState<'comment' | 'task'>('comment');
  const [taskDueAt, setTaskDueAt] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [editContact, setEditContact] = useState<Contact | null>(null);

  const company = companies.find(c => c.id === deal.companyId);
  const dealContacts = contacts.filter(c => deal.contactIds.includes(c.id));
  const manager = managers.find(m => m.id === deal.accountManagerId);
  const dealCourses = courses.filter(c => deal.courseIds.includes(c.id));

  const upd = (patch: Partial<Deal>) => onUpdate({ ...deal, ...patch });

  const handleStageChange = (stageId: string) => {
    if (stageId === deal.stageId) return;
    const stageChangeEvent: HistoryItem = {
      id: `hs${Date.now()}`,
      type: 'stage_change',
      fromStageId: deal.stageId,
      toStageId: stageId,
      author: 'Вы',
      createdAt: new Date().toISOString(),
    };
    onUpdate({ ...deal, stageId, history: [...deal.history, stageChangeEvent] });
  };

  const addHistory = () => {
    if (!historyText.trim()) return;
    const now = new Date().toISOString();
    const newItem: HistoryItem = historyType === 'comment'
      ? { id: `h${Date.now()}`, type: 'comment', text: historyText, author: 'Вы', createdAt: now }
      : { id: `h${Date.now()}`, type: 'task', text: historyText, author: 'Вы', createdAt: now, dueAt: taskDueAt || now, done: false, priority: taskPriority };
    onUpdate({ ...deal, history: [...deal.history, newItem] });
    setHistoryText('');
    setTaskDueAt('');
    setTaskPriority('medium');
  };

  const toggleTask = (itemId: string) => {
    onUpdate({
      ...deal,
      history: deal.history.map(h =>
        h.id === itemId && h.type === 'task' ? { ...h, done: !h.done } : h
      ),
    });
  };

  const toggleCourse = (id: string) => {
    const courseIds = deal.courseIds.includes(id)
      ? deal.courseIds.filter(c => c !== id)
      : [...deal.courseIds, id];
    upd({ courseIds });
  };

  const toggleContact = (id: string) => {
    const contactIds = deal.contactIds.includes(id)
      ? deal.contactIds.filter(c => c !== id)
      : [...deal.contactIds, id];
    upd({ contactIds });
  };

  const historyCount = deal.history.filter(h => h.type !== 'stage_change').length;
  const sortedHistory = [...deal.history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <input
              value={deal.title}
              onChange={e => upd({ title: e.target.value })}
              className="text-base font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none w-full leading-tight py-0.5"
            />
            <p className="text-xs text-slate-500 mt-0.5">{company?.name ?? '—'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 transition-colors flex-shrink-0 mt-0.5">
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Stage selector */}
        <div className="px-5 py-2.5 border-b border-slate-100 flex-shrink-0 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => handleStageChange(stage.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all whitespace-nowrap ${
                  deal.stageId === stage.id
                    ? 'border-slate-900 bg-slate-900 text-white font-medium'
                    : 'border-slate-200 text-slate-500 hover:border-slate-400'
                }`}
              >
                {stage.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 flex-shrink-0">
          {(['info', 'history'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                tab === t ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'info' ? 'Информация' : (
                <span className="flex items-center gap-1.5">
                  История
                  {deal.history.length > 0 && (
                    <span className="bg-slate-100 text-slate-600 text-[10px] rounded-full px-1.5 font-mono">{deal.history.length}</span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── INFO TAB ── */}
          {tab === 'info' && (
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <Field label="Сумма (₽)">
                  <input
                    type="number"
                    value={deal.amount || ''}
                    onChange={e => upd({ amount: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full text-lg font-mono font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5"
                  />
                </Field>
                <Field label="Источник">
                  <EditableSelect
                    value={deal.source}
                    onChange={v => upd({ source: v })}
                    options={sourceOptions.map(s => ({ value: s, label: s }))}
                    placeholder="Выбрать..."
                  />
                </Field>
              </div>

              {/* Courses */}
              <Field label="Курсы">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {courses.map(c => (
                    <button
                      key={c.id}
                      onClick={() => toggleCourse(c.id)}
                      className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                        deal.courseIds.includes(c.id)
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-200 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-3 gap-5">
                <Field label="Студентов">
                  <input
                    type="number"
                    value={deal.studentCount || ''}
                    onChange={e => upd({ studentCount: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5"
                  />
                </Field>
                <Field label="Дата старта">
                  <EditableDate value={deal.startDate} onChange={v => upd({ startDate: v })} />
                </Field>
                <Field label="Дата окончания">
                  <EditableDate value={deal.endDate} onChange={v => upd({ endDate: v })} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Аккаунт менеджер">
                  <EditableSelect
                    value={deal.accountManagerId}
                    onChange={v => upd({ accountManagerId: v })}
                    options={managers.map(m => ({ value: m.id, label: m.name }))}
                    placeholder="Выбрать..."
                  />
                </Field>
                <Field label="Номер счёта">
                  <EditableText value={deal.invoiceNumber} onChange={v => upd({ invoiceNumber: v })} placeholder="СЧ-2026/001" mono />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Дата выставления счёта">
                  <EditableDate value={deal.invoiceDate} onChange={v => upd({ invoiceDate: v })} />
                </Field>
                <Field label="Дата оплаты">
                  <EditableDate value={deal.paymentDate} onChange={v => upd({ paymentDate: v })} />
                </Field>
              </div>

              {/* Company block */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Компания</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <EditableSelect
                      value={deal.companyId}
                      onChange={v => upd({ companyId: v })}
                      options={companies.map(c => ({ value: c.id, label: c.name }))}
                      placeholder="Выбрать компанию..."
                    />
                  </div>
                  {company && (
                    <button
                      onClick={() => setEditCompany(company)}
                      className="flex-shrink-0 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded px-2 py-1 transition-colors"
                    >
                      <Icon name="Pencil" size={11} /> Открыть
                    </button>
                  )}
                </div>
                {company && (
                  <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-slate-500">
                    {company.segment && <span className="flex items-center gap-1"><Icon name="Tag" size={10} />{company.segment}</span>}
                    {company.city && <span className="flex items-center gap-1"><Icon name="MapPin" size={10} />{company.city}</span>}
                    {company.legalEntities.map(le => (
                      <span key={le.id} className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{le.name}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Contacts block */}
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">Контакты</p>
                <div className="space-y-1.5">
                  {contacts.filter(c => c.companyId === deal.companyId || deal.contactIds.includes(c.id)).map(c => {
                    const checked = deal.contactIds.includes(c.id);
                    return (
                      <div key={c.id} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${checked ? 'border-slate-300 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}>
                        <div
                          onClick={() => toggleContact(c.id)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${checked ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}
                        >
                          {checked && <Icon name="Check" size={10} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-slate-800">{c.fullName}</span>
                          {c.position && <span className="text-xs text-slate-500 ml-2">{c.position}</span>}
                          {c.isDecisionMaker && <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-700 px-1 rounded border border-emerald-200">ЛПР</span>}
                        </div>
                        {checked && (
                          <button
                            onClick={() => setEditContact(c)}
                            className="flex-shrink-0 flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 border border-slate-200 rounded px-1.5 py-0.5 transition-colors"
                          >
                            <Icon name="Pencil" size={10} /> Открыть
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {contacts.filter(c => c.companyId === deal.companyId || deal.contactIds.includes(c.id)).length === 0 && (
                    <p className="text-xs text-slate-400 italic">Выберите компанию, чтобы привязать контакты</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {tab === 'history' && (
            <div className="p-5 flex flex-col gap-4">
              {/* Add form */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex gap-2 mb-2">
                  {(['comment', 'task'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setHistoryType(t)}
                      className={`text-xs px-2.5 py-1 rounded border transition-colors ${historyType === t ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
                    >
                      {t === 'comment' ? 'Комментарий' : 'Задача'}
                    </button>
                  ))}
                </div>
                <textarea
                  value={historyText}
                  onChange={e => setHistoryText(e.target.value)}
                  placeholder={historyType === 'comment' ? 'Написать комментарий...' : 'Описание задачи...'}
                  rows={2}
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-slate-400 bg-white"
                />
                {historyType === 'task' && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Срок выполнения</label>
                      <input type="datetime-local" value={taskDueAt} onChange={e => setTaskDueAt(e.target.value)} className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-slate-400 bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Приоритет</label>
                      <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as TaskPriority)} className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-slate-400 bg-white">
                        <option value="high">Высокий</option>
                        <option value="medium">Средний</option>
                        <option value="low">Низкий</option>
                      </select>
                    </div>
                  </div>
                )}
                <div className="flex justify-end mt-2">
                  <button onClick={addHistory} disabled={!historyText.trim()} className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40 transition-colors">
                    {historyType === 'comment' ? 'Добавить' : 'Создать задачу'}
                  </button>
                </div>
              </div>

              {/* History items */}
              <div className="space-y-2">
                {sortedHistory.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">История пуста</p>
                )}
                {sortedHistory.map((item) => {
                  if (item.type === 'stage_change') {
                    const from = stages.find(s => s.id === item.fromStageId);
                    const to = stages.find(s => s.id === item.toStageId);
                    return (
                      <div key={item.id} className="flex items-center gap-2 text-xs text-slate-500 py-1">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Icon name="ArrowRight" size={10} className="text-slate-400" />
                        </div>
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{from?.name ?? item.fromStageId}</span>
                          <Icon name="ArrowRight" size={10} />
                          <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded">{to?.name ?? item.toStageId}</span>
                          <span className="text-slate-400">· {item.author} · {formatDt(item.createdAt)}</span>
                        </span>
                      </div>
                    );
                  }

                  if (item.type === 'task') {
                    const isOverdue = !item.done && new Date(item.dueAt) < new Date();
                    return (
                      <div key={item.id} className={`rounded-lg p-3 border ${isOverdue ? 'bg-rose-50 border-rose-200' : item.done ? 'bg-emerald-50 border-emerald-200 opacity-70' : 'bg-blue-50 border-blue-100'}`}>
                        <div className="flex items-start gap-2">
                          <button onClick={() => toggleTask(item.id)} className="mt-0.5 flex-shrink-0">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${item.done ? 'bg-emerald-500 border-emerald-500' : isOverdue ? 'border-rose-400' : 'border-slate-300 hover:border-slate-500'}`}>
                              {item.done && <Icon name="Check" size={10} className="text-white" />}
                            </div>
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className={`text-sm text-slate-800 flex-1 ${item.done ? 'line-through text-slate-400' : ''}`}>{item.text}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${taskPriorityStyle[item.priority]}`}>
                                {taskPriorityLabel[item.priority]}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1"><Icon name="User" size={10} />{item.author}</span>
                              <span className="flex items-center gap-1"><Icon name="Clock" size={10} />{formatDt(item.createdAt)}</span>
                              <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600' : item.done ? 'text-emerald-600' : 'text-blue-600'}`}>
                                <Icon name="CalendarClock" size={10} />
                                {item.done ? 'Выполнено' : isOverdue ? `Просрочено · ${formatDt(item.dueAt)}` : `До: ${formatDt(item.dueAt)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // comment
                  return (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Icon name="MessageSquare" size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-800">{item.text}</p>
                          <div className="flex gap-3 mt-1 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1"><Icon name="User" size={10} />{item.author}</span>
                            <span className="flex items-center gap-1"><Icon name="Clock" size={10} />{formatDt(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {editCompany && (
        <CompanyEditModal
          company={editCompany}
          onClose={() => setEditCompany(null)}
          onSave={(c) => { onUpdateCompany(c); setEditCompany(null); }}
        />
      )}

      {editContact && (
        <ContactEditModal
          contact={editContact}
          companies={companies}
          onClose={() => setEditContact(null)}
          onSave={(c) => { onUpdateContact(c); setEditContact(null); }}
        />
      )}
    </div>
  );
}
