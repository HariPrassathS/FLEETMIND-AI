'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Route } from '../../../lib/optimization/types';
import { Route as RouteIcon, Truck, User, Navigation, Clock, Fuel, DollarSign, CheckCircle2 } from 'lucide-react';
import { formatCurrencyINR } from '../../../lib/utils/cn';

export default function DispatcherRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>(fleetMindStore.getRoutes());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setRoutes(fleetMindStore.getRoutes());
    });
    return unsub;
  }, []);

  return (
    <>
      <PortalHeader
        title="Active Dispatch Routes"
        subtitle="Turn-by-turn stop sequences, dynamic cost calculations, fuel burn, and waypoint status"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {routes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-12 text-center space-y-3">
            <RouteIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Active Routes Generated</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Run the 15-step Fleet Optimization Engine to group pending consignments and construct optimal routes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <RouteIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{route.route_code}</h4>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                          {route.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Vehicle: <strong className="text-slate-800">{route.lorry_code}</strong> • Driver:{' '}
                        <strong className="text-slate-800">{route.driver_name}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Distance</span>
                      <strong className="text-slate-900 text-sm">{route.total_distance_km} km</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Fuel Burn</span>
                      <strong className="text-blue-600 text-sm">{route.fuel_consumption_liters} L</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Trip Expense</span>
                      <strong className="text-emerald-700 text-sm">₹{route.estimated_cost.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                {/* Stops Timeline */}
                <div>
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Waypoint Stop Sequence ({route.stops.length} Stops)
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {route.stops.map((stop, sidx) => (
                      <div
                        key={stop.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          stop.status === 'COMPLETED'
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : stop.stop_type === 'PICKUP'
                            ? 'bg-amber-50/40 border-amber-200'
                            : 'bg-blue-50/40 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-black text-[11px] ${
                              stop.stop_type === 'PICKUP' ? 'text-amber-800' : 'text-blue-800'
                            }`}
                          >
                            {sidx + 1}. {stop.stop_type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            ETA: {new Date(stop.arrival_eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-slate-700 font-medium line-clamp-2">{stop.address}</p>

                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-semibold border-t border-slate-200/60">
                          <span>Target: {new Date(stop.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className={stop.status === 'COMPLETED' ? 'text-emerald-600 font-bold' : ''}>
                            {stop.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
