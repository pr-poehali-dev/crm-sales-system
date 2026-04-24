import { useState, useRef, useEffect } from 'react';
import {
  Deal, Company, Contact, Manager, Course, HistoryItem, HistoryTask,
  TaskPriority, taskPriorityLabel, stages, sourceOptions, segmentOptions, regionOptions,
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
  onDelete: (id: string) => void;
  onUpdateCompany: (company: Company) => Promise<void>;
  onUpdateContact: (contact: Contact) => Promise<void>;
  onAddCompany: (data: Omit<Company, 'id'>) => Promise<Company>;
  onAddContact: (data: Omit<Contact, 'id'>) => Promise<Contact>;
  onAddCourse: (name: string) => Promise<Course>;
  onUpdateCourse: (course: Course) => Promise<void>;
}

type Tab = 'info' | 'history';

function formatDt(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatDate(s: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

const taskPriorityStyle: Record<string, string> = {
  low:    'text-slate-500 bg-slate-100',
  medium: 'text-amber-700 bg-amber-50 border border-amber-200',
  high:   'text-rose-700 bg-rose-50 border border-rose-200',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      {children}
    </div>
  );
}

const inpCls = "w-full text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5 transition-colors";
const modalInp = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white";
const modalLbl = "text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1";

function EditableText({ value, onChange, placeholder, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder ?? '—'} className={`${inpCls} ${mono ? 'font-mono' : ''}`} />;
}
function EditableSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={`${inpCls} appearance-none cursor-pointer`}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function EditableDate({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input type="date" value={value} onChange={e => onChange(e.target.value)} className={inpCls} />;
}

// ─── Dropdown multiselect для курсов ─────────────────────────────────────
function CoursesDropdown({ courses, selected, onToggle, onAddNew, onEditCourse }: {
  courses: Course[];
  selected: string[];
  onToggle: (id: string) => void;
  onAddNew: () => void;
  onEditCourse: (c: Course) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selectedNames = courses.filter(c => selected.includes(c.id)).map(c => c.name);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5 transition-colors text-left">
        <span className={selectedNames.length ? '' : 'text-slate-400'}>
          {selectedNames.length ? selectedNames.join(', ') : 'Выбрать курсы...'}
        </span>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={13} className="text-slate-400 flex-shrink-0 ml-2" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-52 overflow-y-auto">
          {courses.map(c => (
            <div key={c.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer group">
              <div onClick={() => onToggle(c.id)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected.includes(c.id) ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}>
                {selected.includes(c.id) && <Icon name="Check" size={10} className="text-white" />}
              </div>
              <span onClick={() => onToggle(c.id)} className="flex-1 text-sm text-slate-700">{c.name}</span>
              <button onClick={() => { onEditCourse(c); setOpen(false); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition-all">
                <Icon name="Pencil" size={11} />
              </button>
            </div>
          ))}
          <button onClick={() => { onAddNew(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 border-t border-slate-100">
            <Icon name="Plus" size={12} /> Добавить курс
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Overlay mini-modal wrapper ───────────────────────────────────────────
function MiniModal({ title, onClose, children, footer }: {
  title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
          <button onClick={onClose}><Icon name="X" size={15} className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-3">{children}</div>
        <div className="flex gap-2 px-5 pb-5 flex-shrink-0 border-t border-slate-100 pt-4">{footer}</div>
      </div>
    </div>
  );
}

// ─── Company modal ────────────────────────────────────────────────────────
function CompanyModal({ company, onClose, onSave }: {
  company: Company | null; onClose: () => void; onSave: (c: Omit<Company, 'id'> & { id?: string }) => void;
}) {
  const blank: Omit<Company, 'id'> = { name: '', legalEntities: [], segment: '', region: '', city: '' };
  const [form, setForm] = useState<Omit<Company, 'id'> & { id?: string }>(company ? { ...company } : blank);
  const [leInput, setLeInput] = useState('');
  const addLE = () => {
    if (!leInput.trim()) return;
    setForm(p => ({ ...p, legalEntities: [...p.legalEntities, { id: `le${Date.now()}`, name: leInput.trim() }] }));
    setLeInput('');
  };
  return (
    <MiniModal title={company ? 'Редактировать компанию' : 'Новая компания'} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 py-2 text-sm border border-slate-200 rounded-lg text-slate-600">Отмена</button>
        <button onClick={() => { if (form.name.trim()) { onSave(form); onClose(); } }} className="flex-1 py-2 text-sm bg-slate-900 text-white rounded-lg font-medium">Сохранить</button>
      </>}>
      <div><label className={modalLbl}>Наименование *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={modalInp} /></div>
      <div>
        <label className={modalLbl}>Юр. лица</label>
        <div className="flex gap-2 mb-2">
          <input value={leInput} onChange={e => setLeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLE())} placeholder="Добавить юр. лицо" className={`${modalInp} flex-1`} />
          <button onClick={addLE} className="px-3 py-2 bg-slate-900 text-white rounded-lg flex-shrink-0"><Icon name="Plus" size={13} /></button>
        </div>
        {form.legalEntities.map(le => (
          <div key={le.id} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-sm mb-1">
            <span>{le.name}</span>
            <button onClick={() => setForm(p => ({ ...p, legalEntities: p.legalEntities.filter(l => l.id !== le.id) }))}><Icon name="X" size={12} className="text-slate-400 hover:text-rose-500" /></button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div><label className={modalLbl}>Сегмент</label><select value={form.segment} onChange={e => setForm(p => ({ ...p, segment: e.target.value }))} className={modalInp}><option value="">—</option>{segmentOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><label className={modalLbl}>Регион</label><select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} className={modalInp}><option value="">—</option>{regionOptions.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
        <div><label className={modalLbl}>Город</label><input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className={modalInp} /></div>
      </div>
    </MiniModal>
  );
}

// ─── Contact modal ────────────────────────────────────────────────────────
function ContactModal({ contact, companies, onClose, onSave }: {
  contact: Contact | null; companies: Company[]; onClose: () => void; onSave: (c: Omit<Contact, 'id'> & { id?: string }) => void;
}) {
  const blank: Omit<Contact, 'id'> = { fullName: '', phones: [{ id: 'p_new', type: 'Рабочий', value: '' }], emails: [{ id: 'e_new', type: 'Рабочий', value: '' }], position: '', isDecisionMaker: false, companyId: '' };
  const [form, setForm] = useState<Omit<Contact, 'id'> & { id?: string }>(contact
    ? { ...contact, phones: contact.phones.map(p => ({ ...p })), emails: contact.emails.map(e => ({ ...e })) }
    : blank);
  const phoneTypes = ['Рабочий', 'Личный', 'Мобильный', 'Другой'];
  const emailTypes = ['Рабочий', 'Личный', 'Другой'];
  const sInp = "px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white";
  return (
    <MiniModal title={contact ? 'Редактировать контакт' : 'Новый контакт'} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 py-2 text-sm border border-slate-200 rounded-lg text-slate-600">Отмена</button>
        <button onClick={() => { if (form.fullName.trim()) { onSave(form); onClose(); } }} className="flex-1 py-2 text-sm bg-slate-900 text-white rounded-lg font-medium">Сохранить</button>
      </>}>
      <div><label className={modalLbl}>ФИО *</label><input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} className={`${sInp} w-full`} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={modalLbl}>Компания</label>
          <select value={form.companyId} onChange={e => setForm(p => ({ ...p, companyId: e.target.value }))} className={`${sInp} w-full`}>
            <option value="">—</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className={modalLbl}>Должность</label><input value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} className={`${sInp} w-full`} /></div>
      </div>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setForm(p => ({ ...p, isDecisionMaker: !p.isDecisionMaker }))}>
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${form.isDecisionMaker ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}>
          {form.isDecisionMaker && <Icon name="Check" size={10} className="text-white" />}
        </div>
        <span className="text-sm text-slate-700">ЛПР (Лицо, принимающее решения)</span>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={modalLbl} style={{ marginBottom: 0 }}>Телефоны</label>
          <button onClick={() => setForm(p => ({ ...p, phones: [...p.phones, { id: `ph${Date.now()}`, type: 'Рабочий', value: '' }] }))} className="text-[11px] text-slate-500 flex items-center gap-0.5 hover:text-slate-700"><Icon name="Plus" size={11} />Добавить</button>
        </div>
        {form.phones.map(ph => (
          <div key={ph.id} className="flex gap-2 mb-1.5">
            <select value={ph.type} onChange={e => setForm(p => ({ ...p, phones: p.phones.map(x => x.id === ph.id ? { ...x, type: e.target.value } : x) }))} className={`${sInp} w-24 flex-shrink-0`}>{phoneTypes.map(t => <option key={t}>{t}</option>)}</select>
            <input value={ph.value} onChange={e => setForm(p => ({ ...p, phones: p.phones.map(x => x.id === ph.id ? { ...x, value: e.target.value } : x) }))} className={`${sInp} flex-1`} placeholder="+7..." />
            {form.phones.length > 1 && <button onClick={() => setForm(p => ({ ...p, phones: p.phones.filter(x => x.id !== ph.id) }))}><Icon name="X" size={13} className="text-slate-400 hover:text-rose-500" /></button>}
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={modalLbl} style={{ marginBottom: 0 }}>Email</label>
          <button onClick={() => setForm(p => ({ ...p, emails: [...p.emails, { id: `em${Date.now()}`, type: 'Рабочий', value: '' }] }))} className="text-[11px] text-slate-500 flex items-center gap-0.5 hover:text-slate-700"><Icon name="Plus" size={11} />Добавить</button>
        </div>
        {form.emails.map(em => (
          <div key={em.id} className="flex gap-2 mb-1.5">
            <select value={em.type} onChange={e => setForm(p => ({ ...p, emails: p.emails.map(x => x.id === em.id ? { ...x, type: e.target.value } : x) }))} className={`${sInp} w-24 flex-shrink-0`}>{emailTypes.map(t => <option key={t}>{t}</option>)}</select>
            <input type="email" value={em.value} onChange={e => setForm(p => ({ ...p, emails: p.emails.map(x => x.id === em.id ? { ...x, value: e.target.value } : x) }))} className={`${sInp} flex-1`} placeholder="email@..." />
            {form.emails.length > 1 && <button onClick={() => setForm(p => ({ ...p, emails: p.emails.filter(x => x.id !== em.id) }))}><Icon name="X" size={13} className="text-slate-400 hover:text-rose-500" /></button>}
          </div>
        ))}
      </div>
    </MiniModal>
  );
}

// ─── Course modal ─────────────────────────────────────────────────────────
function CourseModal({ course, onClose, onSave }: {
  course: Course | null; onClose: () => void; onSave: (name: string, id?: string) => void;
}) {
  const [name, setName] = useState(course?.name ?? '');
  return (
    <MiniModal title={course ? 'Редактировать курс' : 'Новый курс'} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 py-2 text-sm border border-slate-200 rounded-lg text-slate-600">Отмена</button>
        <button onClick={() => { if (name.trim()) { onSave(name.trim(), course?.id); onClose(); } }} className="flex-1 py-2 text-sm bg-slate-900 text-white rounded-lg font-medium">Сохранить</button>
      </>}>
      <div><label className={modalLbl}>Название курса *</label><input value={name} onChange={e => setName(e.target.value)} className={modalInp} placeholder="Название курса" autoFocus /></div>
    </MiniModal>
  );
}

// ─── Task edit form ───────────────────────────────────────────────────────
function TaskEditForm({ task, onSave, onCancel }: {
  task: HistoryTask; onSave: (updated: HistoryTask) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({ text: task.text, dueAt: task.dueAt ? task.dueAt.slice(0, 16) : '', priority: task.priority });
  return (
    <div className="mt-2 space-y-2 bg-slate-50 rounded-lg p-3 border border-slate-200">
      <textarea value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} rows={2}
        className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-slate-400 bg-white" />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Срок</label>
          <input type="datetime-local" value={form.dueAt} onChange={e => setForm(p => ({ ...p, dueAt: e.target.value }))}
            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-slate-400 bg-white" />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Приоритет</label>
          <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))}
            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-slate-400 bg-white">
            <option value="high">Высокий</option><option value="medium">Средний</option><option value="low">Низкий</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-xs px-3 py-1.5 border border-slate-200 rounded-md text-slate-600 hover:border-slate-400">Отмена</button>
        <button onClick={() => onSave({ ...task, text: form.text, dueAt: form.dueAt, priority: form.priority })} disabled={!form.text.trim()}
          className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40">Сохранить</button>
      </div>
    </div>
  );
}

// ─── Tag editor ───────────────────────────────────────────────────────────
function TagEditor({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };
  return (
    <div className="flex flex-wrap gap-1.5 mt-1 items-center">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
          {t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} className="text-slate-400 hover:text-rose-500 transition-colors"><Icon name="X" size={9} /></button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        placeholder="+ тег"
        className="text-xs border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent py-0.5 w-20" />
    </div>
  );
}

// ─── Main DealModal ───────────────────────────────────────────────────────
export default function DealModal({
  deal, companies, contacts, managers, courses, onClose, onUpdate, onDelete,
  onUpdateCompany, onUpdateContact, onAddCompany, onAddContact, onAddCourse, onUpdateCourse,
}: DealModalProps) {
  const [tab, setTab] = useState<Tab>('info');
  const [historyText, setHistoryText] = useState('');
  const [historyType, setHistoryType] = useState<'comment' | 'task'>('comment');
  const [taskDueAt, setTaskDueAt] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const company = companies.find(c => c.id === deal.companyId);
  const dealContacts = contacts.filter(c => deal.contactIds.includes(c.id));
  const manager = managers.find(m => m.id === deal.accountManagerId);

  const upd = (patch: Partial<Deal>) => onUpdate({ ...deal, ...patch });

  const handleStageChange = (stageId: string) => {
    if (stageId === deal.stageId) return;
    const evt: HistoryItem = { id: `hs${Date.now()}`, type: 'stage_change', fromStageId: deal.stageId, toStageId: stageId, author: 'Вы', createdAt: new Date().toISOString() };
    onUpdate({ ...deal, stageId, history: [...deal.history, evt] });
  };

  const addHistory = () => {
    if (!historyText.trim()) return;
    const now = new Date().toISOString();
    const item: HistoryItem = historyType === 'comment'
      ? { id: `h${Date.now()}`, type: 'comment', text: historyText, author: 'Вы', createdAt: now }
      : { id: `h${Date.now()}`, type: 'task', text: historyText, author: 'Вы', createdAt: now, dueAt: taskDueAt || now, done: false, priority: taskPriority };
    onUpdate({ ...deal, history: [...deal.history, item] });
    setHistoryText(''); setTaskDueAt(''); setTaskPriority('medium');
  };

  const toggleTask = (itemId: string) =>
    onUpdate({ ...deal, history: deal.history.map(h => h.id === itemId && h.type === 'task' ? { ...h, done: !h.done } : h) });

  const saveTask = (updated: HistoryTask) => {
    onUpdate({ ...deal, history: deal.history.map(h => h.id === updated.id ? updated : h) });
    setEditingTaskId(null);
  };

  const toggleCourse = (id: string) => upd({ courseIds: deal.courseIds.includes(id) ? deal.courseIds.filter(c => c !== id) : [...deal.courseIds, id] });
  const toggleContact = (id: string) => upd({ contactIds: deal.contactIds.includes(id) ? deal.contactIds.filter(c => c !== id) : [...deal.contactIds, id] });

  // Активные задачи — вверху, остальная история — по дате
  const activeTasks = deal.history.filter(h => h.type === 'task' && !(h as HistoryTask).done) as HistoryTask[];
  const restHistory = deal.history
    .filter(h => !(h.type === 'task' && !(h as HistoryTask).done))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const sortedActiveTasks = [...activeTasks].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  const historyItemCount = deal.history.length;
  const visibleContacts = contacts.filter(c => c.companyId === deal.companyId || deal.contactIds.includes(c.id));

  const currentStage = stages.find(s => s.id === deal.stageId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <input value={deal.title} onChange={e => upd({ title: e.target.value })}
              className="text-base font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none w-full leading-tight py-0.5" />
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-xs text-slate-500">{company?.name ?? '—'}</p>
              {deal.createdAt && <span className="text-[11px] text-slate-400">· создана {formatDate(deal.createdAt)}</span>}
              {/* Теги в шапке */}
              {deal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {deal.tags.map(t => (
                    <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">Удалить?</span>
                <button onClick={() => { onDelete(deal.id); onClose(); }}
                  className="text-xs px-2 py-1 bg-rose-600 text-white rounded hover:bg-rose-700">Да</button>
                <button onClick={() => setConfirmDelete(false)} className="text-xs px-2 py-1 border border-slate-200 rounded text-slate-600">Нет</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} title="Удалить сделку"
                className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors rounded">
                <Icon name="Trash2" size={14} />
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded"><Icon name="X" size={16} /></button>
          </div>
        </div>

        {/* Stage selector */}
        <div className="px-5 py-2 border-b border-slate-100 flex-shrink-0 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {stages.map(stage => (
              <button key={stage.id} onClick={() => handleStageChange(stage.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all whitespace-nowrap ${deal.stageId === stage.id ? 'border-slate-900 bg-slate-900 text-white font-medium' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                {stage.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 flex-shrink-0">
          {(['info', 'history'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === t ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t === 'info' ? 'Информация' : (
                <span className="flex items-center gap-1.5">
                  История
                  {historyItemCount > 0 && <span className="bg-slate-100 text-slate-600 text-[10px] rounded-full px-1.5 font-mono">{historyItemCount}</span>}
                  {activeTasks.length > 0 && <span className="bg-blue-100 text-blue-700 text-[10px] rounded-full px-1.5 font-mono">{activeTasks.length} задач</span>}
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
                  <input type="number" value={deal.amount || ''} onChange={e => upd({ amount: Number(e.target.value) })} placeholder="0"
                    className="w-full text-lg font-mono font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5" />
                </Field>
                <Field label="Источник">
                  <EditableSelect value={deal.source} onChange={v => upd({ source: v })}
                    options={sourceOptions.map(s => ({ value: s, label: s }))} placeholder="Выбрать..." />
                </Field>
              </div>

              {/* Курсы — dropdown с галочками */}
              <Field label="Курсы">
                <CoursesDropdown
                  courses={courses}
                  selected={deal.courseIds}
                  onToggle={toggleCourse}
                  onAddNew={() => setShowNewCourse(true)}
                  onEditCourse={setEditCourse}
                />
              </Field>

              <div className="grid grid-cols-3 gap-5">
                <Field label="Студентов">
                  <input type="number" value={deal.studentCount || ''} onChange={e => upd({ studentCount: Number(e.target.value) })} placeholder="0" className={inpCls} />
                </Field>
                <Field label="Дата старта"><EditableDate value={deal.startDate} onChange={v => upd({ startDate: v })} /></Field>
                <Field label="Дата окончания"><EditableDate value={deal.endDate} onChange={v => upd({ endDate: v })} /></Field>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Аккаунт менеджер">
                  <EditableSelect value={deal.accountManagerId} onChange={v => upd({ accountManagerId: v })}
                    options={managers.map(m => ({ value: m.id, label: m.name }))} placeholder="Выбрать..." />
                </Field>
                <Field label="Номер счёта">
                  <EditableText value={deal.invoiceNumber} onChange={v => upd({ invoiceNumber: v })} placeholder="СЧ-2026/001" mono />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Дата выставления счёта"><EditableDate value={deal.invoiceDate} onChange={v => upd({ invoiceDate: v })} /></Field>
                <Field label="Дата оплаты"><EditableDate value={deal.paymentDate} onChange={v => upd({ paymentDate: v })} /></Field>
              </div>

              {/* Причина отказа — только для lost */}
              {deal.stageId === 'lost' && (
                <Field label="Причина отказа">
                  <textarea value={deal.lostReason ?? ''} onChange={e => upd({ lostReason: e.target.value })}
                    placeholder="Укажите причину..."
                    rows={2}
                    className="w-full text-sm text-slate-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 focus:outline-none focus:border-rose-400 resize-none transition-colors" />
                </Field>
              )}

              {/* Tags */}
              <Field label="Теги">
                <TagEditor tags={deal.tags} onChange={tags => upd({ tags })} />
              </Field>

              {/* Company */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Компания</p>
                  <button onClick={() => setShowNewCompany(true)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5 border border-slate-200 rounded px-1.5 py-0.5 transition-colors">
                    <Icon name="Plus" size={10} /> Создать
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <EditableSelect value={deal.companyId} onChange={v => upd({ companyId: v })}
                      options={companies.map(c => ({ value: c.id, label: c.name }))} placeholder="Выбрать компанию..." />
                  </div>
                  {company && (
                    <button onClick={() => setEditCompany(company)}
                      className="flex-shrink-0 flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 border border-slate-200 rounded px-2 py-1 transition-colors">
                      <Icon name="Pencil" size={10} /> Открыть
                    </button>
                  )}
                </div>
                {company && (
                  <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-slate-500">
                    {company.segment && <span className="flex items-center gap-1"><Icon name="Tag" size={10} />{company.segment}</span>}
                    {company.city && <span className="flex items-center gap-1"><Icon name="MapPin" size={10} />{company.city}</span>}
                    {company.legalEntities.map(le => <span key={le.id} className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{le.name}</span>)}
                  </div>
                )}
              </div>

              {/* Contacts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Контакты</p>
                  <button onClick={() => setShowNewContact(true)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5 border border-slate-200 rounded px-1.5 py-0.5 transition-colors">
                    <Icon name="Plus" size={10} /> Создать
                  </button>
                </div>
                <div className="space-y-1.5">
                  {visibleContacts.map(c => {
                    const checked = deal.contactIds.includes(c.id);
                    return (
                      <div key={c.id} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${checked ? 'border-slate-300 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}>
                        <div onClick={() => toggleContact(c.id)} className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${checked ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}>
                          {checked && <Icon name="Check" size={10} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-slate-800">{c.fullName}</span>
                          {c.position && <span className="text-xs text-slate-500 ml-2">{c.position}</span>}
                          {c.isDecisionMaker && <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-700 px-1 rounded border border-emerald-200">ЛПР</span>}
                        </div>
                        {checked && (
                          <button onClick={() => setEditContact(c)}
                            className="flex-shrink-0 flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 border border-slate-200 rounded px-1.5 py-0.5 transition-colors">
                            <Icon name="Pencil" size={10} /> Открыть
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {visibleContacts.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Выберите компанию или создайте контакт</p>
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
                    <button key={t} onClick={() => setHistoryType(t)}
                      className={`text-xs px-2.5 py-1 rounded border transition-colors ${historyType === t ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                      {t === 'comment' ? 'Комментарий' : 'Задача'}
                    </button>
                  ))}
                </div>
                <textarea value={historyText} onChange={e => setHistoryText(e.target.value)}
                  placeholder={historyType === 'comment' ? 'Написать комментарий...' : 'Описание задачи...'}
                  rows={2} className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-slate-400 bg-white" />
                {historyType === 'task' && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Срок</label>
                      <input type="datetime-local" value={taskDueAt} onChange={e => setTaskDueAt(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-slate-400 bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Приоритет</label>
                      <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                        className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-slate-400 bg-white">
                        <option value="high">Высокий</option><option value="medium">Средний</option><option value="low">Низкий</option>
                      </select>
                    </div>
                  </div>
                )}
                <div className="flex justify-end mt-2">
                  <button onClick={addHistory} disabled={!historyText.trim()}
                    className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40 transition-colors">
                    {historyType === 'comment' ? 'Добавить' : 'Создать задачу'}
                  </button>
                </div>
              </div>

              {/* Активные задачи — прикреплены вверху */}
              {sortedActiveTasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="Pin" size={10} /> Активные задачи
                  </p>
                  {sortedActiveTasks.map(item => <TaskItem key={item.id} item={item} editingTaskId={editingTaskId} setEditingTaskId={setEditingTaskId} toggleTask={toggleTask} saveTask={saveTask} />)}
                </div>
              )}

              {/* Остальная история */}
              {restHistory.length > 0 && (
                <div className="space-y-2">
                  {sortedActiveTasks.length > 0 && <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Лента</p>}
                  {restHistory.map(item => {
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
                      return <TaskItem key={item.id} item={item as HistoryTask} editingTaskId={editingTaskId} setEditingTaskId={setEditingTaskId} toggleTask={toggleTask} saveTask={saveTask} />;
                    }
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
              )}

              {deal.history.length === 0 && <p className="text-sm text-slate-400 text-center py-6">История пуста</p>}
            </div>
          )}
        </div>
      </div>

      {/* Mini modals */}
      {(editCompany || showNewCompany) && (
        <CompanyModal company={editCompany} onClose={() => { setEditCompany(null); setShowNewCompany(false); }}
          onSave={data => {
            if (data.id) onUpdateCompany(data as Company);
            else onAddCompany(data).then(created => upd({ companyId: created.id }));
          }} />
      )}
      {(editContact || showNewContact) && (
        <ContactModal contact={editContact} companies={companies} onClose={() => { setEditContact(null); setShowNewContact(false); }}
          onSave={data => {
            if (data.id) onUpdateContact(data as Contact);
            else onAddContact({ ...data, companyId: data.companyId || deal.companyId }).then(created => upd({ contactIds: [...deal.contactIds, created.id] }));
          }} />
      )}
      {(editCourse || showNewCourse) && (
        <CourseModal course={editCourse} onClose={() => { setEditCourse(null); setShowNewCourse(false); }}
          onSave={(name, id) => {
            if (id) onUpdateCourse({ id, name });
            else onAddCourse(name).then(created => upd({ courseIds: [...deal.courseIds, created.id] }));
          }} />
      )}
    </div>
  );
}

// ─── TaskItem component ───────────────────────────────────────────────────
function TaskItem({ item, editingTaskId, setEditingTaskId, toggleTask, saveTask }: {
  item: HistoryTask;
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
  toggleTask: (id: string) => void;
  saveTask: (t: HistoryTask) => void;
}) {
  const isOverdue = !item.done && new Date(item.dueAt) < new Date();
  const isEditing = editingTaskId === item.id;
  return (
    <div className={`rounded-lg p-3 border ${isOverdue ? 'bg-rose-50 border-rose-200' : item.done ? 'bg-emerald-50 border-emerald-200 opacity-70' : 'bg-blue-50 border-blue-100'}`}>
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
          {isEditing && <TaskEditForm task={item} onSave={saveTask} onCancel={() => setEditingTaskId(null)} />}
        </div>
        {!item.done && (
          <button onClick={() => setEditingTaskId(isEditing ? null : item.id)}
            className="flex-shrink-0 text-[11px] text-slate-400 hover:text-slate-700 border border-slate-200 rounded px-1.5 py-0.5 transition-colors">
            <Icon name="Pencil" size={10} />
          </button>
        )}
      </div>
    </div>
  );
}
