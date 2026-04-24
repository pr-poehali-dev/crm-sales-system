import { Deal, formatAmount } from '@/data/crm';
import Icon from '@/components/ui/icon';

interface DealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
  dragging?: boolean;
}

const priorityDot: Record<string, string> = {
  low: 'bg-slate-300',
  medium: 'bg-amber-400',
  high: 'bg-rose-500',
};

export default function DealCard({ deal, onClick, dragging }: DealCardProps) {
  const isOverdue = new Date(deal.dueDate) < new Date();

  return (
    <div
      onClick={() => onClick(deal)}
      draggable
      className={`
        group bg-white border border-slate-200 rounded-lg p-3.5 cursor-pointer
        hover:border-slate-400 hover:shadow-sm transition-all duration-150
        animate-fade-in select-none
        ${dragging ? 'opacity-50 scale-95' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[13px] font-medium text-slate-900 leading-tight line-clamp-2">
          {deal.title}
        </span>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${priorityDot[deal.priority]}`} />
      </div>

      <div className="text-[12px] text-slate-500 mb-1 flex items-center gap-1">
        <Icon name="Building2" size={11} />
        {deal.company}
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="font-mono text-[13px] font-medium text-slate-800">
          {formatAmount(deal.amount)}
        </span>
        <span className={`text-[11px] flex items-center gap-1 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
          <Icon name="Clock" size={10} />
          {new Date(deal.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      {deal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {deal.tags.map(tag => (
            <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
