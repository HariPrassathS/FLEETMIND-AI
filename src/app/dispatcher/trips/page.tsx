'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
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
} from 'lucide-react';

export default function DispatcherTripsPage() {
  const [trips, setTrips] = useState<Trip[]>(fleetMindStore.getTrips());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string>('ALL');

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setTrips(fleetMindStore.getTrips());
    });
    return unsub;
  }, []);

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
        subtitle="Manage live transit trips, multi-stop corridor dispatches, execution history, and cost logs"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Trips</span>
            <div className="text-2xl font-black text-slate-900">{trips.length}</div>
            <span className="text-[11px] font-semibold text-slate-500">Commercial consignments</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-600 block tracking-wider">Active In Progress</span>
            <div className="text-2xl font-black text-blue-700">
              {trips.filter((t) => t.status === 'IN_PROGRESS').length}
            </div>
            <span className="text-[11px] font-semibold text-blue-600/80">Broadcasting live GPS</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-600 block tracking-wider">Completed Trips</span>
            <div className="text-2xl font-black text-emerald-700">
              {trips.filter((t) => t.status === 'COMPLETED').length}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600/80">100% Verified delivery OTP</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-purple-600 block tracking-wider">Total Fleet Distance</span>
            <div className="text-2xl font-black text-slate-900">
              {Math.round(trips.reduce((sum, t) => sum + t.distance_km, 0)).toLocaleString()} km
            </div>
            <span className="text-[11px] font-semibold text-slate-500">All corridors combined</span>
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
            <Link
              href="/dispatcher/optimize"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-card transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate Trip via Optimizer
            </Link>
          </div>
        </div>

        {/* Trips Table / Cards */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Trip Details</th>
                  <th className="py-3.5 px-4">Lorry & Driver</th>
                  <th className="py-3.5 px-4">Corridor & Stops</th>
                  <th className="py-3.5 px-4">Distance & Fuel</th>
                  <th className="py-3.5 px-4">Est. Cost</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                      No trips match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip) => (
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
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            {trip.lorry_code}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {trip.driver_name}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-900 flex items-center gap-1">
                            {trip.origin_city} <ArrowRight className="w-3 h-3 text-slate-400" /> {trip.destination_city}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {trip.stops_count} Corridor Stops • {trip.shipment_ids.length} Consignments
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-900">{trip.distance_km} km</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Fuel className="w-3 h-3 text-amber-500" />
                            {trip.fuel_liters} L
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-black text-slate-900 text-sm">
                          ₹{trip.estimated_cost_inr.toLocaleString()}
                        </span>
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
                              Track Live GPS
                            </Link>
                          ) : (
                            <Link
                              href={`/dispatcher/history`}
                              className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-lg transition"
                            >
                              View Audit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
