import { useState } from 'react';
import { Deal, Stage, formatAmount, priorityLabel, stages } from '@/data/crm';
import Icon from '@/components/ui/icon';

interface DealsViewProps {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

const priorityBadge: Record<string, string> = {
  low: 'text-slate-500 bg-slate-100',
  medium: 'text-amber-700 bg-amber-50',
  high: 'text-rose-600 bg-rose-50',
};

const stageNames: Record<string, string> = {
  lead: 'Лид',
  contact: 'Контакт',
  proposal: 'Предложение',
  negotiation: 'Переговоры',
  won: 'Выиграно',
};

type SortField = 'title' | 'company' | 'amount' | 'dueDate' | 'priority';

export default function DealsView({ deals, onDealClick }: DealsViewProps) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('amount');
  const [sortAsc, setSortAsc] = useState(false);

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const filtered = deals
    .filter(d => {
      const q = search.toLowerCase();
      const matchSearch = d.title.toLowerCase().includes(q) || d.company.toLowerCase().includes(q) || d.contact.toLowerCase().includes(q);
      const matchStage = stageFilter === 'all' || d.stageId === stageFilter;
      return matchSearch && matchStage;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'amount') cmp = a.amount - b.amount;
      else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortField === 'company') cmp = a.company.localeCompare(b.company);
      else if (sortField === 'dueDate') cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      else if (sortField === 'priority') cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
      return sortAsc ? cmp : -cmp;
    });

  const totalAmount = filtered.reduce((s, d) => s + d.amount, 0);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Icon name="ChevronsUpDown" size={12} className="text-slate-300" />;
    return sortAsc
      ? <Icon name="ChevronUp" size={12} className="text-slate-600" />
      : <Icon name="ChevronDown" size={12} className="text-slate-600" />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по сделке, компании, контакту..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-slate-400 transition-colors cursor-pointer"
        >
          <option value="all">Все этапы</option>
          {stages.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <div className="text-sm text-slate-500 font-mono whitespace-nowrap">
          {filtered.length} сделок · {formatAmount(totalAmount)}
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3">
                <button onClick={() => handleSort('title')} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors">
                  Сделка <SortIcon field="title" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button onClick={() => handleSort('company')} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors">
                  Компания <SortIcon field="company" />
                </button>
              </th>
              <th className="text-left px-4 py-3 hidden md:table-cell">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Этап</span>
              </th>
              <th className="text-left px-4 py-3">
                <button onClick={() => handleSort('amount')} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors">
                  Сумма <SortIcon field="amount" />
                </button>
              </th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">
                <button onClick={() => handleSort('priority')} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors">
                  Приоритет <SortIcon field="priority" />
                </button>
              </th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">
                <button onClick={() => handleSort('dueDate')} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors">
                  Срок <SortIcon field="dueDate" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((deal, i) => {
              const isOverdue = new Date(deal.dueDate) < new Date();
              return (
                <tr
                  key={deal.id}
                  onClick={() => onDealClick(deal)}
                  className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors animate-fade-in group"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900 group-hover:text-slate-700">{deal.title}</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {deal.tags.map(t => (
                        <span key={t} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-700">{deal.company}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{deal.contact}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {stageNames[deal.stageId]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-medium text-slate-900">{formatAmount(deal.amount)}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-1 rounded ${priorityBadge[deal.priority]}`}>
                      {priorityLabel[deal.priority]}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs hidden lg:table-cell ${isOverdue ? 'text-rose-500 font-medium' : 'text-slate-500'}`}>
                    {new Date(deal.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Icon name="SearchX" size={32} className="mb-3 opacity-50" />
            <p className="text-sm">Ничего не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
}
