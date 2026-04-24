import { useState } from 'react';
import { Manager, Deal } from '@/data/crm';
import Icon from '@/components/ui/icon';

interface ManagersViewProps {
  managers: Manager[];
  deals: Deal[];
  onAdd: (name: string) => Promise<Manager>;
  onUpdate: (m: Manager) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ManagersView({ managers, deals, onAdd, onUpdate, onDelete }: ManagersViewProps) {
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim() || loading) return;
    setLoading(true);
    await onAdd(newName.trim());
    setNewName('');
    setLoading(false);
  };

  const startEdit = (m: Manager) => { setEditId(m.id); setEditName(m.name); };
  const saveEdit = async () => {
    if (!editName.trim() || !editId) return;
    await onUpdate({ id: editId, name: editName.trim() });
    setEditId(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Аккаунт менеджеры</h2>
        <span className="text-xs text-slate-400">{managers.length} чел.</span>
      </div>

      {/* Add form */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="ФИО нового менеджера..."
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white"
        />
        <button onClick={handleAdd} disabled={!newName.trim() || loading}
          className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors flex items-center gap-1.5">
          <Icon name={loading ? 'Loader' : 'Plus'} size={14} className={loading ? 'animate-spin' : ''} />
          Добавить
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {managers.map(m => {
          const dealsCount = deals.filter(d => d.accountManagerId === m.id).length;
          const isEditing = editId === m.id;
          const isConfirmDelete = confirmDeleteId === m.id;

          return (
            <div key={m.id} className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-sm font-medium text-slate-700">
                {m.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditId(null); }}
                    autoFocus
                    className="w-full text-sm border-b border-slate-400 focus:outline-none bg-transparent py-0.5"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-800">{m.name}</p>
                )}
                <p className="text-xs text-slate-400">{dealsCount} сделок</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {isEditing ? (
                  <>
                    <button onClick={saveEdit} className="text-xs px-2.5 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-700">Сохранить</button>
                    <button onClick={() => setEditId(null)} className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-md text-slate-600">Отмена</button>
                  </>
                ) : isConfirmDelete ? (
                  <>
                    <span className="text-xs text-slate-500">Удалить?</span>
                    <button onClick={async () => { await onDelete(m.id); setConfirmDeleteId(null); }}
                      className="text-xs px-2 py-1 bg-rose-600 text-white rounded hover:bg-rose-700">Да</button>
                    <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1 border border-slate-200 rounded text-slate-600">Нет</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(m)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors">
                      <Icon name="Pencil" size={13} />
                    </button>
                    <button onClick={() => setConfirmDeleteId(m.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors">
                      <Icon name="Trash2" size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {managers.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">Нет менеджеров</p>
        )}
      </div>
    </div>
  );
}
