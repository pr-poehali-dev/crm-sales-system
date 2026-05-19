import { useState } from 'react';
import {
  Deal, Company, Contact, Manager, Course, HistoryItem,
  stages, sourceOptions,
} from '@/data/crm';
import Icon from '@/components/ui/icon';
import {
  formatDate, inpCls, Field, EditableText, EditableSelect, EditableDate,
  TagEditor, CoursesDropdown,
} from './DealModalPrimitives';
import { CompanyModal, ContactModal, CourseModal } from './DealModalMiniModals';
import { DealModalHistoryTab } from './DealModalHistory';

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

export default function DealModal({
  deal, companies, contacts, managers, courses, onClose, onUpdate, onDelete,
  onUpdateCompany, onUpdateContact, onAddCompany, onAddContact, onAddCourse, onUpdateCourse,
}: DealModalProps) {
  const [tab, setTab] = useState<Tab>('info');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [showNewCourse, setShowNewCourse] = useState(false);

  const company = companies.find(c => c.id === deal.companyId);

  const upd = (patch: Partial<Deal>) => onUpdate({ ...deal, ...patch });

  const handleStageChange = (stageId: string) => {
    if (stageId === deal.stageId) return;
    const evt: HistoryItem = { id: `hs${Date.now()}`, type: 'stage_change', fromStageId: deal.stageId, toStageId: stageId, author: 'Вы', createdAt: new Date().toISOString() };
    onUpdate({ ...deal, stageId, history: [...deal.history, evt] });
  };

  const toggleCourse = (id: string) => upd({ courseIds: deal.courseIds.includes(id) ? deal.courseIds.filter(c => c !== id) : [...deal.courseIds, id] });
  const toggleContact = (id: string) => upd({ contactIds: deal.contactIds.includes(id) ? deal.contactIds.filter(c => c !== id) : [...deal.contactIds, id] });

  const activeTasks = deal.history.filter(h => h.type === 'task' && !(h as { done: boolean }).done);
  const historyItemCount = deal.history.length;
  const visibleContacts = contacts.filter(c => c.companyId === deal.companyId || deal.contactIds.includes(c.id));

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

              {deal.stageId === 'lost' && (
                <Field label="Причина отказа">
                  <textarea value={deal.lostReason ?? ''} onChange={e => upd({ lostReason: e.target.value })}
                    placeholder="Укажите причину..."
                    rows={2}
                    className="w-full text-sm text-slate-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 focus:outline-none focus:border-rose-400 resize-none transition-colors" />
                </Field>
              )}

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
            <DealModalHistoryTab deal={deal} onUpdate={onUpdate} />
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
