import { useState } from 'react';
import { Company, Contact, Course, segmentOptions, regionOptions } from '@/data/crm';
import Icon from '@/components/ui/icon';
import { modalInp, modalLbl } from './DealModalPrimitives';

// ─── Overlay mini-modal wrapper ───────────────────────────────────────────
export function MiniModal({ title, onClose, children, footer }: {
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
export function CompanyModal({ company, onClose, onSave }: {
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
export function ContactModal({ contact, companies, onClose, onSave }: {
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
export function CourseModal({ course, onClose, onSave }: {
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
