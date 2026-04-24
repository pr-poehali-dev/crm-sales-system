import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Deal, Company, Contact, Manager, Course,
  initialManagers, initialCourses,
  stages, formatAmount,
} from '@/data/crm';
import { api } from '@/lib/api';
import FunnelView from '@/components/crm/FunnelView';
import DealsView from '@/components/crm/DealsView';
import DealModal from '@/components/crm/DealModal';
import AddDealModal from '@/components/crm/AddDealModal';
import CompaniesView from '@/components/crm/CompaniesView';
import ContactsView from '@/components/crm/ContactsView';
import TasksView from '@/components/crm/TasksView';
import ManagersView from '@/components/crm/ManagersView';
import Icon from '@/components/ui/icon';

type View = 'funnel' | 'deals' | 'tasks' | 'companies' | 'contacts' | 'managers';

export default function Index() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [managers, setManagers] = useState<Manager[]>(initialManagers);
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<View>('funnel');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [addModalStageId, setAddModalStageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.seed();
      const [d, co, ct, cr, mg] = await Promise.all([
        api.getDeals(),
        api.getCompanies(),
        api.getContacts(),
        api.getCourses(),
        api.getManagers(),
      ]);
      setDeals(d as Deal[]);
      setCompanies(co as Company[]);
      setContacts(ct as Contact[]);
      setCourses((cr as Course[]).length ? cr as Course[] : initialCourses);
      setManagers((mg as Manager[]).length ? mg as Manager[] : initialManagers);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleUpdateDeal = async (updated: Deal) => {
    setDeals(prev => prev.map(d => d.id === updated.id ? updated : d));
    if (selectedDeal?.id === updated.id) setSelectedDeal(updated);
    await api.updateDeal(updated.id, updated);
  };

  const handleAddDeal = async (data: Omit<Deal, 'id' | 'createdAt' | 'history'>) => {
    const newDeal: Deal = { ...data, id: `d${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], history: [] };
    setDeals(prev => [newDeal, ...prev]);
    await api.addDeal(newDeal);
  };

  const handleAddCompany = async (data: Omit<Company, 'id'>): Promise<Company> => {
    const co: Company = { ...data, id: `co${Date.now()}` };
    setCompanies(prev => [...prev, co]);
    await api.addCompany(co);
    return co;
  };

  const handleEditCompany = async (updated: Company) => {
    setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
    await api.updateCompany(updated.id, updated);
  };

  const handleAddContact = async (data: Omit<Contact, 'id'>): Promise<Contact> => {
    const ct: Contact = { ...data, id: `ct${Date.now()}` };
    setContacts(prev => [...prev, ct]);
    await api.addContact(ct);
    return ct;
  };

  const handleEditContact = async (updated: Contact) => {
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
    await api.updateContact(updated.id, updated);
  };

  const handleAddCourse = async (name: string): Promise<Course> => {
    const cr: Course = { id: `c${Date.now()}`, name };
    setCourses(prev => [...prev, cr]);
    await api.addCourse(cr);
    return cr;
  };

  const handleUpdateCourse = async (updated: Course) => {
    setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
    await api.updateCourse(updated.id, updated);
  };

  // ─── Delete handlers ────────────────────────────────────────────────────
  const handleDeleteDeal = async (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
    if (selectedDeal?.id === id) setSelectedDeal(null);
    await api.deleteDeal(id);
  };

  const handleDeleteCompany = async (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    await api.deleteCompany(id);
  };

  const handleDeleteContact = async (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    await api.deleteContact(id);
  };

  // ─── Manager handlers ───────────────────────────────────────────────────
  const handleAddManager = async (name: string): Promise<Manager> => {
    const m: Manager = { id: `m${Date.now()}`, name };
    setManagers(prev => [...prev, m]);
    await api.addManager(m);
    return m;
  };

  const handleUpdateManager = async (updated: Manager) => {
    setManagers(prev => prev.map(m => m.id === updated.id ? updated : m));
    await api.updateManager(updated.id, updated);
  };

  const handleDeleteManager = async (id: string) => {
    setManagers(prev => prev.filter(m => m.id !== id));
    await api.deleteManager(id);
  };

  const handleExport = async () => {
    const csv = await api.exportCsv();
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deals_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const text = await file.text();
    const result = await api.importCsv(text);
    setImportResult(`Импортировано ${result.imported} сделок`);
    await loadAll();
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalPipeline = deals.filter(d => d.stageId !== 'done').reduce((s, d) => s + d.amount, 0);
  const wonTotal = deals.filter(d => d.stageId === 'done').reduce((s, d) => s + d.amount, 0);
  const overdueCount = deals.reduce((acc, deal) =>
    acc + deal.history.filter(h => h.type === 'task' && !(h as { done: boolean }).done && new Date((h as { dueAt: string }).dueAt) < new Date()).length, 0
  );

  const openDeal = (dealId: string) => {
    const d = deals.find(x => x.id === dealId);
    if (d) { setSelectedDeal(d); setView('funnel'); }
  };

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'funnel',    label: 'Воронка',   icon: 'Columns3'    },
    { id: 'deals',     label: 'Сделки',    icon: 'Briefcase'   },
    { id: 'tasks',     label: 'Задачи',    icon: 'CheckSquare' },
    { id: 'companies', label: 'Компании',  icon: 'Building2'   },
    { id: 'contacts',  label: 'Контакты',  icon: 'Users'       },
    { id: 'managers',  label: 'Менеджеры', icon: 'UserCog'     },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center space-y-3 max-w-sm px-4">
          <Icon name="AlertCircle" size={32} className="text-rose-400 mx-auto" />
          <p className="text-sm font-medium text-slate-700">Ошибка подключения</p>
          <p className="text-xs text-slate-400 break-all">{error}</p>
          <button onClick={loadAll} className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

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
                <button key={item.id} onClick={() => setView(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] transition-all duration-150 relative ${view === item.id ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                  <Icon name={item.icon} size={13} />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.id === 'tasks' && overdueCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] rounded-full flex items-center justify-center font-mono">
                      {overdueCount > 9 ? '9+' : overdueCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3 ml-2">
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
              <div className="flex items-center gap-1">
                <button onClick={handleExport} title="Экспорт в CSV"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 text-xs">
                  <Icon name="Download" size={13} />
                  <span className="hidden xl:inline">CSV</span>
                </button>
                <label title="Импорт из CSV"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs">
                  <Icon name={importing ? 'Loader' : 'Upload'} size={13} className={importing ? 'animate-spin' : ''} />
                  <span className="hidden xl:inline">Импорт</span>
                  <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
                </label>
              </div>
            </div>

            <button onClick={() => setAddModalStageId('base')}
              className="ml-auto flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors font-medium">
              <Icon name="Plus" size={13} />
              <span className="hidden sm:inline">Сделка</span>
            </button>
          </div>
        </div>
      </header>

      {importResult && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center gap-2 text-sm text-emerald-700">
          <Icon name="CheckCircle2" size={14} />
          {importResult}
          <button onClick={() => setImportResult(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <Icon name="X" size={13} />
          </button>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
        {view === 'funnel' && (
          <FunnelView
            deals={deals} stages={stages} companies={companies} courses={courses} managers={managers}
            onDealClick={setSelectedDeal}
            onStageChange={async (dealId, stageId) => {
              setDeals(prev => prev.map(d => {
                if (d.id !== dealId || d.stageId === stageId) return d;
                const event = { id: `hs${Date.now()}`, type: 'stage_change' as const, fromStageId: d.stageId, toStageId: stageId, author: 'Вы', createdAt: new Date().toISOString() };
                const updated = { ...d, stageId, history: [...d.history, event] };
                api.updateDeal(dealId, updated);
                return updated;
              }));
            }}
            onAddDeal={setAddModalStageId}
            searchQuery={searchQuery}
          />
        )}
        {view === 'deals' && (
          <DealsView deals={deals} companies={companies} contacts={contacts} managers={managers} courses={courses}
            onDealClick={setSelectedDeal} searchQuery={searchQuery} />
        )}
        {view === 'tasks' && (
          <TasksView deals={deals} companies={companies} onUpdateDeal={handleUpdateDeal} onDealClick={openDeal} />
        )}
        {view === 'companies' && (
          <CompaniesView companies={companies} contacts={contacts} deals={deals} searchQuery={searchQuery}
            onAddCompany={d => { handleAddCompany(d); }} onEditCompany={handleEditCompany}
            onDeleteCompany={handleDeleteCompany} />
        )}
        {view === 'contacts' && (
          <ContactsView contacts={contacts} companies={companies} deals={deals} searchQuery={searchQuery}
            onAddContact={d => { handleAddContact(d); }} onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact} />
        )}
        {view === 'managers' && (
          <ManagersView managers={managers} deals={deals}
            onAdd={handleAddManager} onUpdate={handleUpdateManager} onDelete={handleDeleteManager} />
        )}
      </main>

      {selectedDeal && (
        <DealModal
          deal={selectedDeal} companies={companies} contacts={contacts} managers={managers} courses={courses}
          onClose={() => setSelectedDeal(null)}
          onUpdate={handleUpdateDeal}
          onDelete={handleDeleteDeal}
          onUpdateCompany={handleEditCompany}
          onUpdateContact={handleEditContact}
          onAddCompany={handleAddCompany}
          onAddContact={handleAddContact}
          onAddCourse={handleAddCourse}
          onUpdateCourse={handleUpdateCourse}
        />
      )}

      {addModalStageId && (
        <AddDealModal
          defaultStageId={addModalStageId}
          companies={companies} contacts={contacts} managers={managers} courses={courses}
          onClose={() => setAddModalStageId(null)}
          onAdd={handleAddDeal}
          onAddCompany={handleAddCompany}
          onAddContact={handleAddContact}
        />
      )}
    </div>
  );
}