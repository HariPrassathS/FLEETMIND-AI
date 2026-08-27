'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../../../lib/auth/auth-context';
import { fleetMindStore } from '../../../lib/db/store';
import { Route, Driver, Lorry, Shipment } from '../../../lib/optimization/types';
import {
  Navigation,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  ArrowRight,
  Radio,
  Truck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { DriverGpsTracker } from '../../../components/driver/driver-gps-tracker';

const LiveTrackingMapbox = dynamic(
  () => import('../../../components/map/live-tracking-mapbox').then((m) => m.LiveTrackingMapbox),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] bg-slate-50 animate-pulse rounded-2xl border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-bold">
        Loading Driver GPS Navigation Map...
      </div>
    ),
  }
);

export default function DriverRoutePage() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>(fleetMindStore.getRoutes());
  const [drivers, setDrivers] = useState<Driver[]>(fleetMindStore.getDrivers());
  const [lorries, setLorries] = useState<Lorry[]>(fleetMindStore.getLorries());
  const [shipments, setShipments] = useState<Shipment[]>(fleetMindStore.getShipments());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setRoutes(fleetMindStore.getRoutes());
      setDrivers(fleetMindStore.getDrivers());
      setLorries(fleetMindStore.getLorries());
      setShipments(fleetMindStore.getShipments());
    });
    return unsub;
  }, []);

  const currentDriver = drivers.find(
    (d) => d.email === user?.email || d.name === user?.full_name || d.id === user?.id
  ) || drivers[0];

  const assignedLorry = lorries.find(
    (l) => l.assigned_driver_id === currentDriver?.id || l.id === currentDriver?.assigned_lorry_id
  ) || lorries[0];

  const activeRoute = routes.find((r) => r.driver_id === currentDriver?.id) || routes[0] || {
    id: 'rt-seed-01',
    route_code: 'RT-CHN-HOS-01',
    lorry_id: assignedLorry?.id || 'lorry-01',
    lorry_code: assignedLorry?.lorry_code || 'L-11',
    driver_id: currentDriver?.id || 'driver-01',
    driver_name: currentDriver?.name || 'Murugan Selvam',
    total_distance_km: 310.5,
    total_duration_minutes: 360,
    total_cost_inr: 7850,
    status: 'IN_TRANSIT',
    stops: [
      { id: '1', shipment_id: 'shipment-1042', stop_type: 'PICKUP', address: 'Chennai Port Container Freight Station', arrival_eta: '09:00', status: 'COMPLETED', phone: '+91 98401 22334', latitude: 13.0827, longitude: 80.2707 },
      { id: '2', shipment_id: 'shipment-1043', stop_type: 'PICKUP', address: 'Ambattur Industrial Estate Hub', arrival_eta: '10:15', status: 'COMPLETED', phone: '+91 98402 33445', latitude: 13.1143, longitude: 80.1548 },
      { id: '3', shipment_id: 'shipment-1042', stop_type: 'DELIVERY', address: 'Hosur SIPCOT Industrial Complex, Phase 1', arrival_eta: '15:30', status: 'PENDING', phone: '+91 98801 44556', latitude: 12.7409, longitude: 77.8253 },
      { id: '4', shipment_id: 'shipment-1043', stop_type: 'DELIVERY', address: 'Hosur Automotive Ancillary Yard', arrival_eta: '16:45', status: 'PENDING', phone: '+91 98802 55667', latitude: 12.7550, longitude: 77.8400 },
    ],
  };

  const stops = activeRoute.stops || [];
  const completedStops = stops.filter((s) => s.status === 'COMPLETED');
  const remainingStops = stops.filter((s) => s.status !== 'COMPLETED');
  const nextStop = remainingStops[0] || stops[stops.length - 1];

  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-lg mx-auto">
      {/* Route Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-5 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">Live Turn Corridor</span>
              <h2 className="text-base font-bold text-white leading-tight">{activeRoute.route_code}</h2>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
            ACTIVE ROUTE
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-center text-xs font-semibold">
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-blue-200 uppercase block font-bold">Distance</span>
            <span className="text-sm font-black">{activeRoute.total_distance_km} km</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-blue-200 uppercase block font-bold">Stops</span>
            <span className="text-sm font-black">{completedStops.length} / {stops.length}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <span className="text-[10px] text-blue-200 uppercase block font-bold">Vehicle</span>
            <span className="text-sm font-black">{assignedLorry?.lorry_code || 'L-11'}</span>
          </div>
        </div>
      </div>

      {/* Driver GPS Broadcaster */}
      <DriverGpsTracker
        driverId={currentDriver?.id || 'driver-01'}
        driverName={currentDriver?.name || 'Murugan Selvam'}
        lorryCode={assignedLorry?.lorry_code || 'L-11'}
        shipmentId={activeRoute.route_code}
      />

      {/* Live Mapbox Route */}
      <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-card">
        <LiveTrackingMapbox
          origin={{
            lat: firstStop?.latitude || 13.0827,
            lng: firstStop?.longitude || 80.2707,
            city: firstStop?.address?.split(',')[0] || 'Chennai Hub',
            address: firstStop?.address || 'Chennai Central Freight Hub',
          }}
          destination={{
            lat: lastStop?.latitude || 12.7409,
            lng: lastStop?.longitude || 77.8253,
            city: lastStop?.address?.split(',')[0] || 'Hosur SIPCOT',
            address: lastStop?.address || 'Hosur Industrial Complex',
          }}
          status="IN_TRANSIT"
          driverName={`${currentDriver?.name || 'Murugan Selvam'} (You)`}
          vehicleCode={`${assignedLorry?.lorry_code || 'L-11'} (${assignedLorry?.registration_number || 'TN01FM0001'})`}
          etaText={nextStop?.arrival_eta ? `ETA: ${nextStop.arrival_eta}` : '15:30 IST'}
          shipmentId={activeRoute.route_code}
          height="320px"
          showControls={true}
        />
      </div>

      {/* Next Waypoint Target Action */}
      {nextStop && (
        <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase flex items-center gap-1">
              <Navigation className="w-3 h-3 text-blue-600" />
              CURRENT TARGET WAYPOINT
            </span>
            <span className="text-xs font-bold text-slate-700">ETA {nextStop.arrival_eta}</span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">{nextStop.address}</h4>
            <p className="text-xs text-slate-500 mt-0.5">Contact: {nextStop.phone || '+91 98400 11223'}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nextStop.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-card transition flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>NAVIGATE</span>
            </a>
            <a
              href={`tel:${nextStop.phone || '+91 98400 11223'}`}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>CALL SITE</span>
            </a>
          </div>
        </div>
      )}

      {/* Sequential Stops Timeline */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-600" /> Complete Stop Schedule ({stops.length} Waypoints)
        </h3>

        <div className="space-y-3">
          {stops.map((stop: any, idx: number) => {
            const isDone = stop.status === 'COMPLETED';
            const isCurrent = !isDone && stop.id === nextStop?.id;

            return (
              <div
                key={stop.id}
                className={`p-4 rounded-2xl border transition space-y-2.5 ${
                  isDone
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isCurrent
                    ? 'bg-blue-50/70 border-blue-300 shadow-subtle'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                        stop.stop_type === 'PICKUP'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {stop.stop_type}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {isDone ? 'COMPLETED' : `ETA ${stop.arrival_eta || '15:00'}`}
                  </span>
                </div>

                <div>
                  {(() => {
                    const matchShp = shipments.find((s) => s.id === stop.shipment_id || s.shipment_code === stop.shipment_id);
                    const company = stop.stop_type === 'PICKUP'
                      ? (matchShp?.sender_company || matchShp?.customer_name || 'Shipper Facility')
                      : (matchShp?.receiver_company || 'Consignee Receiving Bay');
                    const contact = stop.stop_type === 'PICKUP'
                      ? (matchShp?.sender_name || 'Warehouse Incharge')
                      : (matchShp?.receiver_name || 'Site Incharge');
                    const phone = stop.phone || (stop.stop_type === 'PICKUP' ? matchShp?.sender_phone : matchShp?.receiver_phone);

                    return (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <span className="text-blue-600 font-black">{company}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 font-medium">{contact}</span>
                        </div>
                        <h4 className="text-xs font-medium text-slate-700">{stop.address}</h4>
                        {phone && (
                          <p className="text-[11px] text-slate-500 font-semibold">Contact: {phone}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {!isDone && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <a
                      href={`tel:${stop.phone || '+91 98400 11223'}`}
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call Contact
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-700 font-bold hover:text-blue-600 flex items-center gap-1"
                    >
                      <span>Get Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
