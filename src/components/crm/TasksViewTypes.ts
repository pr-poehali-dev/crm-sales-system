import { Deal, Company, HistoryTask, TaskPriority } from '@/data/crm';

// ─── Types ───────────────────────────────────────────────────────────────────

export type TabKey = 'active' | 'overdue' | 'done';

export interface FlatTask extends HistoryTask {
  dealId: string;
  dealTitle: string;
  companyId: string;
  companyName: string;
}

export interface EditForm {
  text: string;
  dueAt: string;
  priority: TaskPriority;
}

export interface TasksViewProps {
  deals: Deal[];
  companies: Company[];
  onUpdateDeal: (deal: Deal) => void;
  onDealClick: (dealId: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDt(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function toDateLocal(iso: string): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

/** @deprecated use toDateLocal */
export function toDatetimeLocal(iso: string): string {
  return toDateLocal(iso);
}

// ─── Priority styling ─────────────────────────────────────────────────────────

export const priorityBadgeClass: Record<TaskPriority, string> = {
  high:   'bg-rose-50 text-rose-700 border border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  low:    'bg-slate-100 text-slate-500',
};

export const priorityDotClass: Record<TaskPriority, string> = {
  high:   'bg-rose-500',
  medium: 'bg-amber-400',
  low:    'bg-slate-400',
};