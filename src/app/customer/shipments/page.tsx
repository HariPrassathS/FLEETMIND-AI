'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth/auth-context';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import { Shipment } from '../../../lib/optimization/types';
import {
  Package,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

export default function CustomerShipmentsPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    const loadShipments = () => {
      const email = user?.email || 'customer@fleetmind.ai';
      const custShipments = fleetMindStore.getShipmentsByCustomer(email);
      setShipments(custShipments);
    };

    loadShipments();
    initSupabaseStoreSync(true);
    const unsub = fleetMindStore.subscribe(() => {
      loadShipments();
    });
    return unsub;
  }, [user]);

  const filtered = shipments.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.shipment_code.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.destination_city.toLowerCase().includes(q) ||
      s.pickup_city.toLowerCase().includes(q) ||
      (s.receiver_name && s.receiver_name.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Consignments</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Directory of booked freight loads, dispatch statuses, and delivery verification proofs
          </p>
        </div>

        <Link
          href="/customer/create-shipment"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Consignment</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, city, receiver..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Delivery Statuses</option>
            <option value="PENDING_DISPATCH">PENDING DISPATCH</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_TRANSIT">IN TRANSIT</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="DELAYED">DELAYED</option>
          </select>
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="ELECTRONICS">ELECTRONICS</option>
            <option value="TEXTILE">TEXTILE</option>
            <option value="AUTOMOTIVE">AUTOMOTIVE</option>
            <option value="FOOD">FOOD / REEFER</option>
            <option value="INDUSTRIAL">INDUSTRIAL</option>
          </select>
        </div>
      </div>

      {/* Shipments List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No consignments found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first consignment or adjust filters to view active loads.
            </p>
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-card-hover transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{s.shipment_code}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(s.status)}`}>
                    {s.status.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                    {s.category}
                  </span>
                  {s.priority === 'CRITICAL' && (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black">
                      CRITICAL SLA
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-700">{s.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      <strong className="text-slate-800">{s.pickup_city}</strong> →{' '}
                      <strong className="text-blue-600">{s.destination_city}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.weight_kg.toLocaleString()} kg</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Deadline: {new Date(s.delivery_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(s.delivery_deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Link
                  href={`/customer/shipments/${s.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center gap-1.5"
                >
                  <span>Track Consignment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {s.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to cancel and delete consignment ${s.shipment_code}?`)) {
                        fleetMindStore.deleteShipment(s.id);
                      }
                    }}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                    title="Cancel & Delete Consignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
