import { useState } from 'react';
import { TaskPriority, taskPriorityLabel } from '@/data/crm';
import Icon from '@/components/ui/icon';
import {
  FlatTask, EditForm,
  formatDt, toDatetimeLocal,
  priorityBadgeClass, priorityDotClass,
} from './TasksViewTypes';

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${priorityBadgeClass[priority]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${priorityDotClass[priority]}`} />
      {taskPriorityLabel[priority]}
    </span>
  );
}

interface TaskCardProps {
  task: FlatTask;
  isOverdue: boolean;
  onComplete: (task: FlatTask, result: string, duplicateDate?: string) => void;
  onUndone: (task: FlatTask) => void;
  onSaveEdit: (task: FlatTask, form: EditForm) => void;
  onDealClick: (dealId: string) => void;
}

export function TaskCard({ task, isOverdue, onComplete, onUndone, onSaveEdit, onDealClick }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState('');
  const [repeat, setRepeat] = useState(false);
  const [repeatDate, setRepeatDate] = useState(toDatetimeLocal(task.dueAt));

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({
    text: task.text,
    dueAt: toDatetimeLocal(task.dueAt),
    priority: task.priority,
  });

  const handleComplete = () => {
    onComplete(task, result, repeat && repeatDate ? new Date(repeatDate).toISOString() : undefined);
    setExpanded(false);
    setResult('');
    setRepeat(false);
  };

  const handleSave = () => {
    if (!form.text.trim()) return;
    onSaveEdit(task, { ...form, dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : task.dueAt });
    setEditing(false);
  };

  const inp = "w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors bg-white";

  return (
    <div className={`bg-white border rounded-lg transition-all ${isOverdue && !task.done ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'} ${task.done ? 'opacity-60' : ''}`}>

      {/* ── Main row ── */}
      <div className="flex items-start gap-3 p-4">

        {/* Checkbox */}
        <button
          onClick={() => task.done ? onUndone(task) : setExpanded(p => !p)}
          className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            task.done ? 'bg-slate-900 border-slate-900' :
            expanded ? 'border-slate-500' :
            isOverdue ? 'border-rose-400 hover:border-rose-600' :
            'border-slate-300 hover:border-slate-500'
          }`}
          title={task.done ? 'Отметить невыполненной' : 'Нажмите для выполнения'}
        >
          {task.done && <Icon name="Check" size={10} className="text-white" />}
        </button>

        {/* Text + meta */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !task.done && !editing && setExpanded(p => !p)}>
          {editing ? (
            <div className="space-y-2.5" onClick={e => e.stopPropagation()}>
              <textarea
                value={form.text}
                onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                rows={2}
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white resize-none"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Срок</label>
                  <input type="date" value={form.dueAt} onChange={e => setForm(p => ({ ...p, dueAt: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Приоритет</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))} className={inp}>
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-700 font-medium">Сохранить</button>
                <button onClick={() => { setForm({ text: task.text, dueAt: toDatetimeLocal(task.dueAt), priority: task.priority }); setEditing(false); }}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400">Отмена</button>
              </div>
            </div>
          ) : (
            <>
              <p className={`text-sm text-slate-800 leading-snug ${task.done ? 'line-through text-slate-400' : ''}`}>
                {task.text}
              </p>
              {task.done && task.result && (
                <p className="text-xs text-slate-500 mt-1 italic">Результат: {task.result}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <PriorityBadge priority={task.priority} />
                {isOverdue && !task.done && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-700 border border-rose-200">
                    <Icon name="AlertCircle" size={11} /> Просрочено
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Icon name="Clock" size={11} className="text-slate-400" />
                  {formatDt(task.dueAt)}
                </span>
                {task.author && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Icon name="User" size={11} className="text-slate-300" />
                    {task.author}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                <Icon name="Briefcase" size={11} className="text-slate-300 flex-shrink-0" />
                <button onClick={e => { e.stopPropagation(); onDealClick(task.dealId); }}
                  className="text-xs text-slate-500 hover:text-slate-800 hover:underline truncate max-w-[200px]">
                  {task.dealTitle}
                </button>
                {task.companyName && (
                  <>
                    <span className="text-slate-300 text-xs">·</span>
                    <span className="text-xs text-slate-400 truncate max-w-[160px]">{task.companyName}</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Edit button */}
        {!editing && !task.done && (
          <button
            onClick={e => { e.stopPropagation(); setEditing(true); setExpanded(false); }}
            className="flex-shrink-0 p-1.5 text-slate-300 hover:text-slate-600 border border-slate-200 hover:border-slate-400 rounded-lg transition-colors"
            title="Редактировать"
          >
            <Icon name="Pencil" size={11} />
          </button>
        )}
      </div>

      {/* ── Completion panel ── */}
      {expanded && !task.done && !editing && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3 bg-slate-50/60 rounded-b-lg">

          {/* Result field */}
          <div>
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
              Результат выполнения
            </label>
            <textarea
              value={result}
              onChange={e => setResult(e.target.value)}
              placeholder="Напишите результат или комментарий к задаче..."
              rows={2}
              autoFocus
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white resize-none"
            />
          </div>

          {/* Repeat toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setRepeat(p => !p)}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${repeat ? 'bg-slate-900 border-slate-900' : 'border-slate-300 hover:border-slate-500'}`}>
                {repeat && <Icon name="Check" size={10} className="text-white" />}
              </div>
              <span className="text-sm text-slate-700">Повторить задачу</span>
            </label>
            {repeat && (
              <input
                type="date"
                value={repeatDate}
                onChange={e => setRepeatDate(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-400 bg-white"
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              <Icon name="CheckCircle2" size={13} />
              Выполнено
            </button>
            <button
              onClick={() => { setExpanded(false); setResult(''); setRepeat(false); }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}