import { useState } from 'react';
import { Deal, Company, Contact, Manager, Course, formatAmount, stages, sourceOptions, HistoryTask } from '@/data/crm';
import Icon from '@/components/ui/icon';

interface DealsViewProps {
  deals: Deal[];
  companies: Company[];
  contacts: Contact[];
  managers: Manager[];
  courses: Course[];
  onDealClick: (deal: Deal) => void;
  searchQuery: string;
}

type SortField = 'title' | 'company' | 'amount' | 'stage' | 'manager' | 'studentCount';

type Filters = {
  stage: string;
  taskPriority: string;
  source: string;
  manager: string;
  company: string;
};

function getTopTaskPriority(deal: Deal): 'high' | 'medium' | 'low' | null {
  const active = deal.history.filter((h): h is HistoryTask => h.type === 'task' && !h.done);
  if (!active.length) return null;
  if (active.some(t => t.priority === 'high')) return 'high';
  if (active.some(t => t.priority === 'medium')) return 'medium';
  return 'low';
}

export default function DealsView({ deals, companies, contacts, managers, courses, onDealClick, searchQuery }: DealsViewProps) {
  const [filters, setFilters] = useState<Filters>({ stage: 'all', taskPriority: 'all', source: 'all', manager: 'all', company: 'all' });
  const [sortField, setSortField] = useState<SortField>('amount');
  const [sortAsc, setSortAsc] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name ?? '—';
  const getManagerName = (id: string) => managers.find(m => m.id === id)?.name ?? '—';
  const getStageName = (id: string) => stages.find(s => s.id === id)?.name ?? id;
  const getCourseNames = (ids: string[]) => ids.map(id => courses.find(c => c.id === id)?.name ?? id).join(', ');

  const stageOrder: Record<string, number> = Object.fromEntries(stages.map((s, i) => [s.id, i]));

  const filtered = deals
    .filter(d => {
      const q = searchQuery.toLowerCase();
      if (q && !d.title.toLowerCase().includes(q) && !getCompanyName(d.companyId).toLowerCase().includes(q)) return false;
      if (filters.stage !== 'all' && d.stageId !== filters.stage) return false;
      if (filters.taskPriority !== 'all' && getTopTaskPriority(d) !== filters.taskPriority) return false;
      if (filters.source !== 'all' && d.source !== filters.source) return false;
      if (filters.manager !== 'all' && d.accountManagerId !== filters.manager) return false;
      if (filters.company !== 'all' && d.companyId !== filters.company) return false;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'amount') cmp = a.amount - b.amount;
      else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortField === 'company') cmp = getCompanyName(a.companyId).localeCompare(getCompanyName(b.companyId));
      else if (sortField === 'stage') cmp = (stageOrder[a.stageId] ?? 0) - (stageOrder[b.stageId] ?? 0);
      else if (sortField === 'manager') cmp = getManagerName(a.accountManagerId).localeCompare(getManagerName(b.accountManagerId));
      else if (sortField === 'studentCount') cmp = a.studentCount - b.studentCount;
      return sortAsc ? cmp : -cmp;
    });

  const totalAmount = filtered.reduce((s, d) => s + d.amount, 0);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const setFilter = (key: keyof Filters, val: string) => setFilters(prev => ({ ...prev, [key]: val }));
  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Icon name="ChevronsUpDown" size={11} className="text-slate-300 ml-1" />;
    return sortAsc
      ? <Icon name="ChevronUp" size={11} className="text-slate-600 ml-1" />
      : <Icon name="ChevronDown" size={11} className="text-slate-600 ml-1" />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${showFilters || activeFiltersCount > 0 ? 'border-slate-400 bg-slate-50 text-slate-700' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
        >
          <Icon name="SlidersHorizontal" size={13} />
          Фильтры
          {activeFiltersCount > 0 && (
            <span className="bg-slate-800 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-mono">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={() => setFilters({ stage: 'all', taskPriority: 'all', source: 'all', manager: 'all', company: 'all' })}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <Icon name="X" size={11} /> Сбросить
          </button>
        )}

        <div className="ml-auto text-xs text-slate-500 font-mono">
          {filtered.length} сделок · {formatAmount(totalAmount)}
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Этап</label>
            <select value={filters.stage} onChange={e => setFilter('stage', e.target.value)} className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400">
              <option value="all">Все</option>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Приоритет задач</label>
            <select value={filters.taskPriority} onChange={e => setFilter('taskPriority', e.target.value)} className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400">
              <option value="all">Все</option>
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Источник</label>
            <select value={filters.source} onChange={e => setFilter('source', e.target.value)} className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400">
              <option value="all">Все</option>
              {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Менеджер</label>
            <select value={filters.manager} onChange={e => setFilter('manager', e.target.value)} className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400">
              <option value="all">Все</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Компания</label>
            <select value={filters.company} onChange={e => setFilter('company', e.target.value)} className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400">
              <option value="all">Все</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 sticky top-0">
              {([
                ['title', 'Сделка'],
                ['company', 'Компания'],
                ['stage', 'Этап'],
                ['amount', 'Сумма'],
                ['studentCount', 'Студентов'],
                ['manager', 'Менеджер'],
              ] as [SortField, string][]).map(([field, label]) => (
                <th key={field} className="text-left px-3 py-2.5">
                  <button
                    onClick={() => handleSort(field)}
                    className="flex items-center text-[10.5px] font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
                  >
                    {label}<SortIcon field={field} />
                  </button>
                </th>
              ))}
              <th className="text-left px-3 py-2.5 hidden lg:table-cell">
                <span className="text-[10.5px] font-medium text-slate-500 uppercase tracking-wider">Курсы</span>
              </th>
              <th className="text-left px-3 py-2.5 hidden xl:table-cell">
                <span className="text-[10.5px] font-medium text-slate-500 uppercase tracking-wider">Источник</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((deal, i) => (
              <tr
                key={deal.id}
                onClick={() => onDealClick(deal)}
                className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors group"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const p = getTopTaskPriority(deal);
                      const hasTask = deal.history.some(h => h.type === 'task');
                      if (!hasTask) return <span className="text-[9px] text-slate-300 border border-slate-200 rounded px-1 py-0.5 flex-shrink-0">нет задач</span>;
                      if (!p) return null;
                      return <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p === 'high' ? 'bg-rose-500' : p === 'medium' ? 'bg-amber-400' : 'bg-slate-400'}`} />;
                    })()}
                    <span className="font-medium text-slate-900 text-[13px]">{deal.title}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[13px] text-slate-600">{getCompanyName(deal.companyId)}</td>
                <td className="px-3 py-2.5">
                  <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                    {getStageName(deal.stageId)}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-[13px] font-medium text-slate-900 whitespace-nowrap">
                  {formatAmount(deal.amount)}
                </td>
                <td className="px-3 py-2.5 text-[13px] text-slate-600 text-center">
                  {deal.studentCount || '—'}
                </td>
                <td className="px-3 py-2.5 text-[13px] text-slate-600 whitespace-nowrap">
                  {getManagerName(deal.accountManagerId)}
                </td>
                <td className="px-3 py-2.5 text-[12px] text-slate-500 hidden lg:table-cell max-w-[160px] truncate">
                  {getCourseNames(deal.courseIds) || '—'}
                </td>
                <td className="px-3 py-2.5 text-[12px] text-slate-500 hidden xl:table-cell whitespace-nowrap">
                  {deal.source || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Icon name="SearchX" size={28} className="mb-3 opacity-50" />
            <p className="text-sm">Ничего не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
}