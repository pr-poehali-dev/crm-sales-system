export type Stage = {
  id: string;
  name: string;
  color: string;
};

export type Deal = {
  id: string;
  title: string;
  company: string;
  contact: string;
  amount: number;
  stageId: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  tags: string[];
  createdAt: string;
};

export const stages: Stage[] = [
  { id: 'lead', name: 'Лид', color: '#94a3b8' },
  { id: 'contact', name: 'Контакт', color: '#64748b' },
  { id: 'proposal', name: 'Предложение', color: '#475569' },
  { id: 'negotiation', name: 'Переговоры', color: '#334155' },
  { id: 'won', name: 'Выиграно', color: '#0f172a' },
];

export const initialDeals: Deal[] = [
  {
    id: '1',
    title: 'Внедрение CRM системы',
    company: 'ООО Технолоджи',
    contact: 'Иван Петров',
    amount: 450000,
    stageId: 'lead',
    priority: 'high',
    dueDate: '2026-05-10',
    tags: ['IT', 'Крупный'],
    createdAt: '2026-04-01',
  },
  {
    id: '2',
    title: 'Разработка сайта',
    company: 'Медиа Групп',
    contact: 'Анна Сидорова',
    amount: 120000,
    stageId: 'contact',
    priority: 'medium',
    dueDate: '2026-05-20',
    tags: ['Веб'],
    createdAt: '2026-04-05',
  },
  {
    id: '3',
    title: 'Аудит безопасности',
    company: 'Банк Инвест',
    contact: 'Михаил Козлов',
    amount: 780000,
    stageId: 'proposal',
    priority: 'high',
    dueDate: '2026-04-30',
    tags: ['Безопасность', 'Крупный'],
    createdAt: '2026-04-08',
  },
  {
    id: '4',
    title: 'Подписка SaaS',
    company: 'Старт Ап',
    contact: 'Елена Новикова',
    amount: 36000,
    stageId: 'negotiation',
    priority: 'low',
    dueDate: '2026-05-15',
    tags: ['SaaS'],
    createdAt: '2026-04-10',
  },
  {
    id: '5',
    title: 'Поставка оборудования',
    company: 'Завод Прибор',
    contact: 'Сергей Морозов',
    amount: 1200000,
    stageId: 'won',
    priority: 'high',
    dueDate: '2026-04-25',
    tags: ['Оборудование', 'Крупный'],
    createdAt: '2026-03-15',
  },
  {
    id: '6',
    title: 'Консалтинг по маркетингу',
    company: 'РекламаПро',
    contact: 'Дарья Белова',
    amount: 85000,
    stageId: 'lead',
    priority: 'medium',
    dueDate: '2026-06-01',
    tags: ['Маркетинг'],
    createdAt: '2026-04-15',
  },
  {
    id: '7',
    title: 'Лицензия ПО',
    company: 'Агро Холдинг',
    contact: 'Николай Волков',
    amount: 320000,
    stageId: 'contact',
    priority: 'high',
    dueDate: '2026-05-05',
    tags: ['Лицензии', 'IT'],
    createdAt: '2026-04-12',
  },
];

export const formatAmount = (amount: number): string => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)} млн ₽`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)} тыс ₽`;
  return `${amount} ₽`;
};

export const priorityLabel: Record<string, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};
