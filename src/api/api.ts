import { api } from './client';


export type WorkOrder = {
  id: number; code: string; title: string; status: 'open'|'in_progress'|'done'|'cancelled';
  version: number; updated_at?: string; customer?: { id: number; name?: string };
};


export async function listWorkOrders(params: { status?: string; since?: string; cursor?: string; per_page?: number }) {
  const { data } = await api.get('/work-orders', { params });
  return data as { data: WorkOrder[]; links?: any; meta?: any };
}


export async function getWorkOrder(id: number) {
  const { data } = await api.get(`/work-orders/${id}`);
  return data as { data: WorkOrder };
}


export async function updateWorkOrder(id: number, payload: Partial<WorkOrder>) {
  const { data } = await api.patch(`/work-orders/${id}`, payload);
  return data as { data: WorkOrder };
}


export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password, device_name: 'mobile' });
  return data as { token: string, user: { id: number; name: string; email: string } };
}


export async function listComments(workOrderId: number, page = 1) {
  const { data } = await api.get(`/work-orders/${workOrderId}/comments`, { params: { page } });
  return data;
}


export async function postComment(workOrderId: number, body: string) {
  const { data } = await api.post(`/work-orders/${workOrderId}/comments`, { body });
  return data;
}


export async function uploadAttachment(workOrderId: number, uri: string, name: string, mime: string) {
  const form = new FormData();
  form.append('file', { uri, name, type: mime } as any);
  const { data } = await api.post(`/work-orders/${workOrderId}/attachments`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}