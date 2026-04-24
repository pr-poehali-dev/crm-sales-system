import { useState } from 'react';
import { Company, Contact, Deal, segmentOptions, regionOptions } from '@/data/crm';
import Icon from '@/components/ui/icon';

interface CompaniesViewProps {
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  searchQuery: string;
  onAddCompany: (c: Omit<Company, 'id'>) => void;
  onEditCompany: (c: Company) => void;
}

function CompanyModal({ company, contacts, deals, onClose, onSave }: {
  company: Company | null;
  contacts: Contact[];
  deals: Deal[];
  onClose: () => void;
  onSave: (c: Omit<Company, 'id'> & { id?: string }) => void;
}) {
  const [form, setForm] = useState<Omit<Company, 'id'> & { id?: string }>({
    id: company?.id,
    name: company?.name ?? '',
    legalEntities: company?.legalEntities ?? [],
    segment: company?.segment ?? '',
    region: company?.region ?? '',
    city: company?.city ?? '',
  });
  const [leInput, setLeInput] = useState('');

  const addLE = () => {
    if (!leInput.trim()) return;
    setForm(prev => ({ ...prev, legalEntities: [...prev.legalEntities, { id: `le${Date.now()}`, name: leInput.trim() }] }));
    setLeInput('');
  };
  const removeLE = (id: string) => setForm(prev => ({ ...prev, legalEntities: prev.legalEntities.filter(l => l.id !== id) }));

  const companyContacts = contacts.filter(c => c.companyId === company?.id);
  const companyDeals = deals.filter(d => d.companyId === company?.id);

  const inp = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors bg-white";
  const lbl = "text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900">{company ? 'Редактировать компанию' : 'Новая компания'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="X" size={16} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div>
            <label className={lbl}>Наименование *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="ООО Компания" required className={inp} />
          </div>

          <div>
            <label className={lbl}>Юридические лица</label>
            <div className="flex gap-2 mb-2">
              <input value={leInput} onChange={e => setLeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLE())} placeholder="Название юр. лица" className={`${inp} flex-1`} />
              <button type="button" onClick={addLE} className="px-3 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0">
                <Icon name="Plus" size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {form.legalEntities.map(le => (
                <div key={le.id} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-sm">
                  <span className="text-slate-700">{le.name}</span>
                  <button onClick={() => removeLE(le.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <Icon name="X" size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lbl}>Сегмент</label>
              <select value={form.segment} onChange={e => setForm(p => ({ ...p, segment: e.target.value }))} className={inp}>
                <option value="">—</option>
                {segmentOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Регион</label>
              <select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} className={inp}>
                <option value="">—</option>
                {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Город</label>
              <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Москва" className={inp} />
            </div>
          </div>

          {company && (
            <>
              {companyContacts.length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <p className={lbl}>Контакты ({companyContacts.length})</p>
                  <div className="space-y-1">
                    {companyContacts.map(c => (
                      <div key={c.id} className="flex items-center gap-2 text-sm text-slate-700">
                        <Icon name="User" size={12} className="text-slate-400" />
                        {c.fullName}
                        {c.isDecisionMaker && <span className="text-[10px] text-emerald-600">ЛПР</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {companyDeals.length > 0 && (
                <div>
                  <p className={lbl}>Сделки ({companyDeals.length})</p>
                  <div className="space-y-1">
                    {companyDeals.map(d => (
                      <div key={d.id} className="text-sm text-slate-700 flex items-center gap-2">
                        <Icon name="Briefcase" size={12} className="text-slate-400" />
                        {d.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 px-5 pb-5 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 transition-colors">Отмена</button>
          <button
            onClick={() => { if (form.name.trim()) { onSave(form); onClose(); } }}
            className="flex-1 py-2.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompaniesView({ companies, contacts, deals, searchQuery, onAddCompany, onEditCompany }: CompaniesViewProps) {
  const [modal, setModal] = useState<Company | null | 'new'>(null);

  const getContactCount = (id: string) => contacts.filter(c => c.companyId === id).length;
  const getDealCount = (id: string) => deals.filter(d => d.companyId === id).length;

  const filtered = companies.filter(c => {
    const q = searchQuery.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.segment.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-500 font-mono">{filtered.length} компаний</span>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Icon name="Plus" size={13} />
          Компания
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(company => (
          <div
            key={company.id}
            onClick={() => setModal(company)}
            className="bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-slate-400 hover:shadow-sm transition-all duration-150 animate-fade-in"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-slate-900 text-sm">{company.name}</h3>
              {company.segment && (
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex-shrink-0">{company.segment}</span>
              )}
            </div>

            {(company.region || company.city) && (
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                <Icon name="MapPin" size={10} />
                {[company.city, company.region].filter(Boolean).join(', ')}
              </p>
            )}

            {company.legalEntities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {company.legalEntities.map(le => (
                  <span key={le.id} className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                    {le.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Icon name="Users" size={10} />{getContactCount(company.id)} контактов</span>
              <span className="flex items-center gap-1"><Icon name="Briefcase" size={10} />{getDealCount(company.id)} сделок</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Icon name="Building2" size={28} className="mb-3 opacity-40" />
          <p className="text-sm">Компании не найдены</p>
        </div>
      )}

      {modal !== null && (
        <CompanyModal
          company={modal === 'new' ? null : modal as Company}
          contacts={contacts}
          deals={deals}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (data.id) onEditCompany(data as Company);
            else onAddCompany(data);
          }}
        />
      )}
    </div>
  );
}
