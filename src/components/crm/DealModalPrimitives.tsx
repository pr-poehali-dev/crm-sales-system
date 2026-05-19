import { useState, useRef, useEffect } from 'react';
import { Course } from '@/data/crm';
import Icon from '@/components/ui/icon';

export function formatDt(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatDate(s: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const taskPriorityStyle: Record<string, string> = {
  low:    'text-slate-500 bg-slate-100',
  medium: 'text-amber-700 bg-amber-50 border border-amber-200',
  high:   'text-rose-700 bg-rose-50 border border-rose-200',
};

export const inpCls = "w-full text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5 transition-colors";
export const modalInp = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white";
export const modalLbl = "text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      {children}
    </div>
  );
}

export function EditableText({ value, onChange, placeholder, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder ?? '—'} className={`${inpCls} ${mono ? 'font-mono' : ''}`} />;
}

export function EditableSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={`${inpCls} appearance-none cursor-pointer`}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function EditableDate({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input type="date" value={value} onChange={e => onChange(e.target.value)} className={inpCls} />;
}

export function TagEditor({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };
  return (
    <div className="flex flex-wrap gap-1.5 mt-1 items-center">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
          {t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} className="text-slate-400 hover:text-rose-500 transition-colors"><Icon name="X" size={9} /></button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        placeholder="+ тег"
        className="text-xs border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent py-0.5 w-20" />
    </div>
  );
}

export function CoursesDropdown({ courses, selected, onToggle, onAddNew, onEditCourse }: {
  courses: Course[];
  selected: string[];
  onToggle: (id: string) => void;
  onAddNew: () => void;
  onEditCourse: (c: Course) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selectedNames = courses.filter(c => selected.includes(c.id)).map(c => c.name);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none py-0.5 transition-colors text-left">
        <span className={selectedNames.length ? '' : 'text-slate-400'}>
          {selectedNames.length ? selectedNames.join(', ') : 'Выбрать курсы...'}
        </span>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={13} className="text-slate-400 flex-shrink-0 ml-2" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-52 overflow-y-auto">
          {courses.map(c => (
            <div key={c.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer group">
              <div onClick={() => onToggle(c.id)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected.includes(c.id) ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}>
                {selected.includes(c.id) && <Icon name="Check" size={10} className="text-white" />}
              </div>
              <span onClick={() => onToggle(c.id)} className="flex-1 text-sm text-slate-700">{c.name}</span>
              <button onClick={() => { onEditCourse(c); setOpen(false); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition-all">
                <Icon name="Pencil" size={11} />
              </button>
            </div>
          ))}
          <button onClick={() => { onAddNew(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 border-t border-slate-100">
            <Icon name="Plus" size={12} /> Добавить курс
          </button>
        </div>
      )}
    </div>
  );
}
