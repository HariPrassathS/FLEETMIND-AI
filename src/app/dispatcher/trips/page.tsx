'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import { Trip, TripStatus } from '../../../lib/optimization/types';
import {
  Route,
  Navigation,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Truck,
  User,
  Fuel,
  IndianRupee,
  MapPin,
  Calendar,
  DollarSign,
  Receipt,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { VehicleAvatar } from '../../../components/brand/vehicle-avatar';

const DIESEL_PRICE_PER_LITER = 96.50;
const TOLL_RATE_PER_KM = 2.20;
const DRIVER_RATE_PER_KM = 6.00;

export default function DispatcherTripsPage() {
  const [trips, setTrips] = useState<Trip[]>(() => fleetMindStore.getTrips());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    initSupabaseStoreSync(true);
    const unsub = fleetMindStore.subscribe(() => {
      setTrips(fleetMindStore.getTrips());
    });
    return unsub;
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await initSupabaseStoreSync(true);
    setTrips(fleetMindStore.getTrips());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const drivers = fleetMindStore.getDrivers();
  const lorries = fleetMindStore.getLorries();

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.trip_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lorry_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.origin_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination_city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesDriver = selectedDriver === 'ALL' || t.driver_id === selectedDriver;

    return matchesSearch && matchesStatus && matchesDriver;
  });

  // Calculate live cumulative metrics across all active dispatches
  const totalFleetDistanceKm = trips.reduce((sum, t) => sum + (t.distance_km || 0), 0);
  const totalFleetFuelLiters = trips.reduce((sum, t) => {
    const lorry = lorries.find((l) => l.id === t.lorry_id || l.lorry_code === t.lorry_code);
    const eff = lorry?.fuel_efficiency_km_per_l || 7.5;
    return sum + (t.distance_km || 0) / eff;
  }, 0);
  const totalFleetFuelCostINR = Math.round(totalFleetFuelLiters * DIESEL_PRICE_PER_LITER);
  const totalFleetTollCostINR = Math.round(totalFleetDistanceKm * TOLL_RATE_PER_KM);

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            IN PROGRESS
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case 'PLANNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800">
            PLANNED
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
            APPROVED
          </span>
        );
      case 'INTERRUPTED':
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <PortalHeader
        title="Fleet Trips & Dispatch Lifecycle"
        subtitle="Manage live transit trips, fuel consumption logs, FASTag tolls, driver costs, and execution metrics"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Fleet Distance</span>
            <div className="text-2xl font-black text-slate-900">
              {Math.round(totalFleetDistanceKm).toLocaleString()} km
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Live corridor trajectories</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-600 block tracking-wider">Diesel Consumed</span>
            <div className="text-2xl font-black text-blue-700">
              {Math.round(totalFleetFuelLiters).toLocaleString()} Liters
            </div>
            <span className="text-[11px] font-semibold text-blue-600/80">Real vehicle fuel burn</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-600 block tracking-wider">Total Diesel Fuel Cost</span>
            <div className="text-2xl font-black text-emerald-700">
              ₹{totalFleetFuelCostINR.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600/80">@ ₹{DIESEL_PRICE_PER_LITER.toFixed(2)}/L diesel</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-purple-600 block tracking-wider">FASTag Highway Tolls</span>
            <div className="text-2xl font-black text-purple-700">
              ₹{totalFleetTollCostINR.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] font-semibold text-purple-600/80">Automated toll plazas</span>
          </div>
        </div>

        {/* Action Header & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search trip code, lorry, driver, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="PLANNED">PLANNED</option>
              <option value="APPROVED">APPROVED</option>
            </select>

            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 hidden sm:block"
            >
              <option value="ALL">All Drivers</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync Trips
            </button>
            <Link
              href="/dispatcher/optimize"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-card transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Run Optimizer
            </Link>
          </div>
        </div>

        {/* Trips Table / Cards */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Trip Code</th>
                  <th className="py-3.5 px-4">Lorry & Pilot</th>
                  <th className="py-3.5 px-4">Corridor & Waypoints</th>
                  <th className="py-3.5 px-4">Distance & Fuel Burn</th>
                  <th className="py-3.5 px-4">Diesel Fuel Cost</th>
                  <th className="py-3.5 px-4">Total Trip Expense</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                      No trips match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip) => {
                    const lorry = lorries.find(
                      (l) => l.id === trip.lorry_id || l.lorry_code === trip.lorry_code
                    );
                    const fuelEfficiency = lorry?.fuel_efficiency_km_per_l || 7.5;
                    const calculatedFuelLiters = Math.round((trip.distance_km / fuelEfficiency) * 10) / 10;
                    const calculatedFuelCostINR = Math.round(calculatedFuelLiters * DIESEL_PRICE_PER_LITER);
                    const calculatedTollCostINR = Math.round(trip.distance_km * TOLL_RATE_PER_KM);
                    const calculatedDriverCostINR = Math.round(trip.distance_km * DRIVER_RATE_PER_KM + 350);
                    const calculatedTotalTripCostINR = calculatedFuelCostINR + calculatedTollCostINR + calculatedDriverCostINR;

                    return (
                      <tr key={trip.id} className="hover:bg-slate-50/60 transition group">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                              <Navigation className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-black text-slate-900 block leading-tight">{trip.trip_code}</span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(trip.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} • ETA{' '}
                                {new Date(trip.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <VehicleAvatar
                              src={lorry?.image_url}
                              lorryCode={trip.lorry_code}
                              model={lorry?.model}
                              isRefrigerated={lorry?.is_refrigerated}
                              size="sm"
                            />
                            <div className="space-y-0.5 min-w-0">
                              <span className="font-bold text-slate-900 block text-xs truncate">
                                {trip.lorry_code}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 truncate">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                {trip.driver_name || 'Pilot Assigned'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900 flex items-center gap-1">
                              {trip.origin_city} <ArrowRight className="w-3 h-3 text-slate-400" /> {trip.destination_city}
                            </span>
                            <span className="text-[11px] text-slate-500 font-semibold">
                              {trip.stops_count || 2} Corridor Stops • {trip.shipment_ids?.length || 1} Consignments
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900">{trip.distance_km} km</span>
                            <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
                              <Fuel className="w-3 h-3 text-blue-500" />
                              {calculatedFuelLiters} L ({fuelEfficiency} km/L)
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-emerald-700 text-sm">
                              ₹{calculatedFuelCostINR.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              @ ₹{DIESEL_PRICE_PER_LITER}/L
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900 text-sm">
                              ₹{calculatedTotalTripCostINR.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium block">
                              Tolls: ₹{calculatedTollCostINR.toLocaleString('en-IN')} • Pilot: ₹{calculatedDriverCostINR.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {getStatusBadge(trip.status)}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {trip.status === 'IN_PROGRESS' ? (
                              <Link
                                href="/dispatcher/live"
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg transition"
                              >
                                Live GPS
                              </Link>
                            ) : (
                              <Link
                                href="/dispatcher/history"
                                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-lg transition"
                              >
                                POD Audit
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
