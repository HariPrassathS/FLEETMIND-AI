'use client';

import React from 'react';
import { fleetMindStore } from '../../../lib/db/store';
import { Package, Truck, ShieldCheck, MapPin } from 'lucide-react';

export default function DriverShipmentsPage() {
  const shipments = fleetMindStore.getShipments();
  const loadedShipments = shipments.filter(
    (s) => s.status === 'IN_TRANSIT' || s.shipment_code === 'S-1042' || s.shipment_code === 'S-1043'
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Cargo Manifest in Lorry L-11</h2>
        <p className="text-xs text-slate-500">Currently carrying {loadedShipments.length} consignments (5,000 kg total payload)</p>
      </div>

      <div className="space-y-4">
        {loadedShipments.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{s.shipment_code}</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                {s.status}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">{s.description}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Client: {s.customer_name || 'Commercial Freight'}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Weight</span>
                <p className="font-bold text-slate-900">{s.weight_kg.toLocaleString()} kg</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Volume</span>
                <p className="font-bold text-slate-900">{s.volume_m3} m³</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Drop City</span>
                <p className="font-bold text-slate-900">{s.destination_city}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">SLA Target</span>
                <p className="font-bold text-blue-600">{new Date(s.delivery_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
