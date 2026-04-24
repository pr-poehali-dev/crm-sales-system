import { useState } from 'react';
import { Deal, Stage, Company, Course, Manager, formatAmount, stages as allStages, sourceOptions } from '@/data/crm';
import DealCard from './DealCard';
import Icon from '@/components/ui/icon';

interface FunnelViewProps {
  deals: Deal[];
  stages: Stage[];
  companies: Company[];
  courses: Course[];
  managers: Manager[];
  onDealClick: (deal: Deal) => void;
  onStageChange: (dealId: string, stageId: string) => void;
  onAddDeal: (stageId: string) => void;
  searchQuery: string;
}

type FunnelFilters = {
  companies: string[];
  courses: string[];
  managers: string[];
  sources: string[];
  tags: string[];
  invoiceNumber: string;
  paymentDateFrom: string;
  paymentDateTo: string;
  invoiceDateFrom: string;
  invoiceDateTo: string;
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
  amountMin: string;
  amountMax: string;
  hasTasks: '' | 'yes' | 'no';
};

const emptyFilters: FunnelFilters = {
  companies: [], courses: [], managers: [], sources: [], tags: [],
  invoiceNumber: '',
  paymentDateFrom: '', paymentDateTo: '',
  invoiceDateFrom: '', invoiceDateTo: '',
  startDateFrom: '', startDateTo: '',
  endDateFrom: '', endDateTo: '',
  amountMin: '', amountMax: '',
  hasTasks: '',
};

function countActiveFilters(f: FunnelFilters): number {
  return (
    f.companies.length + f.courses.length + f.managers.length +
    f.sources.length + f.tags.length +
    (f.invoiceNumber ? 1 : 0) +
    (f.paymentDateFrom || f.paymentDateTo ? 1 : 0) +
    (f.invoiceDateFrom || f.invoiceDateTo ? 1 : 0) +
    (f.startDateFrom || f.startDateTo ? 1 : 0) +
    (f.endDateFrom || f.endDateTo ? 1 : 0) +
    (f.amountMin || f.amountMax ? 1 : 0) +
    (f.hasTasks ? 1 : 0)
  );
}

function inDateRange(dateStr: string, from: string, to: string): boolean {
  if (!from && !to) return true;
  if (!dateStr) return false;
  const d = dateStr.slice(0, 10);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function toggleArr(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

// Multi-select pill group
function PillGroup({ label, options, selected, onChange }: {
  label: string; options: { value: string; label: string }[];
  selected: string[]; onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onChange(toggleArr(selected, o.value))}
            className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${selected.includes(o.value) ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FunnelView({ deals, stages, companies, courses, managers, onDealClick, onStageChange, onAddDeal, searchQuery }: FunnelViewProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overStageId, setOverStageId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FunnelFilters>(emptyFilters);
  const [tagInput, setTagInput] = useState('');

  const getCompanyName = (companyId: string) => companies.find(c => c.id === companyId)?.name ?? '';

  // collect all tags from deals
  const allTags = Array.from(new Set(deals.flatMap(d => d.tags))).sort();

  const applyFilters = (deal: Deal): boolean => {
    const q = searchQuery.toLowerCase();
    if (q && !deal.title.toLowerCase().includes(q) && !getCompanyName(deal.companyId).toLowerCase().includes(q)) return false;
    if (filters.companies.length && !filters.companies.includes(deal.companyId)) return false;
    if (filters.courses.length && !filters.courses.some(c => deal.courseIds.includes(c))) return false;
    if (filters.managers.length && !filters.managers.includes(deal.accountManagerId)) return false;
    if (filters.sources.length && !filters.sources.includes(deal.source)) return false;
    if (filters.tags.length && !filters.tags.some(t => deal.tags.includes(t))) return false;
    if (filters.invoiceNumber && !deal.invoiceNumber.toLowerCase().includes(filters.invoiceNumber.toLowerCase())) return false;
    if (!inDateRange(deal.paymentDate, filters.paymentDateFrom, filters.paymentDateTo)) return false;
    if (!inDateRange(deal.invoiceDate, filters.invoiceDateFrom, filters.invoiceDateTo)) return false;
    if (!inDateRange(deal.startDate, filters.startDateFrom, filters.startDateTo)) return false;
    if (!inDateRange(deal.endDate, filters.endDateFrom, filters.endDateTo)) return false;
    if (filters.amountMin && deal.amount < Number(filters.amountMin)) return false;
    if (filters.amountMax && deal.amount > Number(filters.amountMax)) return false;
    if (filters.hasTasks === 'yes' && !deal.history.some(h => h.type === 'task')) return false;
    if (filters.hasTasks === 'no' && deal.history.some(h => h.type === 'task')) return false;
    return true;
  };

  const filtered = deals.filter(applyFilters);
  const activeCount = countActiveFilters(filters);

  const getDealsByStage = (stageId: string) => filtered.filter(d => d.stageId === stageId);
  const getStageTotal = (stageId: string) => getDealsByStage(stageId).reduce((s, d) => s + d.amount, 0);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedId(dealId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, stageId: string) => { e.preventDefault(); setOverStageId(stageId); };
  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedId) onStageChange(draggedId, stageId);
    setDraggedId(null); setOverStageId(null);
  };

  const upd = (patch: Partial<FunnelFilters>) => setFilters(prev => ({ ...prev, ...patch }));

  const DateRange = ({ label, fromKey, toKey }: { label: string; fromKey: keyof FunnelFilters; toKey: keyof FunnelFilters }) => (
    <div>
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex gap-1.5 items-center">
        <input type="date" value={filters[fromKey] as string} onChange={e => upd({ [fromKey]: e.target.value })}
          className="flex-1 text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400" />
        <span className="text-slate-300 text-xs">—</span>
        <input type="date" value={filters[toKey] as string} onChange={e => upd({ [toKey]: e.target.value })}
          className="flex-1 text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400" />
      </div>
    </div>
  );

  return (
    <div>
      {/* Filter toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors ${showFilter || activeCount > 0 ? 'border-slate-500 bg-slate-50 text-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
        >
          <Icon name="SlidersHorizontal" size={13} />
          Фильтры
          {activeCount > 0 && (
            <span className="bg-slate-900 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-mono">{activeCount}</span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={() => setFilters(emptyFilters)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
            <Icon name="X" size={11} /> Сбросить
          </button>
        )}
        <span className="ml-auto text-xs font-mono text-slate-400">{filtered.length} сделок</span>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="mb-4 bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <PillGroup
              label="Компания"
              options={companies.map(c => ({ value: c.id, label: c.name }))}
              selected={filters.companies}
              onChange={v => upd({ companies: v })}
            />

            <PillGroup
              label="Курсы"
              options={courses.map(c => ({ value: c.id, label: c.name }))}
              selected={filters.courses}
              onChange={v => upd({ courses: v })}
            />

            <PillGroup
              label="Менеджер"
              options={managers.map(m => ({ value: m.id, label: m.name }))}
              selected={filters.managers}
              onChange={v => upd({ managers: v })}
            />

            <PillGroup
              label="Источник"
              options={sourceOptions.map(s => ({ value: s, label: s }))}
              selected={filters.sources}
              onChange={v => upd({ sources: v })}
            />

            {allTags.length > 0 && (
              <PillGroup
                label="Теги"
                options={allTags.map(t => ({ value: t, label: t }))}
                selected={filters.tags}
                onChange={v => upd({ tags: v })}
              />
            )}

            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Теги (ввод)</p>
              <div className="flex gap-1.5">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      upd({ tags: toggleArr(filters.tags, tagInput.trim()) });
                      setTagInput('');
                    }
                  }}
                  placeholder="Введите тег + Enter"
                  className="flex-1 text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Номер счёта</p>
              <input
                value={filters.invoiceNumber}
                onChange={e => upd({ invoiceNumber: e.target.value })}
                placeholder="Поиск по номеру..."
                className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Сумма (₽)</p>
              <div className="flex gap-1.5 items-center">
                <input type="number" placeholder="от" value={filters.amountMin} onChange={e => upd({ amountMin: e.target.value })}
                  className="flex-1 text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400 font-mono" />
                <span className="text-slate-300 text-xs">—</span>
                <input type="number" placeholder="до" value={filters.amountMax} onChange={e => upd({ amountMax: e.target.value })}
                  className="flex-1 text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400 font-mono" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Задачи</p>
              <div className="flex gap-1.5">
                {([['', 'Все'], ['yes', 'Есть задачи'], ['no', 'Нет задач']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => upd({ hasTasks: v })}
                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${filters.hasTasks === v ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-100 pt-4">
            <DateRange label="Дата оплаты" fromKey="paymentDateFrom" toKey="paymentDateTo" />
            <DateRange label="Дата счёта" fromKey="invoiceDateFrom" toKey="invoiceDateTo" />
            <DateRange label="Дата старта" fromKey="startDateFrom" toKey="startDateTo" />
            <DateRange label="Дата окончания" fromKey="endDateFrom" toKey="endDateTo" />
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-4 items-start" style={{ minHeight: 'calc(100vh - 180px)' }}>
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          const isOver = overStageId === stage.id;
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-[220px] flex flex-col"
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragLeave={() => setOverStageId(null)}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                <span className="text-[11.5px] font-medium text-slate-700 truncate">{stage.name}</span>
                <span className="ml-auto text-[11px] text-slate-400 bg-slate-100 px-1.5 rounded tabular-nums flex-shrink-0">
                  {stageDeals.length}
                </span>
              </div>
              <div className="text-[10.5px] font-mono text-slate-400 mb-2 pl-4">
                {formatAmount(getStageTotal(stage.id))}
              </div>

              <div className={`flex-1 rounded-lg p-1.5 space-y-1.5 transition-all duration-150 min-h-[120px] ${isOver ? 'bg-slate-100 ring-1 ring-slate-300' : 'bg-slate-50'}`}>
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    onDragEnd={() => { setDraggedId(null); setOverStageId(null); }}
                  >
                    <DealCard
                      deal={deal}
                      companyName={getCompanyName(deal.companyId)}
                      onClick={onDealClick}
                      dragging={draggedId === deal.id}
                    />
                  </div>
                ))}
                <button
                  onClick={() => onAddDeal(stage.id)}
                  className="w-full text-[11px] text-slate-400 hover:text-slate-600 py-1.5 rounded border border-dashed border-slate-200 hover:border-slate-400 transition-all flex items-center justify-center gap-1"
                >
                  <Icon name="Plus" size={11} />
                  Добавить
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
