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
  const today = new Date().toISOString().slice(0, 10);
  const hasOverdue = deal.history.some(
    (h): h is HistoryTask => h.type === 'task' && !h.done && h.dueAt.slice(0, 10) < today
  );

  const noActiveTasks = !deal.history.some(h => h.type === 'task' && !(h as HistoryTask).done);

  return (
    <div
      onClick={() => onClick(deal)}
      className={`
        group bg-white border rounded-lg p-3 cursor-pointer
        hover:shadow-sm transition-all duration-150 select-none
        ${dragging ? 'opacity-40 scale-95' : ''}
        ${hasOverdue ? 'border-rose-200 ring-2 ring-rose-200 bg-rose-50/40' : noActiveTasks ? 'border-amber-200 ring-2 ring-amber-200 bg-amber-50/40' : 'border-slate-200 hover:border-slate-300'}
      `}
    >
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <span className="text-[12.5px] font-medium text-slate-900 leading-snug line-clamp-2 flex-1">
          {deal.title}
        </span>

        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
          {hasOverdue && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Есть просроченные задачи" />
          )}
          {!hasOverdue && noActiveTasks && (
            <span className="text-[9px] text-amber-600 font-medium leading-none border border-amber-300 rounded px-1 py-0.5 bg-amber-50" title="Нет активных задач">
              нет задач
            </span>
          )}

        </div>
      </div>

      {companyName && (
        <div className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
          <Icon name="Building2" size={10} />
          {companyName}
        </div>
      )}

      {deal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {deal.tags.map(t => (
            <span key={t} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full leading-none">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] font-medium text-slate-800">
          {formatAmount(deal.amount)}
        </span>
        {deal.studentCount > 0 && (
          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
            <Icon name="Users" size={9} />
            {deal.studentCount}
          </span>
        )}
      </div>
    </div>
  );
}