import { useState } from 'react';
import { Contact, Company, Deal, Phone, Email } from '@/data/crm';
import Icon from '@/components/ui/icon';

interface ContactsViewProps {
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  searchQuery: string;
  onAddContact: (c: Omit<Contact, 'id'>) => void;
  onEditContact: (c: Contact) => void;
  onDeleteContact?: (id: string) => void;
}

function ContactModal({ contact, companies, onClose, onSave }: {
  contact: Contact | null;
  companies: Company[];
  onClose: () => void;
  onSave: (c: Omit<Contact, 'id'> & { id?: string }) => void;
}) {
  const [form, setForm] = useState<Omit<Contact, 'id'> & { id?: string }>({
    id: contact?.id,
    fullName: contact?.fullName ?? '',
    phones: contact?.phones ?? [{ id: 'p_new', type: 'Рабочий', value: '' }],
    emails: contact?.emails ?? [{ id: 'e_new', type: 'Рабочий', value: '' }],
    position: contact?.position ?? '',
    isDecisionMaker: contact?.isDecisionMaker ?? false,
    companyId: contact?.companyId ?? '',
  });

  const phoneTypes = ['Рабочий', 'Личный', 'Мобильный', 'Другой'];
  const emailTypes = ['Рабочий', 'Личный', 'Другой'];

  const addPhone = () => setForm(p => ({ ...p, phones: [...p.phones, { id: `ph${Date.now()}`, type: 'Рабочий', value: '' }] }));
  const removePhone = (id: string) => setForm(p => ({ ...p, phones: p.phones.filter(ph => ph.id !== id) }));
  const updatePhone = (id: string, key: keyof Phone, val: string) =>
    setForm(p => ({ ...p, phones: p.phones.map(ph => ph.id === id ? { ...ph, [key]: val } : ph) }));

  const addEmail = () => setForm(p => ({ ...p, emails: [...p.emails, { id: `em${Date.now()}`, type: 'Рабочий', value: '' }] }));
  const removeEmail = (id: string) => setForm(p => ({ ...p, emails: p.emails.filter(e => e.id !== id) }));
  const updateEmail = (id: string, key: keyof Email, val: string) =>
    setForm(p => ({ ...p, emails: p.emails.map(e => e.id === id ? { ...e, [key]: val } : e) }));

  const inp = "px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors bg-white";
  const lbl = "text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900">{contact ? 'Редактировать контакт' : 'Новый контакт'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="X" size={16} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div>
            <label className={lbl}>ФИО *</label>
            <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Иван Петров" className={`${inp} w-full`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Компания</label>
              <select value={form.companyId} onChange={e => setForm(p => ({ ...p, companyId: e.target.value }))} className={`${inp} w-full`}>
                <option value="">Выбрать...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Должность</label>
              <input value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} placeholder="Директор" className={`${inp} w-full`} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              onClick={() => setForm(p => ({ ...p, isDecisionMaker: !p.isDecisionMaker }))}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${form.isDecisionMaker ? 'bg-slate-900 border-slate-900' : 'border-slate-300 hover:border-slate-500'}`}
            >
              {form.isDecisionMaker && <Icon name="Check" size={10} className="text-white" />}
            </div>
            <label className="text-sm text-slate-700 cursor-pointer select-none" onClick={() => setForm(p => ({ ...p, isDecisionMaker: !p.isDecisionMaker }))}>
              ЛПР (Лицо, принимающее решения)
            </label>
          </div>

          {/* Phones */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={lbl} style={{ marginBottom: 0 }}>Телефоны</label>
              <button type="button" onClick={addPhone} className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <Icon name="Plus" size={11} /> Добавить
              </button>
            </div>
            <div className="space-y-1.5">
              {form.phones.map(phone => (
                <div key={phone.id} className="flex gap-2">
                  <select
                    value={phone.type}
                    onChange={e => updatePhone(phone.id, 'type', e.target.value)}
                    className={`${inp} w-28 flex-shrink-0`}
                  >
                    {phoneTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    value={phone.value}
                    onChange={e => updatePhone(phone.id, 'value', e.target.value)}
                    placeholder="+7 000 000-00-00"
                    className={`${inp} flex-1`}
                  />
                  {form.phones.length > 1 && (
                    <button onClick={() => removePhone(phone.id)} className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0">
                      <Icon name="X" size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Emails */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={lbl} style={{ marginBottom: 0 }}>Email</label>
              <button type="button" onClick={addEmail} className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <Icon name="Plus" size={11} /> Добавить
              </button>
            </div>
            <div className="space-y-1.5">
              {form.emails.map(email => (
                <div key={email.id} className="flex gap-2">
                  <select
                    value={email.type}
                    onChange={e => updateEmail(email.id, 'type', e.target.value)}
                    className={`${inp} w-28 flex-shrink-0`}
                  >
                    {emailTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    value={email.value}
                    onChange={e => updateEmail(email.id, 'value', e.target.value)}
                    placeholder="ivan@company.ru"
                    type="email"
                    className={`${inp} flex-1`}
                  />
                  {form.emails.length > 1 && (
                    <button onClick={() => removeEmail(email.id)} className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0">
                      <Icon name="X" size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 transition-colors">Отмена</button>
          <button
            onClick={() => { if (form.fullName.trim()) { onSave(form); onClose(); } }}
            className="flex-1 py-2.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContactsView({ contacts, companies, deals, searchQuery, onAddContact, onEditContact, onDeleteContact }: ContactsViewProps) {
  const [modal, setModal] = useState<Contact | null | 'new'>(null);
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterDM, setFilterDM] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name ?? '—';
  const getDealCount = (id: string) => deals.filter(d => d.contactIds.includes(id)).length;

  const filtered = contacts.filter(c => {
    const q = searchQuery.toLowerCase();
    if (q && !c.fullName.toLowerCase().includes(q) && !c.position.toLowerCase().includes(q)) return false;
    if (filterCompany !== 'all' && c.companyId !== filterCompany) return false;
    if (filterDM === 'yes' && !c.isDecisionMaker) return false;
    if (filterDM === 'no' && c.isDecisionMaker) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-slate-400">
          <option value="all">Все компании</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterDM} onChange={e => setFilterDM(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-slate-400">
          <option value="all">ЛПР: Все</option>
          <option value="yes">Только ЛПР</option>
          <option value="no">Не ЛПР</option>
        </select>
        <span className="text-xs text-slate-500 font-mono">{filtered.length} контактов</span>
        <button
          onClick={() => setModal('new')}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Icon name="Plus" size={13} />
          Контакт
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-2.5 text-[10.5px] font-medium text-slate-500 uppercase tracking-wider">ФИО</th>
              <th className="text-left px-4 py-2.5 text-[10.5px] font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Компания</th>
              <th className="text-left px-4 py-2.5 text-[10.5px] font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Должность</th>
              <th className="text-left px-4 py-2.5 text-[10.5px] font-medium text-slate-500 uppercase tracking-wider">Телефон</th>
              <th className="text-left px-4 py-2.5 text-[10.5px] font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
              <th className="text-center px-4 py-2.5 text-[10.5px] font-medium text-slate-500 uppercase tracking-wider">ЛПР</th>
              <th className="text-center px-4 py-2.5 text-[10.5px] font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Сделки</th>
              {onDeleteContact && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors animate-fade-in"
              >
                <td className="px-4 py-2.5 font-medium text-slate-900 cursor-pointer" onClick={() => setModal(c)}>{c.fullName}</td>
                <td className="px-4 py-2.5 text-slate-600 hidden md:table-cell cursor-pointer" onClick={() => setModal(c)}>{getCompanyName(c.companyId)}</td>
                <td className="px-4 py-2.5 text-slate-500 hidden md:table-cell cursor-pointer" onClick={() => setModal(c)}>{c.position || '—'}</td>
                <td className="px-4 py-2.5 text-slate-600 cursor-pointer" onClick={() => setModal(c)}>
                  {c.phones[0]?.value ?? '—'}
                  {c.phones.length > 1 && <span className="text-xs text-slate-400 ml-1">+{c.phones.length - 1}</span>}
                </td>
                <td className="px-4 py-2.5 text-slate-500 hidden lg:table-cell cursor-pointer" onClick={() => setModal(c)}>
                  {c.emails[0]?.value ?? '—'}
                </td>
                <td className="px-4 py-2.5 text-center cursor-pointer" onClick={() => setModal(c)}>
                  {c.isDecisionMaker
                    ? <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 rounded-full"><Icon name="Check" size={11} className="text-emerald-600" /></span>
                    : <span className="text-slate-300">—</span>
                  }
                </td>
                <td className="px-4 py-2.5 text-center text-slate-500 hidden lg:table-cell cursor-pointer" onClick={() => setModal(c)}>{getDealCount(c.id)}</td>
                {onDeleteContact && (
                  <td className="px-2 py-2.5 text-center">
                    {confirmDeleteId === c.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => { onDeleteContact(c.id); setConfirmDeleteId(null); }}
                          className="text-[10px] px-1.5 py-0.5 bg-rose-600 text-white rounded">Да</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] px-1.5 py-0.5 border border-slate-200 rounded">Нет</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(c.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors rounded">
                        <Icon name="Trash2" size={12} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400">
            <Icon name="Users" size={26} className="mb-3 opacity-40" />
            <p className="text-sm">Контакты не найдены</p>
          </div>
        )}
      </div>

      {modal !== null && (
        <ContactModal
          contact={modal === 'new' ? null : modal as Contact}
          companies={companies}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (data.id) onEditContact(data as Contact);
            else onAddContact(data);
          }}
        />
      )}
    </div>
  );
}