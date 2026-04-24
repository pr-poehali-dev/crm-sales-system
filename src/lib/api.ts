const BASE = 'https://functions.poehali.dev/8c95edcd-3e56-472a-81ce-fc2131b06e3c';

async function request<T>(entity: string, method = 'GET', body?: unknown, id?: string): Promise<T> {
  const params = new URLSearchParams({ e: entity });
  if (id) params.set('id', id);
  const res = await fetch(`${BASE}?${params}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${entity} → ${res.status}: ${text}`);
  }
  const ct = res.headers.get('Content-Type') || '';
  if (ct.includes('text/csv')) return res.text() as unknown as T;
  return res.json();
}

export const api = {
  seed: () => request('seed', 'POST'),

  getDeals: () => request<unknown[]>('deals'),
  addDeal: (d: unknown) => request('deals', 'POST', d),
  updateDeal: (id: string, d: unknown) => request('deals', 'PUT', d, id),

  getCompanies: () => request<unknown[]>('companies'),
  addCompany: (d: unknown) => request('companies', 'POST', d),
  updateCompany: (id: string, d: unknown) => request('companies', 'PUT', d, id),

  getContacts: () => request<unknown[]>('contacts'),
  addContact: (d: unknown) => request('contacts', 'POST', d),
  updateContact: (id: string, d: unknown) => request('contacts', 'PUT', d, id),

  getCourses: () => request<unknown[]>('courses'),
  addCourse: (d: unknown) => request('courses', 'POST', d),
  updateCourse: (id: string, d: unknown) => request('courses', 'PUT', d, id),

  getManagers: () => request<unknown[]>('managers'),
  addManager: (d: unknown) => request('managers', 'POST', d),

  exportCsv: () => request<string>('export'),
  importCsv: (csv: string) => request<{ imported: number }>('import', 'POST', { csv }),
};
