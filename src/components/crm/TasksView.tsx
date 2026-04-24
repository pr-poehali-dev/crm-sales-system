import { useState, useMemo } from 'react';
import { Deal, Company, HistoryTask, TaskPriority, taskPriorityLabel } from '@/data/crm';
import Icon from '@/components/ui/icon';

// ─── Types ──────────────────────────────────────────────────────────────────

type TabKey = 'active' | 'overdue' | 'done';

interface FlatTask extends HistoryTask {
  dealId: string;
  dealTitle: string;
  companyId: string;
  companyName: string;
}

interface EditForm {
  text: string;
  dueAt: string;
  priority: TaskPriority;
}

interface TasksViewProps {
  deals: Deal[];
  companies: Company[];
  onUpdateDeal: (deal: Deal) => void;
  onDealClick: (dealId: string) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDt(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDatetimeLocal(iso: string): string {
  if (!iso) return '';
  // datetime-local input needs "YYYY-MM-DDTHH:MM"
  return iso.slice(0, 16);
}

// ─── Priority badge ─────────────────────────────────────────────────────────

const priorityBadgeClass: Record<TaskPriority, string> = {
  high:   'bg-rose-50 text-rose-700 border border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  low:    'bg-slate-100 text-slate-500',
};

const priorityDotClass: Record<TaskPriority, string> = {
  high:   'bg-rose-500',
  medium: 'bg-amber-400',
  low:    'bg-slate-400',
};

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${priorityBadgeClass[priority]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${priorityDotClass[priority]}`} />
      {taskPriorityLabel[priority]}
    </span>
  );
}

// ─── Task Card ───────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: FlatTask;
  isOverdue: boolean;
  onToggleDone: (task: FlatTask) => void;
  onSaveEdit: (task: FlatTask, form: EditForm) => void;
  onDealClick: (dealId: string) => void;
}

function TaskCard({ task, isOverdue, onToggleDone, onSaveEdit, onDealClick }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({
    text: task.text,
    dueAt: toDatetimeLocal(task.dueAt),
    priority: task.priority,
  });

  const handleSave = () => {
    if (!form.text.trim()) return;
    onSaveEdit(task, { ...form, dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : task.dueAt });
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({ text: task.text, dueAt: toDatetimeLocal(task.dueAt), priority: task.priority });
    setEditing(false);
  };

  const inp = "w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors bg-white";

  return (
    <div className={`bg-white border rounded-lg p-4 transition-all ${isOverdue && !task.done ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'} ${task.done ? 'opacity-60' : ''}`}>
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleDone(task)}
          className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${task.done ? 'bg-slate-900 border-slate-900' : isOverdue ? 'border-rose-400 hover:border-rose-600' : 'border-slate-300 hover:border-slate-500'}`}
          title={task.done ? 'Отметить невыполненной' : 'Отметить выполненной'}
        >
          {task.done && <Icon name="Check" size={10} className="text-white" />}
        </button>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2.5">
              <textarea
                value={form.text}
                onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                rows={2}
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors bg-white resize-none"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Срок</label>
                  <input
                    type="datetime-local"
                    value={form.dueAt}
                    onChange={e => setForm(p => ({ ...p, dueAt: e.target.value }))}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Приоритет</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))}
                    className={inp}
                  >
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className={`text-sm text-slate-800 leading-snug ${task.done ? 'line-through text-slate-400' : ''}`}>
                {task.text}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <PriorityBadge priority={task.priority} />

                {isOverdue && !task.done && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-700 border border-rose-200">
                    <Icon name="AlertCircle" size={11} />
                    Просрочено
                  </span>
                )}

                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Icon name="Clock" size={11} className="text-slate-400" />
                  {formatDt(task.dueAt)}
                </span>

                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Icon name="CalendarPlus" size={11} className="text-slate-300" />
                  {formatDt(task.createdAt)}
                </span>

                {task.author && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Icon name="User" size={11} className="text-slate-300" />
                    {task.author}
                  </span>
                )}
              </div>

              {/* Deal & Company link */}
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                <Icon name="Briefcase" size={11} className="text-slate-300 flex-shrink-0" />
                <button
                  onClick={() => onDealClick(task.dealId)}
                  className="text-xs text-slate-500 hover:text-slate-800 hover:underline transition-colors truncate max-w-[200px]"
                  title={task.dealTitle}
                >
                  {task.dealTitle}
                </button>
                {task.companyName && (
                  <>
                    <span className="text-slate-300 text-xs">·</span>
                    <button
                      onClick={() => onDealClick(task.dealId)}
                      className="text-xs text-slate-400 hover:text-slate-700 hover:underline transition-colors truncate max-w-[160px]"
                      title={task.companyName}
                    >
                      {task.companyName}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Edit button (only when not editing) */}
        {!editing && (
          <button
            onClick={() => {
              setForm({ text: task.text, dueAt: toDatetimeLocal(task.dueAt), priority: task.priority });
              setEditing(true);
            }}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:border-slate-400 transition-colors"
          >
            <Icon name="Pencil" size={11} />
            Редактировать
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

interface SectionHeaderProps {
  tab: TabKey;
  active: TabKey;
  label: string;
  count: number;
  icon: string;
  iconClass: string;
  countBadgeClass: string;
  onClick: () => void;
}

function SectionTab({ tab, active, label, count, icon, iconClass, countBadgeClass, onClick }: SectionHeaderProps) {
  const isActive = tab === active;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
        isActive
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/70'
      }`}
    >
      <Icon name={icon} size={14} className={iconClass} />
      {label}
      <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-mono font-semibold ${countBadgeClass}`}>
        {count}
      </span>
    </button>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function TasksView({ deals, companies, onUpdateDeal, onDealClick }: TasksViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDeal, setFilterDeal] = useState<string>('all');
  const [showDone, setShowDone] = useState(true);

  const now = new Date();

  // ── Flatten all tasks from all deals ──────────────────────────────────────
  const allTasks = useMemo<FlatTask[]>(() => {
    const result: FlatTask[] = [];
    for (const deal of deals) {
      const company = companies.find(c => c.id === deal.companyId);
      for (const item of deal.history) {
        if (item.type === 'task') {
          result.push({
            ...(item as HistoryTask),
            dealId: deal.id,
            dealTitle: deal.title,
            companyId: deal.companyId,
            companyName: company?.name ?? '',
          });
        }
      }
    }
    return result;
  }, [deals, companies]);

  // ── Categorise ────────────────────────────────────────────────────────────
  const overdueTasks  = useMemo(() => allTasks.filter(t => !t.done && new Date(t.dueAt) < now), [allTasks]);
  const activeTasks   = useMemo(() => allTasks.filter(t => !t.done && new Date(t.dueAt) >= now), [allTasks]);
  const doneTasks     = useMemo(() => allTasks.filter(t => t.done), [allTasks]);

  // ── Sort helper ───────────────────────────────────────────────────────────
  function sortTasks(list: FlatTask[]): FlatTask[] {
    return [...list].sort((a, b) => {
      const aOverdue = new Date(a.dueAt) < now && !a.done;
      const bOverdue = new Date(b.dueAt) < now && !b.done;
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });
  }

  // ── Apply filters ─────────────────────────────────────────────────────────
  function applyFilters(list: FlatTask[]): FlatTask[] {
    return list.filter(t => {
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterDeal !== 'all' && t.dealId !== filterDeal) return false;
      return true;
    });
  }

  const currentList = useMemo(() => {
    let source: FlatTask[];
    if (activeTab === 'active')   source = activeTasks;
    else if (activeTab === 'overdue') source = overdueTasks;
    else source = doneTasks;

    let filtered = applyFilters(source);
    if (activeTab !== 'done' && !showDone) {
      filtered = filtered.filter(t => !t.done);
    }
    return sortTasks(filtered);
  }, [activeTab, activeTasks, overdueTasks, doneTasks, filterPriority, filterDeal, showDone]);

  // ── Counts after filters ──────────────────────────────────────────────────
  const counts = useMemo(() => ({
    active:  applyFilters(activeTasks).length,
    overdue: applyFilters(overdueTasks).length,
    done:    applyFilters(doneTasks).length,
  }), [activeTasks, overdueTasks, doneTasks, filterPriority, filterDeal]);

  // ── Deals that have at least one task (for filter dropdown) ───────────────
  const dealsWithTasks = useMemo(() =>
    deals.filter(d => d.history.some(h => h.type === 'task')),
    [deals]
  );

  // ── Update a single task inside its deal ─────────────────────────────────
  function updateTask(flat: FlatTask, patch: Partial<HistoryTask>) {
    const deal = deals.find(d => d.id === flat.dealId);
    if (!deal) return;
    const updatedHistory = deal.history.map(h =>
      h.id === flat.id && h.type === 'task' ? { ...h, ...patch } : h
    );
    onUpdateDeal({ ...deal, history: updatedHistory });
  }

  function handleToggleDone(task: FlatTask) {
    updateTask(task, { done: !task.done });
  }

  function handleSaveEdit(task: FlatTask, form: EditForm) {
    updateTask(task, {
      text:     form.text.trim(),
      dueAt:    form.dueAt,
      priority: form.priority,
    });
  }

  // ── Reset filters ─────────────────────────────────────────────────────────
  const hasActiveFilters = filterPriority !== 'all' || filterDeal !== 'all';

  const resetFilters = () => {
    setFilterPriority('all');
    setFilterDeal('all');
  };

  const selectCls = "text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-slate-400 transition-colors text-slate-700";

  return (
    <div className="flex flex-col h-full gap-4">

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
        <SectionTab
          tab="active"
          active={activeTab}
          label="Активные"
          count={counts.active}
          icon="ListTodo"
          iconClass="text-sky-500"
          countBadgeClass="bg-sky-100 text-sky-700"
          onClick={() => setActiveTab('active')}
        />
        <SectionTab
          tab="overdue"
          active={activeTab}
          label="Просроченные"
          count={counts.overdue}
          icon="AlertCircle"
          iconClass="text-rose-500"
          countBadgeClass={counts.overdue > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-500'}
          onClick={() => setActiveTab('overdue')}
        />
        <SectionTab
          tab="done"
          active={activeTab}
          label="Выполненные"
          count={counts.done}
          icon="CheckCircle2"
          iconClass="text-emerald-500"
          countBadgeClass="bg-emerald-50 text-emerald-700"
          onClick={() => setActiveTab('done')}
        />
      </div>

      {/* ── Filters bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Priority */}
        <div className="flex items-center gap-1.5">
          <Icon name="Flag" size={13} className="text-slate-400" />
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={selectCls}>
            <option value="all">Все приоритеты</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
        </div>

        {/* Deal */}
        <div className="flex items-center gap-1.5">
          <Icon name="Briefcase" size={13} className="text-slate-400" />
          <select value={filterDeal} onChange={e => setFilterDeal(e.target.value)} className={`${selectCls} max-w-[220px]`}>
            <option value="all">Все сделки</option>
            {dealsWithTasks.map(d => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>

        {/* Toggle show done (only in non-done tabs) */}
        {activeTab !== 'done' && (
          <button
            onClick={() => setShowDone(!showDone)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs border rounded-lg transition-colors ${
              showDone
                ? 'border-slate-200 text-slate-500 hover:border-slate-400'
                : 'border-slate-400 bg-slate-50 text-slate-700'
            }`}
          >
            <Icon name={showDone ? 'Eye' : 'EyeOff'} size={12} />
            {showDone ? 'Скрыть выполненные' : 'Показать выполненные'}
          </button>
        )}

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="X" size={11} />
            Сбросить фильтры
          </button>
        )}

        {/* Summary */}
        <span className="ml-auto text-xs text-slate-400 font-mono flex-shrink-0">
          {currentList.length} {currentList.length === 1 ? 'задача' : currentList.length >= 2 && currentList.length <= 4 ? 'задачи' : 'задач'}
        </span>
      </div>

      {/* ── Task list ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <Icon
              name={activeTab === 'done' ? 'CheckCircle2' : activeTab === 'overdue' ? 'AlertCircle' : 'ListTodo'}
              size={36}
              className="text-slate-200"
            />
            <p className="text-sm">
              {activeTab === 'active'  && 'Нет активных задач'}
              {activeTab === 'overdue' && 'Нет просроченных задач'}
              {activeTab === 'done'    && 'Нет выполненных задач'}
            </p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-slate-700 underline">
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {currentList.map(task => (
              <TaskCard
                key={`${task.dealId}-${task.id}`}
                task={task}
                isOverdue={new Date(task.dueAt) < now && !task.done}
                onToggleDone={handleToggleDone}
                onSaveEdit={handleSaveEdit}
                onDealClick={onDealClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
