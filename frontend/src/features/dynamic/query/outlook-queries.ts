import { API_PREFIX, api } from '@/lib/http';

import { getApiErrorMessage } from '@/lib/api-errors';

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

export async function beginOutlookConnection(
  navigate: (url: string) => void = (url) => window.location.assign(url)
): Promise<string> {
  const { data } = await api.get<{ url: string }>(
    `${API_PREFIX}/integrations/microsoft/calendar/auth-url`
  );
  if (!data?.url) {
    throw new Error('No authorization URL returned');
  }
  navigate(data.url);
  return data.url;
}

export function getSafeOutlookAuthErrorMessage(err: unknown): string {
  const fallback = 'Failed to connect Outlook';
  if (!err) return fallback;

  let raw = '';
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: { message?: unknown; error?: unknown } } }).response
      ?.data;
    if (typeof data?.message === 'string' && data.message.trim()) {
      raw = data.message.trim();
    } else if (typeof data?.error === 'string' && data.error.trim()) {
      raw = data.error.trim();
    }
  }
  if (!raw) {
    raw = getApiErrorMessage(err, fallback).trim();
  }
  if (!raw) return fallback;

  if (
    /bearer|token|secret|credential|password|key|private|outlook\.office|graph\.microsoft|@/i.test(
      raw
    )
  ) {
    return fallback;
  }

  return raw;
}

export async function handleOutlookConnect({
  setConnecting,
  setErrorMessage,
  onNavigate,
  connectFn = beginOutlookConnection,
}: {
  setConnecting: (connecting: boolean) => void;
  setErrorMessage: (err: string | null) => void;
  onNavigate?: (url: string) => void;
  connectFn?: (navigate?: (url: string) => void) => Promise<string | void>;
}): Promise<void> {
  setConnecting(true);
  setErrorMessage(null);
  try {
    await connectFn(onNavigate);
  } catch (err: unknown) {
    setConnecting(false);
    setErrorMessage(getSafeOutlookAuthErrorMessage(err));
  }
}
