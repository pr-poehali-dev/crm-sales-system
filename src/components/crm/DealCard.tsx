import { Deal, formatAmount } from '@/data/crm';
import Icon from '@/components/ui/icon';

interface DealCardProps {
  deal: Deal;
  companyName: string;
  onClick: (deal: Deal) => void;
  dragging?: boolean;
}

const priorityDot: Record<string, string> = {
  low: 'bg-slate-300',
  medium: 'bg-amber-400',
  high: 'bg-rose-500',
};

export default function DealCard({ deal, companyName, onClick, dragging }: DealCardProps) {
  return (
    <div
      onClick={() => onClick(deal)}
      className={`
        group bg-white border border-slate-200 rounded-lg p-3 cursor-pointer
        hover:border-slate-400 hover:shadow-sm transition-all duration-150 select-none
        ${dragging ? 'opacity-40 scale-95' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-[12.5px] font-medium text-slate-900 leading-snug line-clamp-2">
          {deal.title}
        </span>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${priorityDot[deal.priority]}`} />
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
