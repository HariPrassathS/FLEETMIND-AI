'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { LineChart as LineChartIcon, TrendingUp, Sparkles, AlertCircle, MapPin, Inbox } from 'lucide-react';

export default function ManagerTrendsPage() {
  const [shipments, setShipments] = useState(fleetMindStore.getShipments());

  useEffect(() => {
    const update = () => setShipments(fleetMindStore.getShipments());
    update();
    const unsub = fleetMindStore.subscribe(update);
    return unsub;
  }, []);

  // Compute live corridor volumes
  const corridorCounts: Record<string, number> = {};
  shipments.forEach((s) => {
    const key = `${s.pickup_city} → ${s.destination_city}`;
    corridorCounts[key] = (corridorCounts[key] || 0) + 1;
  });

  const corridorEntries = Object.entries(corridorCounts);

  return (
    <>
      <PortalHeader
        title="Freight Trends & Predictive Forecasting"
        subtitle="Corridor demand forecasting, seasonal agricultural freight spikes & predictive fleet capacity needs"
        category="FleetMind AI · Predictive Intelligence"
        icon={<LineChartIcon className="w-5 h-5" />}
        accent="indigo"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <Sparkles className="w-4 h-4" />
            <span>AI Predictive Demand & Corridor Analytics</span>
          </div>

          {corridorEntries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {corridorEntries.map(([corridor, count], idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{corridor}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                      {count} Shipments
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Active freight corridor volume. AI heuristics recommend dynamic capacity consolidation.
                  </p>
                  <div className="text-[11px] text-blue-700 font-semibold pt-1">
                    Action: Pre-stage carriers at {corridor.split(' → ')[0]} hub.
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 space-y-2 bg-slate-50/50">
              <Inbox className="w-8 h-8 text-slate-300" />
              <p className="font-semibold text-slate-600">No Active Corridor Shipments</p>
              <p className="max-w-xs text-[11px] text-slate-400">
                Corridor demand forecasting will populate automatically as shipments are booked across freight lanes.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
