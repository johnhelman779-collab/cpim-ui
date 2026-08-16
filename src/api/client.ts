const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const TOKEN_KEY = "cpim_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  protocol: string;
  endpoint: string;
  connection?: string;
  lastPolledAt?: string;
  values?: Record<string, boolean | number | string>;
  tags: Array<{ name: string; dataType: string; description: string }>;
}

export interface DeviceStatus {
  deviceId: string;
  name: string;
  protocol: string;
  endpoint: string;
  connection: string;
  lastPolledAt: string;
  values: Record<string, boolean | number | string>;
}

export interface CpimException {
  id: string;
  deviceId: string;
  deviceName?: string;
  code: string;
  message: string;
  severity: string;
  status: string;
  createdAt: string;
  acknowledgedAt?: string;
}

export function login(username: string, password: string) {
  return request<{ token: string; user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function listDevices() {
  return request<{ devices: Device[] }>("/api/devices");
}

export function getDeviceStatus(id: string) {
  return request<DeviceStatus>(`/api/devices/${id}/status`);
}

export function writeDeviceTag(id: string, tag: string, value: boolean | number | string) {
  return request<{ deviceId: string; tag: string; value: unknown }>(`/api/devices/${id}/write`, {
    method: "POST",
    body: JSON.stringify({ tag, value }),
  });
}

export function listExceptions() {
  return request<{ exceptions: CpimException[] }>("/api/exceptions");
}

export function ackException(id: string) {
  return request<{ exception: CpimException }>(`/api/exceptions/${id}/ack`, {
    method: "PATCH",
  });
}
