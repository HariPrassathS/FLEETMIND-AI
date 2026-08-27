'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/auth-context';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import { Shipment } from '../../../lib/optimization/types';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  Sparkles,
  MapPin,
  Calendar,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCustomerData = () => {
      const email = user?.email || 'customer@fleetmind.ai';
      const custShipments = fleetMindStore.getShipmentsByCustomer(email);
      setShipments(custShipments);
    };

    loadCustomerData();
    initSupabaseStoreSync(true);
    const unsub = fleetMindStore.subscribe(() => {
      loadCustomerData();
    });
    return unsub;
  }, [user]);

  const totalCount = shipments.length;
  const activeShipments = shipments.filter((s) => s.status !== 'DELIVERED' && s.status !== 'CANCELLED');
  const inTransitCount = shipments.filter((s) => s.status === 'IN_TRANSIT' || s.status === 'EN_ROUTE_TO_PICKUP').length;
  const deliveredCount = shipments.filter((s) => s.status === 'DELIVERED').length;
  const delayedCount = shipments.filter((s) => s.status === 'DELAYED').length;

  const filteredActive = activeShipments.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.shipment_code.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.destination_city.toLowerCase().includes(q) ||
      s.pickup_city.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ASSIGNED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'DELAYED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PENDING':
      case 'PENDING_DISPATCH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'PENDING_DISPATCH':
        return 15;
      case 'ASSIGNED':
        return 35;
      case 'PICKED_UP':
        return 50;
      case 'IN_TRANSIT':
        return 75;
      case 'ARRIVED_DESTINATION':
      case 'DELIVERY_VERIFICATION':
        return 90;
      case 'DELIVERED':
        return 100;
      default:
        return 20;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shipper Live Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, {user?.full_name?.split(' ')[0] || 'Shipper'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl font-medium">
            Monitor real-time freight movement, book new LTL & FTL consignments, and inspect cryptographic delivery verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/customer/create-shipment"
            className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-card transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Shipment</span>
          </Link>
          <Link
            href="/customer/shipments"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
          >
            <span>All Shipments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Shipments</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">All time bookings</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase">Active</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-2">{activeShipments.length}</div>
          <p className="text-[11px] text-blue-600/80 mt-1 font-semibold">Under operations</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase">In Transit</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-700 mt-2">{inTransitCount}</div>
          <p className="text-[11px] text-indigo-600/80 mt-1 font-semibold">On highway corridor</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">{deliveredCount}</div>
          <p className="text-[11px] text-emerald-600/80 mt-1 font-semibold">With verified proof</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase">Delayed</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 mt-2">{delayedCount}</div>
          <p className="text-[11px] text-rose-600/80 mt-1 font-semibold">Auto-reoptimizing</p>
        </div>
      </div>

      {/* Main Section: ACTIVE SHIPMENTS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">Active Shipments</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Live consignments currently being grouped, routed, and delivered
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shipment code, city..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>
        </div>

        {filteredActive.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No active shipments matching criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Book a new load consignment using our FleetMind AI Assistant or manual form to see real-time tracking.
            </p>
            <Link
              href="/customer/create-shipment"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Consignment</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActive.map((s) => {
              const progress = getProgressPercentage(s.status);
              return (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-card-hover transition bg-white flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{s.shipment_code}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(s.status)}`}>
                          {s.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-1">{s.description}</p>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase">
                      {s.category}
                    </span>
                  </div>

                  <div className="bg-slate-50/80 p-3 rounded-2xl flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">From</span>
                        <span className="font-bold text-slate-900 truncate">{s.pickup_city}</span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />

                    <div className="flex items-center gap-2 min-w-0 text-right">
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">To</span>
                        <span className="font-bold text-blue-600 truncate">{s.destination_city}</span>
                      </div>
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    </div>
                  </div>

                  {/* Freight Cost & Weight Pill */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-[11px] font-bold text-slate-500">
                      Payload: <strong className="text-slate-800">{s.weight_kg.toLocaleString()} kg</strong>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono font-black text-xs border border-emerald-200">
                      ₹{(s.estimated_cost || 2850).toLocaleString()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span>Delivery Progress</span>
                      <span className="font-bold text-slate-900">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Stats & Track CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500 text-[11px]">
                      <span className="block font-semibold">Target Deadline:</span>
                      <span className="font-bold text-slate-800">
                        {new Date(s.delivery_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(s.delivery_deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <Link
                      href={`/customer/shipments/${s.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center gap-1.5"
                    >
                      <span>Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
