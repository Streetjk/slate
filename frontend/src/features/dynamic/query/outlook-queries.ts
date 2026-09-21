import { API_PREFIX, api } from '@/lib/http';

export type OutlookDeviceFlowStatus =
  | 'STARTING'
  | 'WAITING_USER'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface OutlookDeviceFlow {
  flowId: string;
  status: OutlookDeviceFlowStatus;
  verificationUri: string | null;
  userCode: string | null;
  expiresAt: string;
  error: string | null;
}

export interface OutlookConnectionStatus {
  connected: boolean;
  configured: boolean;
  accountEmail?: string;
  expiresAt?: string;
}

export async function getOutlookConnectionStatus(): Promise<OutlookConnectionStatus> {
  const { data } = await api.get<OutlookConnectionStatus>(
    `${API_PREFIX}/integrations/microsoft/calendar/status`
  );
  return data;
}

export async function beginOutlookConnection(): Promise<OutlookDeviceFlow> {
  const { data } = await api.post<OutlookDeviceFlow>(
    API_PREFIX + '/integrations/microsoft/calendar/device'
  );
  return data;
}

export async function getOutlookDeviceFlow(flowId: string): Promise<OutlookDeviceFlow> {
  const { data } = await api.get<OutlookDeviceFlow>(
    API_PREFIX + '/integrations/microsoft/calendar/device/' + encodeURIComponent(flowId)
  );
  return data;
}

export async function cancelOutlookDeviceFlow(flowId: string): Promise<void> {
  await api.delete(
    API_PREFIX + '/integrations/microsoft/calendar/device/' + encodeURIComponent(flowId)
  );
}
