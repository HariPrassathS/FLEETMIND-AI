'use client';

import React from 'react';
import { fleetMindStore } from '../../../lib/db/store';
import { Clock, CheckCircle2, MapPin } from 'lucide-react';

export default function DriverHistoryPage() {
  const events = fleetMindStore.getDeliveryEvents();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Completed Deliveries History</h2>
        <p className="text-xs text-slate-500">Immutable delivery events logged with timestamps</p>
      </div>

      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {ev.event_type.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {new Date(ev.created_at).toLocaleString()}
              </span>
            </div>
            {ev.notes && <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl">{ev.notes}</p>}
            {ev.recipient_name && (
              <p className="text-[11px] text-slate-500">
                Received by: <strong className="text-slate-800">{ev.recipient_name}</strong>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
