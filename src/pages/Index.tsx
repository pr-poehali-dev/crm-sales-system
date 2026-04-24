import { useState } from 'react';
import {
  Deal, Company, Contact, Manager, Course,
  initialDeals, initialCompanies, initialContacts, initialManagers, initialCourses,
  stages, formatAmount,
} from '@/data/crm';
import FunnelView from '@/components/crm/FunnelView';
import DealsView from '@/components/crm/DealsView';
import DealModal from '@/components/crm/DealModal';
import AddDealModal from '@/components/crm/AddDealModal';
import CompaniesView from '@/components/crm/CompaniesView';
import ContactsView from '@/components/crm/ContactsView';
import Icon from '@/components/ui/icon';

type View = 'funnel' | 'deals' | 'companies' | 'contacts';

export default function Index() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [managers] = useState<Manager[]>(initialManagers);
  const [courses] = useState<Course[]>(initialCourses);

  const [view, setView] = useState<View>('funnel');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [addModalStageId, setAddModalStageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpdateDeal = (updated: Deal) => {
    setDeals(prev => prev.map(d => d.id === updated.id ? updated : d));
    if (selectedDeal?.id === updated.id) setSelectedDeal(updated);
  };
  const handleAddDeal = (data: Omit<Deal, 'id' | 'createdAt' | 'history'>) => {
    setDeals(prev => [...prev, { ...data, id: `d${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], history: [] }]);
  };

  const handleAddCompany = (data: Omit<Company, 'id'>) =>
    setCompanies(prev => [...prev, { ...data, id: `co${Date.now()}` }]);
  const handleEditCompany = (updated: Company) =>
    setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));

  const handleAddContact = (data: Omit<Contact, 'id'>) =>
    setContacts(prev => [...prev, { ...data, id: `ct${Date.now()}` }]);
  const handleEditContact = (updated: Contact) =>
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));

  const totalPipeline = deals.filter(d => d.stageId !== 'done').reduce((s, d) => s + d.amount, 0);
  const wonTotal = deals.filter(d => d.stageId === 'done').reduce((s, d) => s + d.amount, 0);
  const overdueCount = deals.reduce((acc, deal) =>
    acc + deal.history.filter(h => h.type === 'task' && !h.done && new Date((h as { dueAt: string }).dueAt) < new Date()).length, 0
  );

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'funnel',    label: 'Воронка',   icon: 'Columns3'  },
    { id: 'deals',     label: 'Сделки',    icon: 'Briefcase' },
    { id: 'companies', label: 'Компании',  icon: 'Building2' },
    { id: 'contacts',  label: 'Контакты',  icon: 'Users'     },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f8] font-sans">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center h-12 gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center">
                <Icon name="TrendingUp" size={13} className="text-white" />
              </div>
              <span className="font-semibold text-slate-900 text-[15px] hidden sm:block">CRM</span>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            <nav className="flex items-center gap-0.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] transition-all duration-150 ${
                    view === item.id
                      ? 'bg-slate-100 text-slate-900 font-medium'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon name={item.icon} size={13} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4 ml-2">
              {overdueCount > 0 && (
                <div className="flex items-center gap-1 text-rose-600">
                  <Icon name="AlertCircle" size={13} />
                  <span className="text-xs font-medium">{overdueCount} просроч.</span>
                </div>
              )}
              <div className="text-right">
                <p className="text-[9px] text-slate-400 uppercase tracking-wider leading-none mb-0.5">В работе</p>
                <p className="font-mono font-medium text-slate-800 text-[12px]">{formatAmount(totalPipeline)}</p>
              </div>
              <div className="w-px h-7 bg-slate-200" />
              <div className="text-right">
                <p className="text-[9px] text-slate-400 uppercase tracking-wider leading-none mb-0.5">Реализовано</p>
                <p className="font-mono font-medium text-slate-800 text-[12px]">{formatAmount(wonTotal)}</p>
              </div>
              <div className="w-px h-7 bg-slate-200" />
              <div className="text-right">
                <p className="text-[9px] text-slate-400 uppercase tracking-wider leading-none mb-0.5">Сделок</p>
                <p className="font-mono font-medium text-slate-800 text-[12px]">{deals.length}</p>
              </div>
            </div>

            <button
              onClick={() => setAddModalStageId('base')}
              className="ml-auto flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              <Icon name="Plus" size={13} />
              <span className="hidden sm:inline">Сделка</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
        {view === 'funnel' && (
          <FunnelView
            deals={deals}
            stages={stages}
            companies={companies}
            onDealClick={setSelectedDeal}
            onStageChange={(dealId, stageId) => setDeals(prev => prev.map(d => {
              if (d.id !== dealId || d.stageId === stageId) return d;
              const event = { id: `hs${Date.now()}`, type: 'stage_change' as const, fromStageId: d.stageId, toStageId: stageId, author: 'Вы', createdAt: new Date().toISOString() };
              return { ...d, stageId, history: [...d.history, event] };
            }))}
            onAddDeal={setAddModalStageId}
            searchQuery={searchQuery}
          />
        )}
        {view === 'deals' && (
          <DealsView
            deals={deals}
            companies={companies}
            contacts={contacts}
            managers={managers}
            courses={courses}
            onDealClick={setSelectedDeal}
            searchQuery={searchQuery}
          />
        )}
        {view === 'companies' && (
          <CompaniesView
            companies={companies}
            contacts={contacts}
            deals={deals}
            searchQuery={searchQuery}
            onAddCompany={handleAddCompany}
            onEditCompany={handleEditCompany}
          />
        )}
        {view === 'contacts' && (
          <ContactsView
            contacts={contacts}
            companies={companies}
            deals={deals}
            searchQuery={searchQuery}
            onAddContact={handleAddContact}
            onEditContact={handleEditContact}
          />
        )}
      </main>

      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          companies={companies}
          contacts={contacts}
          managers={managers}
          courses={courses}
          onClose={() => setSelectedDeal(null)}
          onUpdate={handleUpdateDeal}
          onUpdateCompany={handleEditCompany}
          onUpdateContact={handleEditContact}
        />
      )}

      {addModalStageId && (
        <AddDealModal
          defaultStageId={addModalStageId}
          companies={companies}
          contacts={contacts}
          managers={managers}
          courses={courses}
          onClose={() => setAddModalStageId(null)}
          onAdd={handleAddDeal}
        />
      )}
    </div>
  );
}