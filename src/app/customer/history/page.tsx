'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth/auth-context';
import { fleetMindStore } from '../../../lib/db/store';
import { Shipment } from '../../../lib/optimization/types';
import {
  Clock,
  Package,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight,
  Download,
  Filter,
} from 'lucide-react';

export default function CustomerHistoryPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('DELIVERED');

  useEffect(() => {
    const loadData = () => {
      const email = user?.email || 'customer@fleetmind.ai';
      const custShipments = fleetMindStore.getShipmentsByCustomer(email);
      setShipments(custShipments.length > 0 ? custShipments : fleetMindStore.getShipments());
    };

    loadData();
    const unsub = fleetMindStore.subscribe(() => {
      loadData();
    });
    return unsub;
  }, [user]);

  const historyShipments = shipments.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.shipment_code.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.destination_city.toLowerCase().includes(q) ||
      s.pickup_city.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Consignment History & POD Archive</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Past completed deliveries, digital proof of deliveries, and verified receiver signatures
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search completed shipment code, city..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          />
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium text-slate-700"
          >
            <option value="DELIVERED">Delivered & Verified Only</option>
            <option value="ALL">All Past Shipments</option>
            <option value="DELAYED">Delayed Exception Archive</option>
          </select>
        </div>
      </div>

      {/* History Items */}
      <div className="space-y-3">
        {historyShipments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No history records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Completed and delivered consignments will automatically archive here with cryptographic proof.
            </p>
          </div>
        ) : (
          historyShipments.map((s) => (
            <div
              key={s.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-card-hover transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{s.shipment_code}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    DELIVERED ✓
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                    {s.category}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-700">{s.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.pickup_city} → {s.destination_city}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.weight_kg.toLocaleString()} kg</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Received by: <strong className="text-slate-800">{s.receiver_verified_name || s.receiver_name || 'Rahul Kumar'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Link
                  href={`/customer/shipments/${s.id}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <span>View Proof of Delivery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
