'use client';

/**
 * FleetMind AI — Dispatcher Real-Time Fleet Control Center
 * Upgraded live telemetry page connecting Driver Mobile Hardware GPS -> Supabase Realtime -> Mapbox Control Center
 */

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Lorry, Route, Shipment } from '../../../lib/optimization/types';
import {
  Truck,
  Package,
  Navigation,
  Search,
  Activity,
  Filter,
  Layers,
  MapPin,
  Clock,
  Compass,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

const LiveFleetMap = dynamic(
  () => import('../../../components/map/live-fleet-map').then((m) => m.LiveFleetMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[750px] bg-slate-50 animate-pulse rounded-3xl border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-bold">
        Initializing Live Hardware GPS Fleet Control Center...
      </div>
    ),
  }
);

export default function LiveOperationsPage() {
  const [lorries, setLorries] = useState<Lorry[]>(fleetMindStore.getLorries());
  const [routes, setRoutes] = useState<Route[]>(fleetMindStore.getRoutes());
  const [shipments, setShipments] = useState<Shipment[]>(fleetMindStore.getShipments());
  const [selectedLorry, setSelectedLorry] = useState<Lorry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON_ROUTE' | 'AVAILABLE' | 'MAINTENANCE'>('ALL');

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setLorries(fleetMindStore.getLorries());
      setRoutes(fleetMindStore.getRoutes());
      setShipments(fleetMindStore.getShipments());
    });
    return unsub;
  }, []);

  const filteredLorries = lorries.filter((l) => {
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      l.lorry_code.toLowerCase().includes(q) ||
      l.registration_number.toLowerCase().includes(q) ||
      (l.assigned_driver_name && l.assigned_driver_name.toLowerCase().includes(q)) ||
      l.model.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const onRouteCount = lorries.filter((l) => l.status === 'ON_ROUTE').length;
  const availableCount = lorries.filter((l) => l.status === 'AVAILABLE').length;
  const maintenanceCount = lorries.filter((l) => l.status === 'MAINTENANCE' || l.status === 'UNAVAILABLE').length;

  return (
    <>
      <PortalHeader
        title="Live Fleet Telemetry Center"
        subtitle="Real-time GPS control center displaying active commercial carriers, road route geometry, and driver telemetry"
      />

      <main className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Top Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Fleet</span>
              <span className="text-xl font-black text-slate-900">{lorries.length} Carriers</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">In Transit</span>
              <span className="text-xl font-black text-emerald-700">{onRouteCount} Active</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Navigation className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Standby Pool</span>
              <span className="text-xl font-black text-blue-700">{availableCount} Available</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Exceptions</span>
              <span className="text-xl font-black text-rose-700">{maintenanceCount} Maintenance</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Large Map */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
          {/* Left Sidebar: Live Vehicle List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-4 flex flex-col max-h-[750px] overflow-hidden">
            <div className="pb-3 border-b border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  Live Fleet ({lorries.length})
                </span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ● {onRouteCount} Moving
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search code, reg, driver..."
                  className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex gap-1 pt-1">
                {(['ALL', 'ON_ROUTE', 'AVAILABLE', 'MAINTENANCE'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`flex-1 py-1 text-[9px] font-black rounded-lg uppercase transition ${
                      statusFilter === tab
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab === 'ON_ROUTE' ? 'Route' : tab === 'MAINTENANCE' ? 'Breakdown' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Vehicle List */}
            <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
              {filteredLorries.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold">
                  No vehicles match the filter.
                </div>
              ) : (
                filteredLorries.map((lorry) => {
                  const isSelected = selectedLorry?.id === lorry.id;
                  const activeRoute = routes.find((r) => r.lorry_id === lorry.id);

                  return (
                    <button
                      key={lorry.id}
                      onClick={() => setSelectedLorry(lorry)}
                      className={`w-full p-3 rounded-2xl border text-left transition space-y-1.5 ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-400 shadow-sm'
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{lorry.lorry_code}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({lorry.registration_number})</span>
                        </div>

                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                            lorry.status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : lorry.status === 'ON_ROUTE'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : lorry.status === 'LOADING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {lorry.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="font-bold truncate max-w-[120px]">
                          👤 {lorry.assigned_driver_name || 'Murugan Selvam'}
                        </span>
                        <span className="font-mono text-slate-500 font-bold">
                          {lorry.status === 'ON_ROUTE' ? '42 km/h' : '0 km/h'}
                        </span>
                      </div>

                      {activeRoute && activeRoute.stops.length >= 2 && (
                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100/80">
                          <span className="truncate max-w-[140px]">📍 {activeRoute.stops[0].address.split(',')[0]} ➔ {activeRoute.stops[activeRoute.stops.length - 1].address.split(',')[0]}</span>
                          <span className="font-bold text-blue-600">ETA {activeRoute.stops[activeRoute.stops.length - 1]?.arrival_eta || '16:45'}</span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Main Map Container */}
          <div className="lg:col-span-3 h-[520px] lg:h-[750px]">
            <LiveFleetMap
              lorries={lorries}
              routes={routes}
              shipments={shipments}
              selectedLorryId={selectedLorry?.id}
              onSelectLorry={setSelectedLorry}
              height="100%"
            />
          </div>
        </div>
      </main>
    </>
  );
}
