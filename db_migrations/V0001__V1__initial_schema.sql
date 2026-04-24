CREATE TABLE IF NOT EXISTS t_p92580427_crm_sales_system.companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  legal_entities JSONB NOT NULL DEFAULT '[]',
  segment TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p92580427_crm_sales_system.contacts (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phones JSONB NOT NULL DEFAULT '[]',
  emails JSONB NOT NULL DEFAULT '[]',
  position TEXT NOT NULL DEFAULT '',
  is_decision_maker BOOLEAN NOT NULL DEFAULT FALSE,
  company_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p92580427_crm_sales_system.courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p92580427_crm_sales_system.managers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p92580427_crm_sales_system.deals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  stage_id TEXT NOT NULL DEFAULT 'base',
  amount NUMERIC NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT '',
  course_ids JSONB NOT NULL DEFAULT '[]',
  student_count INTEGER NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  account_manager_id TEXT,
  invoice_number TEXT NOT NULL DEFAULT '',
  invoice_date TEXT NOT NULL DEFAULT '',
  payment_date TEXT NOT NULL DEFAULT '',
  company_id TEXT,
  contact_ids JSONB NOT NULL DEFAULT '[]',
  history JSONB NOT NULL DEFAULT '[]',
  tags JSONB NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_deals_stage ON t_p92580427_crm_sales_system.deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_company ON t_p92580427_crm_sales_system.deals(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON t_p92580427_crm_sales_system.contacts(company_id);
