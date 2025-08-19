import { api } from './client';

export type Id = number;

/** Backend enum ile uyumlu */
export type WorkOrderStatus = 'open' | 'in_progress' | 'done' | 'cancelled';

export type WorkOrder = {
  id: Id;
  code: string;
  title: string;
  status: WorkOrderStatus;
  version: number;
  scheduled_at?: string | null;
  completed_at?: string | null;
  updated_at?: string;
  deleted_at?: string | null;
  customer?: { id: Id; name?: string | null };
  assignee?: { id: Id; name?: string | null };
};

export type Attachment = {
  id: Id;
  url: string;
  mime: string;
  size?: number | null;
  original_name?: string | null;
  sha256?: string | null;
  is_malicious?: boolean;
  scanned_at?: string | null;
  uploaded_by?: Id | null;
  created_at?: string;
};

export type Comment = {
  id: Id;
  body: string;
  created_at?: string;
  user?: { id: Id; name?: string | null };
};

export type CustomerOption = { id: Id; name: string };

export type ApiCollection<T> = { data: T[]; links?: any; meta?: any };

//
// AUTH
//
export async function login(email: string, password: string, deviceName = 'mobile') {
  const { data } = await api.post<{ token: string; user: { id: Id; name: string; email: string } }>(
    '/auth/login',
    { email, password, device_name: deviceName }
  );
  return data;
}

export async function me() {
  const { data } = await api.get<{ user: { id: Id; name: string; email: string } }>('/me');
  return data.user;
}

export async function logout() {
  await api.post('/auth/logout', {});
  return true;
}

//
// WORK ORDERS
//
export type ListWorkOrdersParams = {
  status?: WorkOrderStatus | string;
  customer_id?: Id;
  assignee_id?: Id;
  since?: string; // ISO
  search?: string;
  cursor?: string;
  per_page?: number; // default 20
};

export async function listWorkOrders(params: ListWorkOrdersParams = {}) {
  const { data } = await api.get<ApiCollection<WorkOrder>>('/work-orders', { params });
  return data;
}

export type CreateWorkOrderDto = {
  code: string;
  customer_id: Id;
  title: string;
  status?: WorkOrderStatus;
  assignee_id?: Id | null;
  scheduled_at?: string | null;
};

export async function createWorkOrder(payload: CreateWorkOrderDto) {
  const { data } = await api.post<ApiItem<WorkOrder>>('/work-orders', payload);
  return data;
}

export type UpdateWorkOrderDto = Partial<{
  title: string;
  status: WorkOrderStatus;
  assignee_id: Id | null;
  scheduled_at: string | null;
  completed_at: string | null;
}> & { version: number }; // optimistic lock

export async function updateWorkOrder(id: Id, payload: UpdateWorkOrderDto) {
  const { data } = await api.patch<ApiItem<WorkOrder>>(`/work-orders/${id}`, payload);
  return data;
}

export async function deleteWorkOrder(id: Id) {
  await api.delete(`/work-orders/${id}`);
  return true;
}

//
// COMMENTS
//
export async function listComments(workOrderId: Id, page = 1) {
  const { data } = await api.get<ApiCollection<Comment>>(
    `/work-orders/${workOrderId}/comments`,
    { params: { page } }
  );
  return data;
}

export async function postComment(workOrderId: Id, body: string) {
  const { data } = await api.post<ApiItem<Comment>>(
    `/work-orders/${workOrderId}/comments`,
    { body }
  );
  return data;
}

export async function deleteComment(workOrderId: Id, commentId: Id) {
  await api.delete(`/work-orders/${workOrderId}/comments/${commentId}`);
  return true;
}

//
// ATTACHMENTS
//
export async function listAttachments(workOrderId: Id) {
  const { data } = await api.get<ApiCollection<Attachment>>(
    `/work-orders/${workOrderId}/attachments`
  );
  return data;
}

export async function uploadAttachment(workOrderId: Id, uri: string, name: string, mime: string) {
  const form = new FormData();
  form.append('file', { uri, name, type: mime } as any);
  const { data } = await api.post<ApiItem<Attachment>>(
    `/work-orders/${workOrderId}/attachments`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
}

export async function deleteAttachment(workOrderId: Id, attachmentId: Id) {
  await api.delete(`/work-orders/${workOrderId}/attachments/${attachmentId}`);
  return true;
}

//
// CUSTOMERS
//
export async function searchCustomers(q: string) {
  const { data } = await api.get<ApiCollection<CustomerOption>>('/customers', { params: { q } });
  return data;
}

export type Page<T> = ApiCollection<T> & { nextCursor?: string };

export function extractCursor(nextUrl?: string | null): string | undefined {
  if (!nextUrl) return;
  const qPos = nextUrl.indexOf('?');
  if (qPos < 0) return;
  const query = nextUrl.slice(qPos + 1);
  for (const part of query.split('&')) {
    const [k, v = ''] = part.split('=');
    if (decodeURIComponent(k) === 'cursor') {
      return decodeURIComponent(v);
    }
  }
}

// Cursor destekli liste
export async function listWorkOrdersPage(params: ListWorkOrdersParams = {}): Promise<Page<WorkOrder>> {
  const { data } = await api.get<ApiCollection<WorkOrder>>('/work-orders', { params });
  const next = (data as any)?.links?.next ?? (data as any)?.meta?.next ?? null;
  const nextCursor = extractCursor(next);
  return { ...data, nextCursor };
}


export type PageNum = number | undefined;

function extractPage(nextUrl?: string | null): number | undefined {
  if (!nextUrl) return;
  const qPos = nextUrl.indexOf('?');
  if (qPos < 0) return;
  const query = nextUrl.slice(qPos + 1);
  for (const part of query.split('&')) {
    const [k, v = ''] = part.split('=');
    if (decodeURIComponent(k) === 'page') {
      const n = Number(decodeURIComponent(v));
      return Number.isFinite(n) ? n : undefined;
    }
  }
}

export type Paged<T> = ApiCollection<T> & { nextPage?: number };

// Laravel paginate() için sayfalı yorum listesi
export async function listCommentsPage(workOrderId: Id, page = 1): Promise<Paged<Comment>> {
  const { data } = await api.get<ApiCollection<Comment>>(
    `/work-orders/${workOrderId}/comments`,
    { params: { page } }
  );
  const next = (data as any)?.links?.next ?? (data as any)?.meta?.next_page_url ?? null;
  const nextPage = extractPage(next);
  return { ...data, nextPage };
}


export type ApiItem<T> = { data: T };

// SADELEŞTİR: WorkOrder döndür
export async function getWorkOrder(id: Id): Promise<WorkOrder> {
  const { data } = await api.get<ApiItem<WorkOrder>>(`/work-orders/${id}`);
  return data.data; // <-- artık doğrudan WorkOrder
}