'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/auth-context';
import { fleetMindStore } from '../../../lib/db/store';
import { Shipment, Driver, Lorry, Trip } from '../../../lib/optimization/types';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  ArrowRight,
  Fuel,
  Gauge,
  TrendingUp,
  Activity,
  Box,
  Calendar,
  Building2,
  Phone,
  User,
} from 'lucide-react';

export default function DriverShipmentsPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>(fleetMindStore.getShipments());
  const [drivers, setDrivers] = useState<Driver[]>(fleetMindStore.getDrivers());
  const [lorries, setLorries] = useState<Lorry[]>(fleetMindStore.getLorries());
  const [trips, setTrips] = useState<Trip[]>(fleetMindStore.getTrips());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setShipments(fleetMindStore.getShipments());
      setDrivers(fleetMindStore.getDrivers());
      setLorries(fleetMindStore.getLorries());
      setTrips(fleetMindStore.getTrips());
    });
    return unsub;
  }, []);

  // Find the current driver's data
  const currentDriver = drivers.find(
    (d) => d.email === user?.email || (user?.email && d.email?.toLowerCase() === user.email.toLowerCase()) || (user?.full_name && d.name?.toLowerCase() === user.full_name.toLowerCase()) || d.id === user?.id
  ) || (drivers.length > 0 ? drivers[0] : null);

  // Get lorry assigned to this driver
  const assignedLorry = currentDriver
    ? (lorries.find((l) => l.driver_id === currentDriver.id || l.assigned_driver_id === currentDriver.id || l.id === currentDriver.assigned_lorry_id) || lorries[0] || null)
    : (lorries.find((l) => l.assigned_driver_name === user?.full_name) || lorries[0] || null);

  // Get shipments assigned to this driver's lorry or driver
  const myShipments = shipments.filter(
    (s) =>
      (currentDriver && (s.assigned_driver_id === currentDriver.id || s.assigned_driver_name === currentDriver.name)) ||
      (user?.full_name && s.assigned_driver_name?.toLowerCase() === user.full_name.toLowerCase()) ||
      (assignedLorry && (s.assigned_lorry_id === assignedLorry.id || s.assigned_lorry_code === assignedLorry.lorry_code))
  );

  const effectiveShipments = myShipments.length > 0 ? myShipments : shipments;

  const inTransit = effectiveShipments.filter((s) => s.status === 'IN_TRANSIT' || s.status === 'DISPATCHED' || s.status === 'ASSIGNED' || s.status === 'PICKED_UP' || s.status === 'ACCEPTED');
  const pending = effectiveShipments.filter((s) => s.status === 'PENDING' || s.status === 'PENDING_REVIEW');
  const delivered = effectiveShipments.filter((s) => s.status === 'DELIVERED');

  const totalWeight = effectiveShipments.reduce((sum, s) => sum + (s.weight_kg || 0), 0);
  const totalVolume = effectiveShipments.reduce((sum, s) => sum + (s.volume_m3 || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT': case 'DISPATCHED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ACCEPTED': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PENDING': case 'PENDING_REVIEW': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-lg mx-auto">
      {/* Cargo Summary Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Cargo Manifest</h2>
            <p className="text-xs text-blue-200">
              {assignedLorry ? `Vehicle ${assignedLorry.lorry_code} (${assignedLorry.registration_number})` : 'No vehicle assigned'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
            <span className="text-[10px] text-blue-200 font-bold uppercase block">Active</span>
            <span className="text-xl font-black">{inTransit.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
            <span className="text-[10px] text-blue-200 font-bold uppercase block">Payload</span>
            <span className="text-xl font-black">{totalWeight > 1000 ? `${(totalWeight / 1000).toFixed(1)}T` : `${totalWeight}kg`}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
            <span className="text-[10px] text-blue-200 font-bold uppercase block">Delivered</span>
            <span className="text-xl font-black">{delivered.length}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Capacity Gauge */}
      {assignedLorry && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-800">{assignedLorry.lorry_code} ({assignedLorry.registration_number})</span>
            </div>
            <div className="text-xs font-medium bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-slate-600">Weight: {(totalWeight || 0).toLocaleString()} / {(assignedLorry.max_weight_kg || 0).toLocaleString()} kg</span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-slate-600">Weight: {totalWeight.toLocaleString()} / {assignedLorry.max_weight_kg.toLocaleString()} kg</span>
                <span className="text-blue-600">{Math.round((totalWeight / assignedLorry.max_weight_kg) * 100)}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalWeight / assignedLorry.max_weight_kg) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-slate-600">Volume: {totalVolume.toFixed(1)} / {assignedLorry.max_volume_m3} m³</span>
                <span className="text-indigo-600">{Math.round((totalVolume / assignedLorry.max_volume_m3) * 100)}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalVolume / assignedLorry.max_volume_m3) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Cargo Section */}
      {inTransit.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-600" /> Active Cargo ({inTransit.length})
          </h3>
          {inTransit.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-blue-200 shadow-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">{s.shipment_code}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(s.status)}`}>
                  {s.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700">{s.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span><strong className="text-slate-800">{s.pickup_city}</strong> → <strong className="text-blue-600">{s.destination_city}</strong></span>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Weight</span>
                  <span className="font-black text-slate-900">{s.weight_kg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Volume</span>
                  <span className="font-black text-slate-900">{s.volume_m3} m³</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Priority</span>
                  <span className={`font-black ${s.priority === 'CRITICAL' ? 'text-rose-600' : s.priority === 'HIGH' ? 'text-amber-600' : 'text-slate-700'}`}>
                    {s.priority || 'MEDIUM'}
                  </span>
                </div>
              </div>

              {/* Customer & Consignee Information for Driver */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Shipper / Customer</span>
                    <span className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-bold">PICKUP</span>
                  </div>
                  <strong className="text-slate-900 text-xs block truncate">{s.sender_company || s.customer_name || 'Commercial Shipper'}</strong>
                  <p className="text-slate-500 text-[11px] truncate">{s.sender_name || 'Dispatcher'}</p>
                  {s.sender_phone && (
                    <a href={`tel:${s.sender_phone}`} className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800">
                      <Phone className="w-3 h-3" /> Call: {s.sender_phone}
                    </a>
                  )}
                </div>

                <div className="bg-blue-50/60 p-2.5 rounded-xl space-y-1 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-blue-600 font-bold uppercase">Consignee / Receiver</span>
                    <span className="text-[9px] bg-blue-600 text-white px-1 py-0.5 rounded font-bold">DELIVERY</span>
                  </div>
                  <strong className="text-slate-900 text-xs block truncate">{s.receiver_company || 'Authorized Receiving Dock'}</strong>
                  <p className="text-slate-600 text-[11px] truncate">{s.receiver_name}</p>
                  {s.receiver_phone && (
                    <a href={`tel:${s.receiver_phone}`} className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900">
                      <Phone className="w-3 h-3" /> Call: {s.receiver_phone}
                    </a>
                  )}
                </div>
              </div>

              {s.delivery_deadline && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Deadline: <strong className="text-slate-800">
                    {new Date(s.delivery_deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </strong></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pending Pickups */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Pickup ({pending.length})
          </h3>
          {pending.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-amber-200 shadow-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">{s.shipment_code}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                  AWAITING PICKUP
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700">{s.description}</p>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-500">Vol: {s.volume_m3} m³</span>
                <span className="font-black text-slate-900">{(s.weight_kg || 0).toLocaleString()} kg</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delivered */}
      {delivered.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered ({delivered.length})
          </h3>
          {delivered.map((s) => (
            <div key={s.id} className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">{s.shipment_code}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                  ✓ DELIVERED
                </span>
              </div>
              <p className="text-xs text-slate-600">{s.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{s.pickup_city} → {s.destination_city}</span>
                <span className="font-bold">{(s.weight_kg || 0).toLocaleString()} kg</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {myShipments.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Cargo Assigned</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You currently have no consignments assigned. Check with your dispatcher for new assignments.
          </p>
        </div>
      )}
    </div>
  );
}
