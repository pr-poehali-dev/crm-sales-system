import { Deal, Stage, formatAmount, priorityLabel, stages } from '@/data/crm';
import Icon from '@/components/ui/icon';

interface DealModalProps {
  deal: Deal;
  onClose: () => void;
  onStageChange: (dealId: string, stageId: string) => void;
}

const priorityColor: Record<string, string> = {
  low: 'text-slate-500 bg-slate-100',
  medium: 'text-amber-700 bg-amber-50',
  high: 'text-rose-700 bg-rose-50',
};

export default function DealModal({ deal, onClose, onStageChange }: DealModalProps) {
  const currentStage = stages.find(s => s.id === deal.stageId);
  const isOverdue = new Date(deal.dueDate) < new Date();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg animate-slide-up">
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{deal.title}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{deal.company}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Сумма</p>
              <p className="font-mono text-xl font-medium text-slate-900">{formatAmount(deal.amount)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Приоритет</p>
              <span className={`text-xs font-medium px-2 py-1 rounded ${priorityColor[deal.priority]}`}>
                {priorityLabel[deal.priority]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Контакт</p>
              <p className="text-sm text-slate-700 flex items-center gap-1.5">
                <Icon name="User" size={13} />
                {deal.contact}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Срок</p>
              <p className={`text-sm flex items-center gap-1.5 ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                <Icon name="CalendarDays" size={13} />
                {new Date(deal.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {deal.tags.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">Теги</p>
              <div className="flex flex-wrap gap-1.5">
                {deal.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">Этап воронки</p>
            <div className="flex gap-1.5 flex-wrap">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => onStageChange(deal.id, stage.id)}
                  className={`text-xs px-3 py-1.5 rounded border transition-all duration-150 ${
                    deal.stageId === stage.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {stage.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
