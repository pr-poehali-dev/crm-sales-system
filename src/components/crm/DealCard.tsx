import { Deal, formatAmount, HistoryTask } from '@/data/crm';
import Icon from '@/components/ui/icon';

interface DealCardProps {
  deal: Deal;
  companyName: string;
  onClick: (deal: Deal) => void;
  dragging?: boolean;
}

// Highest priority among active (non-done) tasks
function getTopTaskPriority(deal: Deal): 'high' | 'medium' | 'low' | null {
  const activeTasks = deal.history.filter(
    (h): h is HistoryTask => h.type === 'task' && !h.done
  );
  if (activeTasks.length === 0) return null;
  if (activeTasks.some(t => t.priority === 'high')) return 'high';
  if (activeTasks.some(t => t.priority === 'medium')) return 'medium';
  return 'low';
}

const priorityDot: Record<string, string> = {
  low:    'bg-slate-400',
  medium: 'bg-amber-400',
  high:   'bg-rose-500',
};

const priorityRing: Record<string, string> = {
  high:   'ring-rose-200',
  medium: 'ring-amber-200',
  low:    'ring-slate-200',
};

export default function DealCard({ deal, companyName, onClick, dragging }: DealCardProps) {
  const topPriority = getTopTaskPriority(deal);
  const hasTasks = deal.history.some(h => h.type === 'task');
  const hasOverdue = deal.history.some(
    (h): h is HistoryTask => h.type === 'task' && !h.done && new Date(h.dueAt) < new Date()
  );

  return (
    <div
      onClick={() => onClick(deal)}
      className={`
        group bg-white border rounded-lg p-3 cursor-pointer
        hover:shadow-sm transition-all duration-150 select-none
        ${dragging ? 'opacity-40 scale-95' : ''}
        ${topPriority ? `border-slate-200 ring-2 ${priorityRing[topPriority]}` : 'border-slate-200 hover:border-slate-300'}
      `}
    >
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <span className="text-[12.5px] font-medium text-slate-900 leading-snug line-clamp-2 flex-1">
          {deal.title}
        </span>

        {/* Priority indicator from tasks */}
        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
          {topPriority && (
            <span className={`w-2 h-2 rounded-full ${priorityDot[topPriority]}`} title={`Задача: ${topPriority === 'high' ? 'высокий' : topPriority === 'medium' ? 'средний' : 'низкий'} приоритет`} />
          )}
          {!hasTasks && (
            <span className="text-[9px] text-slate-300 font-medium leading-none border border-slate-200 rounded px-1 py-0.5" title="Нет задач">
              нет задач
            </span>
          )}
          {hasOverdue && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Есть просроченные задачи" />
          )}
        </div>
      </div>

      {companyName && (
        <div className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
          <Icon name="Building2" size={10} />
          {companyName}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] font-medium text-slate-800">
          {formatAmount(deal.amount)}
        </span>
        <div className="flex items-center gap-2">
          {deal.studentCount > 0 && (
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <Icon name="Users" size={9} />
              {deal.studentCount}
            </span>
          )}
          {hasOverdue && (
            <span className="text-[10px] text-rose-500 flex items-center gap-0.5 font-medium">
              <Icon name="AlertCircle" size={10} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
