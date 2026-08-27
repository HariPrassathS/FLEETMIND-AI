'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/auth-context';
import { fleetMindStore } from '../../../lib/db/store';
import { Trip, Driver, Lorry, Shipment } from '../../../lib/optimization/types';
import { DeliveryEvent } from '../../../types/database';
import {
  Clock,
  CheckCircle2,
  MapPin,
  Package,
  Truck,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Navigation,
  TrendingUp,
  Fuel,
  Award,
} from 'lucide-react';

export default function DriverHistoryPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<DeliveryEvent[]>(fleetMindStore.getDeliveryEvents());
  const [trips, setTrips] = useState<Trip[]>(fleetMindStore.getTrips());
  const [shipments, setShipments] = useState<Shipment[]>(fleetMindStore.getShipments());
  const [drivers, setDrivers] = useState<Driver[]>(fleetMindStore.getDrivers());
  const [activeTab, setActiveTab] = useState<'events' | 'trips' | 'deliveries'>('deliveries');

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setEvents(fleetMindStore.getDeliveryEvents());
      setTrips(fleetMindStore.getTrips());
      setShipments(fleetMindStore.getShipments());
      setDrivers(fleetMindStore.getDrivers());
    });
    return unsub;
  }, []);

  const currentDriver = drivers.find(
    (d) => d.email === user?.email || d.name === user?.full_name || d.id === user?.id
  ) || drivers[0];

  const myTrips = trips.filter(
    (t) => t.driver_id === currentDriver?.id || t.driver_name === currentDriver?.name
  );

  const completedTrips = myTrips.filter((t) => t.status === 'COMPLETED');
  const myDelivered = shipments.filter(
    (s) =>
      s.status === 'DELIVERED' &&
      (s.assigned_driver_id === currentDriver?.id || s.assigned_driver_name === currentDriver?.name)
  );

  const totalDistance = completedTrips.reduce((sum, t) => sum + (t.distance_km || 0), 0);
  const totalFuel = completedTrips.reduce((sum, t) => sum + (t.fuel_liters || 0), 0);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'PICKED_UP': return <Package className="w-4 h-4 text-blue-600" />;
      case 'ARRIVED_PICKUP': case 'ARRIVED_DESTINATION': return <MapPin className="w-4 h-4 text-amber-600" />;
      case 'DELAY_REPORTED': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-lg mx-auto">
      {/* Stats Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Delivery History</h2>
            <p className="text-xs text-slate-400">Performance log & completed runs</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Completed</span>
            <span className="text-xl font-black">{myDelivered.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Distance</span>
            <span className="text-xl font-black">{totalDistance > 0 ? `${totalDistance.toFixed(0)}` : '0'}<span className="text-xs ml-0.5">km</span></span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Score</span>
            <span className="text-xl font-black text-emerald-400">{currentDriver?.performance_score || 96}%</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
        {(['deliveries', 'trips', 'events'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition capitalize ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-card'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'deliveries' ? `Deliveries (${myDelivered.length})` : tab === 'trips' ? `Trips (${myTrips.length})` : `Events (${events.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content: Deliveries */}
      {activeTab === 'deliveries' && (
        <div className="space-y-3">
          {myDelivered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">No completed deliveries yet</p>
            </div>
          ) : (
            myDelivered.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">{s.shipment_code}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    ✓ DELIVERED
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">{s.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{s.pickup_city} → <strong className="text-emerald-600">{s.destination_city}</strong></span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>{s.weight_kg.toLocaleString()} kg • {s.volume_m3} m³</span>
                  {s.updated_at && <span>{new Date(s.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Trips */}
      {activeTab === 'trips' && (
        <div className="space-y-3">
          {myTrips.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">No trip records found</p>
            </div>
          ) : (
            myTrips.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">{t.trip_code}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {t.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span>{t.origin_city} → <strong className="text-slate-800">{t.destination_city}</strong></span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-[11px]">
                  <div><span className="text-slate-400 font-bold block text-[9px] uppercase">Distance</span><strong>{t.distance_km} km</strong></div>
                  <div><span className="text-slate-400 font-bold block text-[9px] uppercase">Fuel</span><strong>{t.fuel_liters} L</strong></div>
                  <div><span className="text-slate-400 font-bold block text-[9px] uppercase">Stops</span><strong>{t.stops_count}</strong></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Events */}
      {activeTab === 'events' && (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">No delivery events recorded yet</p>
            </div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    {getEventIcon(ev.event_type)}
                    {ev.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {new Date(ev.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {ev.notes && <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl">{ev.notes}</p>}
                {ev.recipient_name && (
                  <p className="text-[11px] text-slate-500">
                    Received by: <strong className="text-slate-800">{ev.recipient_name}</strong>
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
