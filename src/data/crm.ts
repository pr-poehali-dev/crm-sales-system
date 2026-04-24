// ─── Stages ────────────────────────────────────────────────────────────────
export type Stage = { id: string; name: string; color: string };

export const stages: Stage[] = [
  { id: 'base',            name: 'База',                 color: '#cbd5e1' },
  { id: 'new_lead',        name: 'Новый лид',            color: '#93c5fd' },
  { id: 'no_answer',       name: 'Недозвон',             color: '#fca5a5' },
  { id: 'in_work',         name: 'Взято в работу',       color: '#86efac' },
  { id: 'qualify',         name: 'Квалификация',          color: '#fcd34d' },
  { id: 'negotiate',       name: 'Переговоры',           color: '#f9a8d4' },
  { id: 'contract_sent',   name: 'Договор отправлен',    color: '#a5b4fc' },
  { id: 'contract_signed', name: 'Договор подписан',     color: '#6ee7b7' },
  { id: 'invoice_sent',    name: 'Счет отправлен',       color: '#fde68a' },
  { id: 'done',            name: 'Успешно реализовано',  color: '#4ade80' },
];

// ─── Course ────────────────────────────────────────────────────────────────
export type Course = { id: string; name: string };

// ─── Manager ───────────────────────────────────────────────────────────────
export type Manager = { id: string; name: string };

// ─── Company ───────────────────────────────────────────────────────────────
export type LegalEntity = { id: string; name: string };

export type Company = {
  id: string;
  name: string;
  legalEntities: LegalEntity[];
  segment: string;
  region: string;
  city: string;
};

// ─── Contact ───────────────────────────────────────────────────────────────
export type Phone = { id: string; type: string; value: string };
export type Email = { id: string; type: string; value: string };

export type Contact = {
  id: string;
  fullName: string;
  phones: Phone[];
  emails: Email[];
  position: string;
  isDecisionMaker: boolean;
  companyId: string;
};

// ─── History ───────────────────────────────────────────────────────────────
export type HistoryComment = {
  id: string;
  type: 'comment';
  text: string;
  author: string;
  createdAt: string;
};

export type HistoryTask = {
  id: string;
  type: 'task';
  text: string;
  author: string;
  createdAt: string;
  dueAt: string;
  done: boolean;
};

export type HistoryItem = HistoryComment | HistoryTask;

// ─── Deal ──────────────────────────────────────────────────────────────────
export type Priority = 'low' | 'medium' | 'high';

export type Deal = {
  id: string;
  title: string;
  stageId: string;
  priority: Priority;
  amount: number;
  source: string;
  courseIds: string[];
  studentCount: number;
  startDate: string;
  endDate: string;
  accountManagerId: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentDate: string;
  companyId: string;
  contactIds: string[];
  history: HistoryItem[];
  createdAt: string;
  tags: string[];
};

// ─── Seed: courses ─────────────────────────────────────────────────────────
export const initialCourses: Course[] = [
  { id: 'c1', name: 'Python для начинающих' },
  { id: 'c2', name: 'Data Science' },
  { id: 'c3', name: 'UX/UI Дизайн' },
  { id: 'c4', name: 'Project Management' },
];

// ─── Seed: managers ────────────────────────────────────────────────────────
export const initialManagers: Manager[] = [
  { id: 'm1', name: 'Алексей Громов' },
  { id: 'm2', name: 'Мария Лебедева' },
  { id: 'm3', name: 'Дмитрий Орлов' },
];

// ─── Seed: companies ───────────────────────────────────────────────────────
export const initialCompanies: Company[] = [
  {
    id: 'co1',
    name: 'ООО Технолоджи',
    legalEntities: [{ id: 'le1', name: 'ООО Технолоджи' }],
    segment: 'IT',
    region: 'Центральный',
    city: 'Москва',
  },
  {
    id: 'co2',
    name: 'Медиа Групп',
    legalEntities: [{ id: 'le2', name: 'АО Медиа Групп' }, { id: 'le3', name: 'ООО МГ Медиа' }],
    segment: 'Медиа',
    region: 'Северо-Западный',
    city: 'Санкт-Петербург',
  },
  {
    id: 'co3',
    name: 'Банк Инвест',
    legalEntities: [{ id: 'le4', name: 'АО Банк Инвест' }],
    segment: 'Финансы',
    region: 'Центральный',
    city: 'Москва',
  },
];

// ─── Seed: contacts ────────────────────────────────────────────────────────
export const initialContacts: Contact[] = [
  {
    id: 'ct1',
    fullName: 'Иван Петров',
    phones: [{ id: 'p1', type: 'Рабочий', value: '+7 495 123-45-67' }],
    emails: [{ id: 'e1', type: 'Рабочий', value: 'i.petrov@tech.ru' }],
    position: 'Директор',
    isDecisionMaker: true,
    companyId: 'co1',
  },
  {
    id: 'ct2',
    fullName: 'Анна Сидорова',
    phones: [{ id: 'p2', type: 'Рабочий', value: '+7 812 987-65-43' }],
    emails: [{ id: 'e2', type: 'Рабочий', value: 'a.sidorova@media.ru' }],
    position: 'HR-директор',
    isDecisionMaker: true,
    companyId: 'co2',
  },
  {
    id: 'ct3',
    fullName: 'Михаил Козлов',
    phones: [{ id: 'p3', type: 'Личный', value: '+7 916 555-00-11' }],
    emails: [{ id: 'e3', type: 'Рабочий', value: 'm.kozlov@bankinvest.ru' }],
    position: 'CISO',
    isDecisionMaker: false,
    companyId: 'co3',
  },
];

// ─── Seed: deals ───────────────────────────────────────────────────────────
export const initialDeals: Deal[] = [
  {
    id: 'd1',
    title: 'Корпоративное обучение Python',
    stageId: 'qualify',
    priority: 'high',
    amount: 450000,
    source: 'Холодный звонок',
    courseIds: ['c1', 'c2'],
    studentCount: 15,
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    accountManagerId: 'm1',
    invoiceNumber: '',
    invoiceDate: '',
    paymentDate: '',
    companyId: 'co1',
    contactIds: ['ct1'],
    tags: ['IT', 'Крупный'],
    history: [
      { id: 'h1', type: 'comment', text: 'Провели первый созвон, клиент заинтересован', author: 'Алексей Громов', createdAt: '2026-04-10T10:30:00' },
      { id: 'h2', type: 'task', text: 'Подготовить коммерческое предложение', author: 'Алексей Громов', createdAt: '2026-04-10T10:35:00', dueAt: '2026-04-15T18:00:00', done: false },
    ],
    createdAt: '2026-04-01',
  },
  {
    id: 'd2',
    title: 'Обучение команды дизайнеров',
    stageId: 'new_lead',
    priority: 'medium',
    amount: 120000,
    source: 'Сайт',
    courseIds: ['c3'],
    studentCount: 5,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    accountManagerId: 'm2',
    invoiceNumber: '',
    invoiceDate: '',
    paymentDate: '',
    companyId: 'co2',
    contactIds: ['ct2'],
    tags: ['Дизайн'],
    history: [],
    createdAt: '2026-04-05',
  },
  {
    id: 'd3',
    title: 'PM обучение топ-менеджеров',
    stageId: 'contract_sent',
    priority: 'high',
    amount: 780000,
    source: 'Рекомендация',
    courseIds: ['c4'],
    studentCount: 8,
    startDate: '2026-05-15',
    endDate: '2026-07-15',
    accountManagerId: 'm1',
    invoiceNumber: 'СЧ-2026/042',
    invoiceDate: '2026-04-18',
    paymentDate: '',
    companyId: 'co3',
    contactIds: ['ct3'],
    tags: ['Финансы', 'Крупный'],
    history: [
      { id: 'h3', type: 'comment', text: 'Договор согласован юристами', author: 'Мария Лебедева', createdAt: '2026-04-17T14:00:00' },
    ],
    createdAt: '2026-04-08',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
export const formatAmount = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} млн ₽`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)} тыс ₽`;
  return `${amount} ₽`;
};

export const priorityLabel: Record<string, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export const sourceOptions = [
  'Холодный звонок', 'Сайт', 'Рекомендация', 'Соц. сети',
  'Email-рассылка', 'Выставка / Мероприятие', 'Партнёр',
  'Входящий звонок', 'Другое',
];

export const segmentOptions = [
  'IT', 'Финансы', 'Медиа', 'Производство', 'Ритейл',
  'Образование', 'Госсектор', 'Строительство', 'Медицина', 'Другое',
];

export const regionOptions = [
  'Центральный', 'Северо-Западный', 'Южный',
  'Приволжский', 'Уральский', 'Сибирский', 'Дальневосточный',
];
