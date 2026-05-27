import { useState } from 'react';
import { Deal, HistoryItem, HistoryTask, TaskPriority, taskPriorityLabel, stages, stagesDiag } from '@/data/crm';
import Icon from '@/components/ui/icon';
import { formatDt, taskPriorityStyle } from './DealModalPrimitives';

const allStages = [...stages, ...stagesDiag];

// ─── Task edit form ───────────────────────────────────────────────────────
function TaskEditForm({ task, onSave, onCancel }: {
  task: HistoryTask; onSave: (updated: HistoryTask) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({ text: task.text, dueAt: task.dueAt ? task.dueAt.slice(0, 10) : '', priority: task.priority });
  return (
    <div className="mt-2 space-y-2 bg-slate-50 rounded-lg p-3 border border-slate-200">
      <textarea value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} rows={2}
        className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-slate-400 bg-white" />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Срок</label>
          <input type="date" value={form.dueAt} onChange={e => setForm(p => ({ ...p, dueAt: e.target.value }))}
            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-slate-400 bg-white" />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Приоритет</label>
          <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))}
            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-slate-400 bg-white">
            <option value="high">Высокий</option><option value="medium">Средний</option><option value="low">Низкий</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-xs px-3 py-1.5 border border-slate-200 rounded-md text-slate-600 hover:border-slate-400">Отмена</button>
        <button onClick={() => onSave({ ...task, text: form.text, dueAt: form.dueAt, priority: form.priority })} disabled={!form.text.trim()}
          className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40">Сохранить</button>
      </div>
    </div>
  );
}

// ─── TaskItem component ───────────────────────────────────────────────────
export function TaskItem({ item, completeTask, undoneTask, saveTask }: {
  item: HistoryTask;
  completeTask: (id: string, result: string, duplicateDate?: string) => void;
  undoneTask: (id: string) => void;
  saveTask: (t: HistoryTask) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = !item.done && item.dueAt.slice(0, 10) < today;
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState('');
  const [repeat, setRepeat] = useState(false);
  const [repeatDate, setRepeatDate] = useState(item.dueAt ? item.dueAt.slice(0, 10) : '');
  const [editing, setEditing] = useState(false);

  const handleComplete = () => {
    completeTask(item.id, result, repeat && repeatDate ? new Date(repeatDate).toISOString() : undefined);
    setExpanded(false);
    setResult('');
    setRepeat(false);
  };

  return (
    <div className={`rounded-lg border transition-all ${isOverdue ? 'bg-rose-50 border-rose-200' : item.done ? 'bg-emerald-50 border-emerald-200 opacity-70' : 'bg-blue-50 border-blue-100'}`}>

      {/* Main row */}
      <div className="flex items-start gap-2 p-3">
        <button
          onClick={() => item.done ? undoneTask(item.id) : setExpanded(p => !p)}
          className="mt-0.5 flex-shrink-0"
        >
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
            item.done ? 'bg-emerald-500 border-emerald-500' :
            expanded ? 'border-slate-500' :
            isOverdue ? 'border-rose-400 hover:border-rose-600' :
            'border-slate-300 hover:border-slate-500'
          }`}>
            {item.done && <Icon name="Check" size={10} className="text-white" />}
          </div>
        </button>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !item.done && !editing && setExpanded(p => !p)}>
          <div className="flex items-center gap-2 mb-0.5">
            <p className={`text-sm text-slate-800 flex-1 ${item.done ? 'line-through text-slate-400' : ''}`}>{item.text}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${taskPriorityStyle[item.priority]}`}>
              {taskPriorityLabel[item.priority]}
            </span>
          </div>
          {item.done && item.result && (
            <p className="text-xs text-slate-500 italic mb-0.5">Результат: {item.result}</p>
          )}
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Icon name="User" size={10} />{item.author}</span>
            <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600' : item.done ? 'text-emerald-600' : 'text-blue-600'}`}>
              <Icon name="CalendarClock" size={10} />
              {item.done ? `Выполнено${item.doneAt ? ' · ' + formatDt(item.doneAt) : ''}` : isOverdue ? `Просрочено · ${formatDt(item.dueAt)}` : `До: ${formatDt(item.dueAt)}`}
            </span>
          </div>
          {editing && <TaskEditForm task={item} onSave={t => { saveTask(t); setEditing(false); }} onCancel={() => setEditing(false)} />}
        </div>

        {!item.done && (
          <button
            onClick={e => { e.stopPropagation(); setEditing(p => !p); setExpanded(false); }}
            className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-700 border border-transparent hover:border-slate-200 rounded transition-colors"
          >
            <Icon name="Pencil" size={10} />
          </button>
        )}
      </div>

      {/* Completion panel */}
      {expanded && !item.done && !editing && (
        <div className="border-t border-blue-100 px-3 pb-3 pt-2.5 space-y-2.5 bg-white/60 rounded-b-lg">
          <div>
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
              Результат выполнения
            </label>
            <textarea
              value={result}
              onChange={e => setResult(e.target.value)}
              placeholder="Напишите результат или комментарий..."
              rows={2}
              autoFocus
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setRepeat(p => !p)}>
              <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${repeat ? 'bg-slate-900 border-slate-900' : 'border-slate-300 hover:border-slate-500'}`}>
                {repeat && <Icon name="Check" size={9} className="text-white" />}
              </div>
              <span className="text-xs text-slate-700">Повторить задачу</span>
            </label>
            {repeat && (
              <input
                type="date"
                value={repeatDate}
                onChange={e => setRepeatDate(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-slate-400 bg-white"
              />
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-700 font-medium"
            >
              <Icon name="CheckCircle2" size={12} />
              Выполнено
            </button>
            <button
              onClick={() => { setExpanded(false); setResult(''); setRepeat(false); }}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── History tab ──────────────────────────────────────────────────────────
interface DealModalHistoryTabProps {
  deal: Deal;
  onUpdate: (deal: Deal) => void;
}

export function DealModalHistoryTab({ deal, onUpdate }: DealModalHistoryTabProps) {
  const [historyText, setHistoryText] = useState('');
  const [historyType, setHistoryType] = useState<'comment' | 'task'>('comment');
  const [taskDueAt, setTaskDueAt] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');

  const addHistory = () => {
    if (!historyText.trim()) return;
    const now = new Date().toISOString();
    const item: HistoryItem = historyType === 'comment'
      ? { id: `h${Date.now()}`, type: 'comment', text: historyText, author: 'Вы', createdAt: now }
      : { id: `h${Date.now()}`, type: 'task', text: historyText, author: 'Вы', createdAt: now, dueAt: taskDueAt || now, done: false, priority: taskPriority };
    onUpdate({ ...deal, history: [...deal.history, item] });
    setHistoryText(''); setTaskDueAt(''); setTaskPriority('medium');
  };

  const completeTask = (itemId: string, result: string, duplicateDate?: string) => {
    const updated = deal.history.map(h =>
      h.id === itemId && h.type === 'task'
        ? { ...h, done: true, result: result || undefined, doneAt: new Date().toISOString() }
        : h
    );
    if (duplicateDate) {
      const orig = deal.history.find(h => h.id === itemId) as HistoryTask | undefined;
      if (orig) {
        const newTask: HistoryTask = {
          id: `h${Date.now()}`,
          type: 'task',
          text: orig.text,
          author: orig.author,
          createdAt: new Date().toISOString(),
          dueAt: duplicateDate,
          done: false,
          priority: orig.priority,
        };
        onUpdate({ ...deal, history: [...updated, newTask] });
        return;
      }
    }
    onUpdate({ ...deal, history: updated });
  };

  const undoneTask = (itemId: string) =>
    onUpdate({ ...deal, history: deal.history.map(h => h.id === itemId && h.type === 'task' ? { ...h, done: false, result: undefined, doneAt: undefined } : h) });

  const saveTask = (updated: HistoryTask) =>
    onUpdate({ ...deal, history: deal.history.map(h => h.id === updated.id ? updated : h) });

  const activeTasks = deal.history.filter(h => h.type === 'task' && !(h as HistoryTask).done) as HistoryTask[];
  const restHistory = deal.history
    .filter(h => !(h.type === 'task' && !(h as HistoryTask).done))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const sortedActiveTasks = [...activeTasks].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  return (
    <div className="p-5 flex flex-col gap-4">
      {/* Add form */}
      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
        <div className="flex gap-2 mb-2">
          {(['comment', 'task'] as const).map(t => (
            <button key={t} onClick={() => setHistoryType(t)}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${historyType === t ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
              {t === 'comment' ? 'Комментарий' : 'Задача'}
            </button>
          ))}
        </div>
        <textarea value={historyText} onChange={e => setHistoryText(e.target.value)}
          placeholder={historyType === 'comment' ? 'Написать комментарий...' : 'Описание задачи...'}
          rows={2} className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-slate-400 bg-white" />
        {historyType === 'task' && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Срок</label>
              <input type="date" value={taskDueAt} onChange={e => setTaskDueAt(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-slate-400 bg-white" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Приоритет</label>
              <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-slate-400 bg-white">
                <option value="high">Высокий</option><option value="medium">Средний</option><option value="low">Низкий</option>
              </select>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-2">
          <button onClick={addHistory} disabled={!historyText.trim()}
            className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40 transition-colors">
            {historyType === 'comment' ? 'Добавить' : 'Создать задачу'}
          </button>
        </div>
      </div>

      {/* Active tasks */}
      {sortedActiveTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="Pin" size={10} /> Активные задачи
          </p>
          {sortedActiveTasks.map(item => (
            <TaskItem key={item.id} item={item} completeTask={completeTask} undoneTask={undoneTask} saveTask={saveTask} />
          ))}
        </div>
      )}

      {/* Rest of history */}
      {restHistory.length > 0 && (
        <div className="space-y-2">
          {sortedActiveTasks.length > 0 && <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Лента</p>}
          {restHistory.map(item => {
            if (item.type === 'stage_change') {
              const from = allStages.find(s => s.id === item.fromStageId);
              const to = allStages.find(s => s.id === item.toStageId);
              return (
                <div key={item.id} className="flex items-center gap-2 text-xs text-slate-500 py-1">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="ArrowRight" size={10} className="text-slate-400" />
                  </div>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{from?.name ?? item.fromStageId}</span>
                    <Icon name="ArrowRight" size={10} />
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded">{to?.name ?? item.toStageId}</span>
                    <span className="text-slate-400">· {item.author} · {formatDt(item.createdAt)}</span>
                  </span>
                </div>
              );
            }
            if (item.type === 'task') {
              return <TaskItem key={item.id} item={item as HistoryTask} completeTask={completeTask} undoneTask={undoneTask} saveTask={saveTask} />;
            }
            return (
              <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Icon name="MessageSquare" size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-800">{item.text}</p>
                    <div className="flex gap-3 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><Icon name="User" size={10} />{item.author}</span>
                      <span className="flex items-center gap-1"><Icon name="Clock" size={10} />{formatDt(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deal.history.length === 0 && <p className="text-sm text-slate-400 text-center py-6">История пуста</p>}
    </div>
  );
}