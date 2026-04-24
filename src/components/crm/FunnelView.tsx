import { useState } from 'react';
import { Deal, Stage, formatAmount } from '@/data/crm';
import DealCard from './DealCard';
import Icon from '@/components/ui/icon';

interface FunnelViewProps {
  deals: Deal[];
  stages: Stage[];
  onDealClick: (deal: Deal) => void;
  onStageChange: (dealId: string, stageId: string) => void;
  onAddDeal: (stageId: string) => void;
}

export default function FunnelView({ deals, stages, onDealClick, onStageChange, onAddDeal }: FunnelViewProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overStageId, setOverStageId] = useState<string | null>(null);

  const getDealsByStage = (stageId: string) => deals.filter(d => d.stageId === stageId);
  const getStageTotal = (stageId: string) => deals.filter(d => d.stageId === stageId).reduce((s, d) => s + d.amount, 0);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedId(dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverStageId(stageId);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedId) {
      onStageChange(draggedId, stageId);
    }
    setDraggedId(null);
    setOverStageId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setOverStageId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-full">
      {stages.map((stage) => {
        const stageDeals = getDealsByStage(stage.id);
        const isOver = overStageId === stage.id;

        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-[260px] flex flex-col"
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDrop={(e) => handleDrop(e, stage.id)}
            onDragLeave={() => setOverStageId(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-[13px] font-medium text-slate-700">{stage.name}</span>
                <span className="text-[12px] text-slate-400 bg-slate-100 px-1.5 rounded tabular-nums">
                  {stageDeals.length}
                </span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 mb-3">
              {formatAmount(getStageTotal(stage.id))}
            </div>

            <div
              className={`
                flex-1 min-h-[200px] rounded-lg border-2 border-dashed transition-all duration-150 p-2 space-y-2
                ${isOver
                  ? 'border-slate-400 bg-slate-50'
                  : 'border-transparent'
                }
              `}
            >
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  onDragEnd={handleDragEnd}
                >
                  <DealCard
                    deal={deal}
                    onClick={onDealClick}
                    dragging={draggedId === deal.id}
                  />
                </div>
              ))}

              <button
                onClick={() => onAddDeal(stage.id)}
                className="w-full text-[12px] text-slate-400 hover:text-slate-600 py-2 rounded border border-dashed border-slate-200 hover:border-slate-400 transition-all duration-150 flex items-center justify-center gap-1"
              >
                <Icon name="Plus" size={12} />
                Добавить
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
