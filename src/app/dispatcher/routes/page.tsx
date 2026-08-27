'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import { Route } from '../../../lib/optimization/types';
import {
  Route as RouteIcon,
  Truck,
  User,
  Navigation,
  Clock,
  Fuel,
  DollarSign,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Package,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { formatCurrencyINR } from '../../../lib/utils/cn';

export default function DispatcherRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>(() => fleetMindStore.getRoutes());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    initSupabaseStoreSync(true);
    const unsub = fleetMindStore.subscribe(() => {
      setRoutes(fleetMindStore.getRoutes());
    });
    return unsub;
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await initSupabaseStoreSync(true);
    setRoutes(fleetMindStore.getRoutes());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <>
      <PortalHeader
        title="Active Dispatch Routes"
        subtitle="Turn-by-turn stop sequences, dynamic cost calculations, fuel burn, and waypoint status"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <RouteIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {routes.length} Active Fleet Route{routes.length === 1 ? '' : 's'}
              </h2>
              <p className="text-xs text-slate-500">Live operational corridors synchronized across all hubs</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/dispatcher/optimize"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Route Optimizer
            </Link>
          </div>
        </div>

        {routes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <RouteIcon className="w-8 h-8 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">No Active Routes Currently Generated</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Assign pending consignments to vehicles in the Shipments desk or run the AI Optimization Engine to build multi-stop highway corridors.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/dispatcher/shipments"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                <Package className="w-4 h-4" />
                Assign Shipments
              </Link>
              <Link
                href="/dispatcher/optimize"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
              >
                <Sparkles className="w-4 h-4" />
                Run Optimization
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-5 hover:border-blue-200 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-sm">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-slate-900">{route.route_code}</h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                          {route.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Vehicle: <strong className="text-slate-900">{route.lorry_code}</strong> • Pilot:{' '}
                        <strong className="text-slate-900">{route.driver_name || 'Murugan Selvam'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-xs text-slate-600">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Corridor</span>
                      <strong className="text-slate-900 text-sm">{route.total_distance_km || 320} km</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Fuel Burn</span>
                      <strong className="text-blue-600 text-sm">{route.fuel_consumption_liters || 48} L</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Cost</span>
                      <strong className="text-emerald-700 text-sm">₹{(route.estimated_cost || 8400).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="hidden sm:block bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Stops</span>
                      <strong className="text-indigo-600 text-sm">{route.stops?.length || 2} Waypoints</strong>
                    </div>
                  </div>
                </div>

                {/* Stops Timeline */}
                <div>
                  <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Waypoint Sequence ({route.stops?.length || 0} Stops)</span>
                    <Link
                      href="/dispatcher/live"
                      className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1 normal-case"
                    >
                      Track on Live Fleet Map <ArrowRight className="w-3 h-3" />
                    </Link>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(route.stops || []).map((stop, sidx) => (
                      <div
                        key={stop.id || sidx}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
                          stop.status === 'COMPLETED'
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : stop.stop_type === 'PICKUP'
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-blue-50/50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-black text-[11px] px-2 py-0.5 rounded-md ${
                              stop.stop_type === 'PICKUP'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {stop.stop_sequence || sidx + 1}. {stop.stop_type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {stop.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                          </span>
                        </div>

                        <p className="text-slate-800 font-medium line-clamp-2 text-[11px]">
                          {stop.address || 'Designated Freight Corridor Hub'}
                        </p>

                        <div className="flex items-center justify-between pt-1.5 text-[10px] text-slate-500 font-semibold border-t border-slate-200/60">
                          <span>
                            ETA:{' '}
                            {stop.arrival_eta
                              ? new Date(stop.arrival_eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : '09:00 AM'}
                          </span>
                          <span className={stop.status === 'COMPLETED' ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                            {stop.status || 'PENDING'}
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
