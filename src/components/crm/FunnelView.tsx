import { useState } from 'react';
import { Deal, Stage, Company, formatAmount } from '@/data/crm';
import DealCard from './DealCard';
import Icon from '@/components/ui/icon';

interface FunnelViewProps {
  deals: Deal[];
  stages: Stage[];
  companies: Company[];
  onDealClick: (deal: Deal) => void;
  onStageChange: (dealId: string, stageId: string) => void;
  onAddDeal: (stageId: string) => void;
  searchQuery: string;
}

export default function FunnelView({ deals, stages, companies, onDealClick, onStageChange, onAddDeal, searchQuery }: FunnelViewProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overStageId, setOverStageId] = useState<string | null>(null);

  const getCompanyName = (companyId: string) => companies.find(c => c.id === companyId)?.name ?? '';

  const filtered = searchQuery
    ? deals.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCompanyName(d.companyId).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : deals;

  const getDealsByStage = (stageId: string) => filtered.filter(d => d.stageId === stageId);
  const getStageTotal = (stageId: string) => getDealsByStage(stageId).reduce((s, d) => s + d.amount, 0);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedId(dealId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setOverStageId(stageId);
  };
  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedId) onStageChange(draggedId, stageId);
    setDraggedId(null);
    setOverStageId(null);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 items-start" style={{ minHeight: 'calc(100vh - 140px)' }}>
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

            <div
              className={`
                flex-1 rounded-lg p-1.5 space-y-1.5 transition-all duration-150 min-h-[120px]
                ${isOver ? 'bg-slate-100 ring-1 ring-slate-300' : 'bg-slate-50'}
              `}
            >
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
  );
}
