import { useState } from 'react';
import {
  Deal, Company, Contact, Manager, Course, HistoryItem,
  formatAmount, priorityLabel, stages, sourceOptions,
} from '@/data/crm';
import Icon from '@/components/ui/icon';

interface DealModalProps {
  deal: Deal;
  companies: Company[];
  contacts: Contact[];
  managers: Manager[];
  courses: Course[];
  onClose: () => void;
  onUpdate: (deal: Deal) => void;
}

const priorityColor: Record<string, string> = {
  low: 'text-slate-500 bg-slate-100',
  medium: 'text-amber-700 bg-amber-50',
  high: 'text-rose-700 bg-rose-50',
};

type Tab = 'info' | 'history';

function formatDt(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function DealModal({ deal, companies, contacts, managers, courses, onClose, onUpdate }: DealModalProps) {
  const [tab, setTab] = useState<Tab>('info');
  const [historyText, setHistoryText] = useState('');
  const [historyType, setHistoryType] = useState<'comment' | 'task'>('comment');
  const [taskDueAt, setTaskDueAt] = useState('');

  const company = companies.find(c => c.id === deal.companyId);
  const dealContacts = contacts.filter(c => deal.contactIds.includes(c.id));
  const manager = managers.find(m => m.id === deal.accountManagerId);
  const dealCourses = courses.filter(c => deal.courseIds.includes(c.id));
  const currentStage = stages.find(s => s.id === deal.stageId);

  const addHistory = () => {
    if (!historyText.trim()) return;
    const now = new Date().toISOString();
    const newItem: HistoryItem = historyType === 'comment'
      ? { id: `h${Date.now()}`, type: 'comment', text: historyText, author: 'Вы', createdAt: now }
      : { id: `h${Date.now()}`, type: 'task', text: historyText, author: 'Вы', createdAt: now, dueAt: taskDueAt || now, done: false };
    onUpdate({ ...deal, history: [...deal.history, newItem] });
    setHistoryText('');
    setTaskDueAt('');
  };

  const toggleTask = (itemId: string) => {
    onUpdate({
      ...deal,
      history: deal.history.map(h =>
        h.id === itemId && h.type === 'task' ? { ...h, done: !h.done } : h
      ),
    });
  };

  const handleStageChange = (stageId: string) => onUpdate({ ...deal, stageId });

  const sortedHistory = [...deal.history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col animate-slide-up">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-base font-semibold text-slate-900 leading-tight">{deal.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{company?.name ?? '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2 py-1 rounded font-medium ${priorityColor[deal.priority]}`}>
              {priorityLabel[deal.priority]}
            </span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 transition-colors">
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>

        {/* Stage selector */}
        <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => handleStageChange(stage.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all whitespace-nowrap ${
                  deal.stageId === stage.id
                    ? 'border-slate-900 bg-slate-900 text-white font-medium'
                    : 'border-slate-200 text-slate-500 hover:border-slate-400'
                }`}
              >
                {stage.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 flex-shrink-0">
          {(['info', 'history'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'info' ? 'Информация' : (
                <span className="flex items-center gap-1.5">
                  История
                  {deal.history.length > 0 && (
                    <span className="bg-slate-200 text-slate-600 text-[10px] rounded-full px-1.5 font-mono">
                      {deal.history.length}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'info' && (
            <div className="p-5 space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Сумма</p>
                  <p className="font-mono text-lg font-semibold text-slate-900">{formatAmount(deal.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Источник</p>
                  <p className="text-sm text-slate-700">{deal.source || '—'}</p>
                </div>
              </div>

              {/* Courses */}
              {dealCourses.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Курсы</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dealCourses.map(c => (
                      <span key={c.id} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{c.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Row 2 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Студентов</p>
                  <p className="text-sm text-slate-700">{deal.studentCount || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Старт</p>
                  <p className="text-sm text-slate-700">{deal.startDate ? new Date(deal.startDate).toLocaleDateString('ru-RU') : '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Окончание</p>
                  <p className="text-sm text-slate-700">{deal.endDate ? new Date(deal.endDate).toLocaleDateString('ru-RU') : '—'}</p>
                </div>
              </div>

              {/* Manager + Invoice */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Аккаунт менеджер</p>
                  <p className="text-sm text-slate-700 flex items-center gap-1">
                    <Icon name="User" size={12} />
                    {manager?.name ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Номер счета</p>
                  <p className="text-sm font-mono text-slate-700">{deal.invoiceNumber || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Дата выставления счета</p>
                  <p className="text-sm text-slate-700">{deal.invoiceDate ? new Date(deal.invoiceDate).toLocaleDateString('ru-RU') : '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Дата оплаты</p>
                  <p className="text-sm text-slate-700">{deal.paymentDate ? new Date(deal.paymentDate).toLocaleDateString('ru-RU') : '—'}</p>
                </div>
              </div>

              {/* Company */}
              {company && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">Компания</p>
                  <div className="bg-slate-50 rounded-lg p-3 text-sm">
                    <p className="font-medium text-slate-800">{company.name}</p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-slate-500 text-xs">
                      {company.segment && <span className="flex items-center gap-1"><Icon name="Tag" size={10} />{company.segment}</span>}
                      {company.region && <span className="flex items-center gap-1"><Icon name="MapPin" size={10} />{company.region}</span>}
                      {company.city && <span>{company.city}</span>}
                    </div>
                    {company.legalEntities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {company.legalEntities.map(le => (
                          <span key={le.id} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                            {le.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contacts */}
              {dealContacts.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">Контакты</p>
                  <div className="space-y-2">
                    {dealContacts.map(c => (
                      <div key={c.id} className="bg-slate-50 rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-800">{c.fullName}</p>
                          {c.isDecisionMaker && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">ЛПР</span>
                          )}
                        </div>
                        {c.position && <p className="text-xs text-slate-500 mt-0.5">{c.position}</p>}
                        <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-slate-600">
                          {c.phones.map(p => (
                            <span key={p.id} className="flex items-center gap-1">
                              <Icon name="Phone" size={10} />{p.value}
                              <span className="text-slate-400">({p.type})</span>
                            </span>
                          ))}
                          {c.emails.map(e => (
                            <span key={e.id} className="flex items-center gap-1">
                              <Icon name="Mail" size={10} />{e.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'history' && (
            <div className="p-5 flex flex-col gap-4">
              {/* Add comment/task */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setHistoryType('comment')}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${historyType === 'comment' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
                  >
                    Комментарий
                  </button>
                  <button
                    onClick={() => setHistoryType('task')}
                    className={`text-xs px-2.5 py-1 rounded border transition-colors ${historyType === 'task' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
                  >
                    Задача
                  </button>
                </div>
                <textarea
                  value={historyText}
                  onChange={e => setHistoryText(e.target.value)}
                  placeholder={historyType === 'comment' ? 'Написать комментарий...' : 'Описание задачи...'}
                  rows={2}
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-slate-400 transition-colors bg-white"
                />
                {historyType === 'task' && (
                  <div className="mt-2">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Срок выполнения</label>
                    <input
                      type="datetime-local"
                      value={taskDueAt}
                      onChange={e => setTaskDueAt(e.target.value)}
                      className="text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-slate-400 transition-colors bg-white"
                    />
                  </div>
                )}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={addHistory}
                    disabled={!historyText.trim()}
                    className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  >
                    {historyType === 'comment' ? 'Добавить' : 'Создать задачу'}
                  </button>
                </div>
              </div>

              {/* History list */}
              <div className="space-y-2">
                {sortedHistory.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">История пуста</p>
                )}
                {sortedHistory.map((item) => {
                  const isOverdue = item.type === 'task' && !item.done && new Date(item.dueAt) < new Date();
                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg p-3 border ${
                        item.type === 'task'
                          ? isOverdue
                            ? 'bg-rose-50 border-rose-200'
                            : item.done
                            ? 'bg-emerald-50 border-emerald-200 opacity-70'
                            : 'bg-blue-50 border-blue-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {item.type === 'task' ? (
                          <button onClick={() => toggleTask(item.id)} className="mt-0.5 flex-shrink-0">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${item.done ? 'bg-emerald-500 border-emerald-500' : isOverdue ? 'border-rose-400' : 'border-slate-300 hover:border-slate-500'}`}>
                              {item.done && <Icon name="Check" size={10} className="text-white" />}
                            </div>
                          </button>
                        ) : (
                          <Icon name="MessageSquare" size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm text-slate-800 ${item.done ? 'line-through text-slate-400' : ''}`}>
                            {item.text}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Icon name="User" size={10} />{item.author}
                            </span>
                            <span className="text-slate-400 flex items-center gap-1">
                              <Icon name="Clock" size={10} />{formatDt(item.createdAt)}
                            </span>
                            {item.type === 'task' && (
                              <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600' : item.done ? 'text-emerald-600' : 'text-blue-600'}`}>
                                <Icon name="CalendarClock" size={10} />
                                {item.done ? 'Выполнено' : isOverdue ? 'Просрочено · ' : 'До: '}
                                {!item.done && formatDt(item.dueAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
