'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getOfflineQueue, clearOfflineQueue, markActionSynced, QueuedDriverAction } from '../../lib/utils/offline-queue';
import { fleetMindStore } from '../../lib/db/store';

export function OfflineBar() {
  const [isOnline, setIsOnline] = useState(true);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    const updateQueue = () => setQueuedCount(getOfflineQueue().length);
    updateQueue();

    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateQueue();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const interval = setInterval(updateQueue, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const syncQueue = async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    let synced = 0;

    for (const item of queue) {
      try {
        fleetMindStore.recordDeliveryEvent({
          shipment_id: item.shipment_id,
          route_id: item.route_id,
          driver_id: item.driver_id,
          driver_name: item.driver_name,
          event_type: item.event_type,
          latitude: item.latitude,
          longitude: item.longitude,
          notes: item.notes ? `${item.notes} [Synced from Offline Queue]` : '[Synced from Offline Queue]',
          recipient_name: item.recipient_name,
          signature_svg: item.signature_svg,
        });
        markActionSynced(item.idempotency_key);
        synced++;
      } catch (e) {
        console.error('Failed to sync offline action:', e);
      }
    }

    clearOfflineQueue();
    setQueuedCount(0);
    setIsSyncing(false);
    setSyncSuccessMsg(`Successfully synchronized ${synced} queued offline action(s)!`);
    setTimeout(() => setSyncSuccessMsg(null), 4000);
  };

  if (isOnline && queuedCount === 0 && !syncSuccessMsg) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>Offline Mode Active. Driver actions will be securely queued in local storage.</span>
          </div>
          {queuedCount > 0 && (
            <span className="bg-amber-600/60 px-2 py-0.5 rounded text-[11px]">
              {queuedCount} action{queuedCount > 1 ? 's' : ''} queued
            </span>
          )}
        </div>
      )}

      {isOnline && queuedCount > 0 && (
        <div className="bg-blue-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Connection Restored: {queuedCount} offline delivery event(s) ready to sync.</span>
          </div>
          <button
            onClick={syncQueue}
            disabled={isSyncing}
            className="px-3 py-1 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded shadow-sm transition disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}

      {syncSuccessMsg && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}
    </div>
  );
}
