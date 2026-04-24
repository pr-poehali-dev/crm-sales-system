import { useState } from 'react';
import { Deal, initialDeals, stages, formatAmount } from '@/data/crm';
import FunnelView from '@/components/crm/FunnelView';
import DealsView from '@/components/crm/DealsView';
import DealModal from '@/components/crm/DealModal';
import AddDealModal from '@/components/crm/AddDealModal';
import Icon from '@/components/ui/icon';

type View = 'funnel' | 'deals';

export default function Index() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [view, setView] = useState<View>('funnel');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [addModalStageId, setAddModalStageId] = useState<string | null>(null);

  const handleStageChange = (dealId: string, stageId: string) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stageId } : d));
    if (selectedDeal?.id === dealId) {
      setSelectedDeal(prev => prev ? { ...prev, stageId } : null);
    }
  };

  const handleAddDeal = (dealData: Omit<Deal, 'id' | 'createdAt'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDeals(prev => [...prev, newDeal]);
  };

  const totalPipeline = deals.filter(d => d.stageId !== 'won').reduce((s, d) => s + d.amount, 0);
  const wonTotal = deals.filter(d => d.stageId === 'won').reduce((s, d) => s + d.amount, 0);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center">
                  <Icon name="TrendingUp" size={13} className="text-white" />
                </div>
                <span className="font-semibold text-slate-900 text-[15px]">CRM</span>
              </div>

              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setView('funnel')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-150 ${
                    view === 'funnel'
                      ? 'bg-slate-100 text-slate-900 font-medium'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon name="Columns3" size={14} />
                  Воронка
                </button>
                <button
                  onClick={() => setView('deals')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-150 ${
                    view === 'deals'
                      ? 'bg-slate-100 text-slate-900 font-medium'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon name="List" size={14} />
                  Сделки
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden sm:flex items-center gap-5 text-sm">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">В работе</p>
                  <p className="font-mono font-medium text-slate-800">{formatAmount(totalPipeline)}</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Закрыто</p>
                  <p className="font-mono font-medium text-slate-800">{formatAmount(wonTotal)}</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Всего</p>
                  <p className="font-mono font-medium text-slate-800">{deals.length} сделок</p>
                </div>
              </div>

              <button
                onClick={() => setAddModalStageId('lead')}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                <Icon name="Plus" size={14} />
                Сделка
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {view === 'funnel' && (
          <FunnelView
            deals={deals}
            stages={stages}
            onDealClick={setSelectedDeal}
            onStageChange={handleStageChange}
            onAddDeal={(stageId) => setAddModalStageId(stageId)}
          />
        )}
        {view === 'deals' && (
          <DealsView
            deals={deals}
            onDealClick={setSelectedDeal}
          />
        )}
      </main>

      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onStageChange={handleStageChange}
        />
      )}

      {addModalStageId && (
        <AddDealModal
          defaultStageId={addModalStageId}
          onClose={() => setAddModalStageId(null)}
          onAdd={handleAddDeal}
        />
      )}
    </div>
  );
}
