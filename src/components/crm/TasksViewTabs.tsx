import Icon from '@/components/ui/icon';
import { TabKey } from './TasksViewTypes';

// ─── Section tab button ───────────────────────────────────────────────────────

interface SectionTabProps {
  tab: TabKey;
  active: TabKey;
  label: string;
  count: number;
  icon: string;
  iconClass: string;
  countBadgeClass: string;
  onClick: () => void;
}

export function SectionTab({ tab, active, label, count, icon, iconClass, countBadgeClass, onClick }: SectionTabProps) {
  const isActive = tab === active;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
        isActive
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/70'
      }`}
    >
      <Icon name={icon} size={14} className={iconClass} />
      {label}
      <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-mono font-semibold ${countBadgeClass}`}>
        {count}
      </span>
    </button>
  );
}
