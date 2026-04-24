const BASE = 'https://functions.poehali.dev/8c95edcd-3e56-472a-81ce-fc2131b06e3c';

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path} → ${res.status}: ${text}`);
  }
  // CSV export returns text
  const ct = res.headers.get('Content-Type') || '';
  if (ct.includes('text/csv')) return res.text() as unknown as T;
  return res.json();
}

export const api = {
  // Seed initial data
  seed: () => request('/seed', 'POST'),

  // Deals
  getDeals: () => request<unknown[]>('/deals'),
  addDeal: (d: unknown) => request('/deals', 'POST', d),
  updateDeal: (id: string, d: unknown) => request(`/deals/${id}`, 'PUT', d),

  // Companies
  getCompanies: () => request<unknown[]>('/companies'),
  addCompany: (d: unknown) => request('/companies', 'POST', d),
  updateCompany: (id: string, d: unknown) => request(`/companies/${id}`, 'PUT', d),

  // Contacts
  getContacts: () => request<unknown[]>('/contacts'),
  addContact: (d: unknown) => request('/contacts', 'POST', d),
  updateContact: (id: string, d: unknown) => request(`/contacts/${id}`, 'PUT', d),

  // Courses
  getCourses: () => request<unknown[]>('/courses'),
  addCourse: (d: unknown) => request('/courses', 'POST', d),
  updateCourse: (id: string, d: unknown) => request(`/courses/${id}`, 'PUT', d),

  // Managers
  getManagers: () => request<unknown[]>('/managers'),
  addManager: (d: unknown) => request('/managers', 'POST', d),

  // CSV Export — returns CSV string
  exportCsv: () => request<string>('/export'),

  // CSV Import
  importCsv: (csv: string) => request<{ imported: number }>('/import', 'POST', { csv }),
};
