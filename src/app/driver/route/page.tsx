import React from 'react';
import dynamic from 'next/dynamic';
import { fleetMindStore } from '../../../lib/db/store';
import { Navigation, MapPin, Phone, Clock, ShieldCheck, ArrowRight, Radio } from 'lucide-react';
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
  const routes = fleetMindStore.getRoutes();
  const activeRoute = routes[0] || {
    route_code: 'RT-CHN-HOS-01',
    total_distance_km: 310.5,
    stops: [
      { id: '1', stop_type: 'PICKUP', address: 'Chennai Port Container Freight Station', arrival_eta: '09:00', status: 'COMPLETED', phone: '+91 98401 22334' },
      { id: '2', stop_type: 'PICKUP', address: 'Ambattur Industrial Estate Hub', arrival_eta: '10:15', status: 'COMPLETED', phone: '+91 98402 33445' },
      { id: '3', stop_type: 'DELIVERY', address: 'Hosur SIPCOT Industrial Complex, Phase 1', arrival_eta: '15:30', status: 'PENDING', phone: '+91 98801 44556' },
      { id: '4', stop_type: 'DELIVERY', address: 'Hosur Automotive Ancillary Yard', arrival_eta: '16:45', status: 'PENDING', phone: '+91 98802 55667' },
    ],
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-heading">Driver Live Route & Telemetry</h2>
          <p className="text-xs text-slate-500 font-semibold">{activeRoute.route_code} • {activeRoute.total_distance_km} km</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
          4 STOPS • GPS BROADCAST ACTIVE
        </span>
      </div>

      {/* Real Mobile Driver GPS Tracker */}
      <DriverGpsTracker
        driverId="driver-01"
        driverName="Murugan Selvam"
        lorryCode="L-11"
        shipmentId="RT-CHN-HOS-01"
      />

      {/* Mapbox Driver Live GPS Map */}
      <LiveTrackingMapbox
        origin={{
          lat: 13.0827,
          lng: 80.2707,
          city: 'Chennai Port CFS',
          address: 'Chennai Port Container Freight Station',
        }}
        destination={{
          lat: 12.7409,
          lng: 77.8253,
          city: 'Hosur SIPCOT',
          address: 'Hosur Automotive Ancillary Yard',
        }}
        status="IN_TRANSIT"
        driverName="Murugan Selvam (You)"
        vehicleCode="L-11 (Tata 1109 LPT)"
        etaText="15:30 (Stop 3)"
        shipmentId="RT-CHN-HOS-01"
        height="380px"
        showControls={true}
      />

      <div className="space-y-4">
        {activeRoute.stops.map((stop: any, idx: number) => (
          <div
            key={stop.id}
            className={`p-4 rounded-2xl border transition space-y-3 ${
              stop.status === 'COMPLETED'
                ? 'bg-emerald-50/40 border-emerald-200'
                : idx === 2
                ? 'bg-blue-50/60 border-blue-400 shadow-card'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                  stop.stop_type === 'PICKUP' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Stop {idx + 1}: {stop.stop_type}
              </span>
              <span className="text-xs font-bold text-slate-700">ETA {stop.arrival_eta}</span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">{stop.address}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Contact: {stop.phone || '+91 98400 00000'}</p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <a
                href={`tel:${stop.phone || '+91 98400 00000'}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" /> Call Site Contact
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" /> Navigate
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
