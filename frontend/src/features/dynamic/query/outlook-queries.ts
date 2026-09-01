import { API_PREFIX, api } from '@/lib/http';

export interface OutlookConnectionStatus {
  connected: boolean;
  accountEmail?: string;
  expiresAt?: string;
}

export async function getOutlookConnectionStatus(): Promise<OutlookConnectionStatus> {
  const { data } = await api.get<OutlookConnectionStatus>(
    `${API_PREFIX}/integrations/microsoft/calendar/status`
  );
  return data;
}

export async function beginOutlookConnection(): Promise<void> {
  const { data } = await api.get<{ url: string }>(
    `${API_PREFIX}/integrations/microsoft/calendar/auth-url`
  );
  window.location.assign(data.url);
}
