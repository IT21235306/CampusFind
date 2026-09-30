export type User = { id: string; name: string; email: string };
export type Item = { _id: string; title: string; description: string; category: string; foundLocation: string; foundDate: string; imageUrl: string; status: 'Available' | 'Returned'; postedBy: { _id: string; name: string } | string; createdAt: string };
export type Claim = { _id: string; itemId: Item | string; claimantId: { _id: string; name: string } | string; identifyingDetails: string; status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'; createdAt: string };
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
export function imageUri(value: string) { return value.startsWith('http') ? value : `${API_URL}${value}`; }
export async function request<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error('API URL is not configured. Set EXPO_PUBLIC_API_URL.');
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, { ...options, headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
  } catch { throw new Error('Cannot reach CampusFind. Check your internet connection.'); }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data as T;
}
export function itemOwner(item: Item) { return typeof item.postedBy === 'string' ? item.postedBy : item.postedBy?._id; }
export function itemName(item: Item) { return typeof item.postedBy === 'string' ? 'Campus member' : item.postedBy?.name || 'Campus member'; }
export function itemDate(value: string) { return new Date(value).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }); }
