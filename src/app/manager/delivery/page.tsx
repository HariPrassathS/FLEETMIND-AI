'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Inbox, Package } from 'lucide-react';

export default function ManagerDeliveryPage() {
  const [shipments, setShipments] = useState(fleetMindStore.getShipments());

  useEffect(() => {
    const update = () => setShipments(fleetMindStore.getShipments());
    update();
    const unsub = fleetMindStore.subscribe(update);
    return unsub;
  }, []);

  const totalCount = shipments.length;
  const deliveredCount = shipments.filter((s) => s.status === 'DELIVERED').length;
  const inTransitCount = shipments.filter((s) => s.status === 'IN_TRANSIT' || s.status === 'EN_ROUTE_TO_PICKUP').length;
  const delayedCount = shipments.filter((s) => s.status === 'DELAYED').length;
  const onTimeCount = deliveredCount + inTransitCount;
  const slaPercentage = totalCount > 0 ? ((onTimeCount / totalCount) * 100).toFixed(1) : '0.0';

  return (
    <>
      <PortalHeader
        title="Delivery Performance & SLA Analytics"
        subtitle="On-time delivery benchmarks, delay root-cause analysis, turnaround duration & client satisfaction"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">On-Time SLA Delivery</span>
            <div className="text-2xl font-black text-emerald-700">{slaPercentage}%</div>
            <p className="text-xs text-slate-500 font-medium">{onTimeCount} of {totalCount} consignments on schedule</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active In-Transit</span>
            <div className="text-2xl font-black text-blue-700">{inTransitCount} Consignments</div>
            <p className="text-xs text-slate-500 font-medium">Currently en route to destination</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Completed Deliveries</span>
            <div className="text-2xl font-black text-indigo-700">{deliveredCount} Consignments</div>
            <p className="text-xs text-slate-500 font-medium">Verified proof of delivery signed off</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Consignment Delivery SLA Status
          </h3>

          {shipments.length > 0 ? (
            <div className="space-y-2 text-xs">
              {shipments.map((s) => (
                <div key={s.id} className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between hover:bg-slate-100/70 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{s.shipment_code}</span>
                      <p className="text-[11px] text-slate-500">{s.pickup_city} → {s.destination_city} • {s.description}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                    s.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : s.status === 'DELAYED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {s.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 space-y-2 bg-slate-50/50">
              <Inbox className="w-8 h-8 text-slate-300" />
              <p className="font-semibold text-slate-600">No Consignments Recorded</p>
              <p className="max-w-xs text-[11px] text-slate-400">
                Consignments created by shippers or dispatchers will appear here for SLA tracking.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
