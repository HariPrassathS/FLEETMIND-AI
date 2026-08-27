import { DeliveryEventType } from '../../types/database';

export interface QueuedDriverAction {
  idempotency_key: string;
  shipment_id: string;
  route_id?: string;
  driver_id: string;
  driver_name: string;
  event_type: DeliveryEventType;
  latitude?: number;
  longitude?: number;
  notes?: string;
  recipient_name?: string;
  signature_svg?: string;
  timestamp: string;
}

const STORAGE_KEY = 'fleetmind_driver_offline_queue';
const SYNCED_KEYS = 'fleetmind_synced_idempotency_keys';

export function getOfflineQueue(): QueuedDriverAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueDriverAction(action: Omit<QueuedDriverAction, 'idempotency_key' | 'timestamp'>): QueuedDriverAction {
  const queuedItem: QueuedDriverAction = {
    ...action,
    idempotency_key: `action-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const current = getOfflineQueue();
    current.push(queuedItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }

  return queuedItem;
}

export function clearOfflineQueue() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function isActionAlreadySynced(idempotencyKey: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(SYNCED_KEYS);
    const keys: string[] = raw ? JSON.parse(raw) : [];
    return keys.includes(idempotencyKey);
  } catch {
    return false;
  }
}

export function markActionSynced(idempotencyKey: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SYNCED_KEYS);
    const keys: string[] = raw ? JSON.parse(raw) : [];
    if (!keys.includes(idempotencyKey)) {
      keys.push(idempotencyKey);
      localStorage.setItem(SYNCED_KEYS, JSON.stringify(keys.slice(-200)));
    }
  } catch {}
}
