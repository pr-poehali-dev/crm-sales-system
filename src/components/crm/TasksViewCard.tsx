import { useState } from 'react';
import { TaskPriority, taskPriorityLabel } from '@/data/crm';
import Icon from '@/components/ui/icon';
import {
  FlatTask, EditForm,
  formatDt, toDatetimeLocal,
  priorityBadgeClass, priorityDotClass,
} from './TasksViewTypes';

// ─── Priority badge ───────────────────────────────────────────────────────────

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${priorityBadgeClass[priority]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${priorityDotClass[priority]}`} />
      {taskPriorityLabel[priority]}
    </span>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: FlatTask;
  isOverdue: boolean;
  onToggleDone: (task: FlatTask, duplicateDate?: string) => void;
  onSaveEdit: (task: FlatTask, form: EditForm) => void;
  onDealClick: (dealId: string) => void;
}

export function TaskCard({ task, isOverdue, onToggleDone, onSaveEdit, onDealClick }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({
    text: task.text,
    dueAt: toDatetimeLocal(task.dueAt),
    priority: task.priority,
  });
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [duplicateDate, setDuplicateDate] = useState('');

  const handleToggleDone = () => {
    if (!task.done && showDuplicate && duplicateDate) {
      onToggleDone(task, new Date(duplicateDate).toISOString());
    } else {
      onToggleDone(task);
    }
    setShowDuplicate(false);
    setDuplicateDate('');
  };

  const handleSave = () => {
    if (!form.text.trim()) return;
    onSaveEdit(task, { ...form, dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : task.dueAt });
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({ text: task.text, dueAt: toDatetimeLocal(task.dueAt), priority: task.priority });
    setEditing(false);
  };

  const inp = "w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors bg-white";

  return (
    <div className={`bg-white border rounded-lg p-4 transition-all ${isOverdue && !task.done ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'} ${task.done ? 'opacity-60' : ''}`}>
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <button
            onClick={() => {
              if (!task.done) {
                setShowDuplicate(p => !p);
              } else {
                handleToggleDone();
              }
            }}
            className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${task.done ? 'bg-slate-900 border-slate-900' : isOverdue ? 'border-rose-400 hover:border-rose-600' : 'border-slate-300 hover:border-slate-500'}`}
            title={task.done ? 'Отметить невыполненной' : 'Отметить выполненной'}
          >
            {task.done && <Icon name="Check" size={10} className="text-white" />}
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2.5">
              <textarea
                value={form.text}
                onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                rows={2}
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors bg-white resize-none"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Срок</label>
                  <input
                    type="datetime-local"
                    value={form.dueAt}
                    onChange={e => setForm(p => ({ ...p, dueAt: e.target.value }))}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Приоритет</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))}
                    className={inp}
                  >
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className={`text-sm text-slate-800 leading-snug ${task.done ? 'line-through text-slate-400' : ''}`}>
                {task.text}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <PriorityBadge priority={task.priority} />

                {isOverdue && !task.done && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-700 border border-rose-200">
                    <Icon name="AlertCircle" size={11} />
                    Просрочено
                  </span>
                )}

                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Icon name="Clock" size={11} className="text-slate-400" />
                  {formatDt(task.dueAt)}
                </span>

                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Icon name="CalendarPlus" size={11} className="text-slate-300" />
                  {formatDt(task.createdAt)}
                </span>

                {task.author && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Icon name="User" size={11} className="text-slate-300" />
                    {task.author}
                  </span>
                )}
              </div>

              {/* Deal & Company link */}
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                <Icon name="Briefcase" size={11} className="text-slate-300 flex-shrink-0" />
                <button
                  onClick={() => onDealClick(task.dealId)}
                  className="text-xs text-slate-500 hover:text-slate-800 hover:underline transition-colors truncate max-w-[200px]"
                  title={task.dealTitle}
                >
                  {task.dealTitle}
                </button>
                {task.companyName && (
                  <>
                    <span className="text-slate-300 text-xs">·</span>
                    <button
                      onClick={() => onDealClick(task.dealId)}
                      className="text-xs text-slate-400 hover:text-slate-700 hover:underline transition-colors truncate max-w-[160px]"
                      title={task.companyName}
                    >
                      {task.companyName}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Edit button (only when not editing) */}
        {!editing && (
          <button
            onClick={() => {
              setForm({ text: task.text, dueAt: toDatetimeLocal(task.dueAt), priority: task.priority });
              setEditing(true);
            }}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:border-slate-400 transition-colors"
          >
            <Icon name="Pencil" size={11} />
            Редактировать
          </button>
        )}
      </div>

      {/* Duplicate panel — shown when marking done */}
      {showDuplicate && !task.done && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              onClick={() => setDuplicateDate(p => p ? '' : toDatetimeLocal(task.dueAt))}
              className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${duplicateDate ? 'bg-slate-900 border-slate-900' : 'border-slate-300 hover:border-slate-500'}`}
            >
              {duplicateDate && <Icon name="Check" size={9} className="text-white" />}
            </div>
            <span className="text-xs text-slate-600">Повторить задачу</span>
          </div>
          {duplicateDate !== '' && (
            <input
              type="datetime-local"
              value={duplicateDate}
              onChange={e => setDuplicateDate(e.target.value)}
              className="text-xs border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:border-slate-400 bg-white"
            />
          )}
          <div className="flex gap-1.5 ml-auto">
            <button
              onClick={handleToggleDone}
              className="px-2.5 py-1 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              Выполнено
            </button>
            <button
              onClick={() => { setShowDuplicate(false); setDuplicateDate(''); }}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-500 hover:border-slate-400 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}