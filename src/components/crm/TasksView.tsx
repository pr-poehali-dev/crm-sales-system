import { useState, useMemo } from 'react';
import { HistoryTask } from '@/data/crm';
import Icon from '@/components/ui/icon';
import { TabKey, FlatTask, EditForm, TasksViewProps } from './TasksViewTypes';
import { TaskCard } from './TasksViewCard';
import { SectionTab } from './TasksViewTabs';

export default function TasksView({ deals, companies, onUpdateDeal, onDealClick }: TasksViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDeal, setFilterDeal] = useState<string>('all');
  const [showDone, setShowDone] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

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
  const overdueTasks  = useMemo(() => allTasks.filter(t => !t.done && t.dueAt.slice(0, 10) < today), [allTasks]);
  const activeTasks   = useMemo(() => allTasks.filter(t => !t.done && t.dueAt.slice(0, 10) >= today), [allTasks]);
  const doneTasks     = useMemo(() => allTasks.filter(t => t.done), [allTasks]);

  // ── Sort helper ───────────────────────────────────────────────────────────
  function sortTasks(list: FlatTask[]): FlatTask[] {
    return [...list].sort((a, b) => {
      const aOverdue = a.dueAt.slice(0, 10) < today && !a.done;
      const bOverdue = b.dueAt.slice(0, 10) < today && !b.done;
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

  function handleComplete(task: FlatTask, result: string, duplicateDate?: string) {
    updateTask(task, { done: true, result: result || undefined, doneAt: new Date().toISOString() });
    if (duplicateDate) {
      const deal = deals.find(d => d.id === task.dealId);
      if (!deal) return;
      const newTask: HistoryTask = {
        id: `h${Date.now()}`,
        type: 'task',
        text: task.text,
        author: task.author,
        createdAt: new Date().toISOString(),
        dueAt: duplicateDate,
        done: false,
        priority: task.priority,
      };
      onUpdateDeal({ ...deal, history: [...deal.history, newTask] });
    }
  }

  function handleUndone(task: FlatTask) {
    updateTask(task, { done: false, result: undefined, doneAt: undefined });
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
                onComplete={handleComplete}
                onUndone={handleUndone}
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