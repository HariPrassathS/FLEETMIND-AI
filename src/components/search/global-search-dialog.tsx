'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Package,
  Truck,
  User,
  Route,
  Sparkles,
  AlertTriangle,
  Zap,
  Flame,
  X,
  Sliders,
} from 'lucide-react';
import { fleetMindStore } from '../../lib/db/store';
import { useAuth } from '../../lib/auth/auth-context';

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchDialog({
  isOpen,
  onClose,
}: GlobalSearchDialogProps) {
  const router = useRouter();
  const { role } = useAuth();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shipments = fleetMindStore.getShipments();
  const lorries = fleetMindStore.getLorries();
  const drivers = fleetMindStore.getDrivers();
  const routes = fleetMindStore.getRoutes();

  const q = query.toLowerCase().trim();

  const filteredShipments = q
    ? shipments
        .filter(
          (s) =>
            s.shipment_code.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.destination_city.toLowerCase().includes(q) ||
            s.pickup_city.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : shipments.slice(0, 3);

  const filteredLorries = q
    ? lorries
        .filter(
          (l) =>
            l.lorry_code.toLowerCase().includes(q) ||
            l.registration_number.toLowerCase().includes(q) ||
            l.model.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : lorries.slice(0, 3);

  const filteredDrivers = q
    ? drivers
        .filter((d) => d.name.toLowerCase().includes(q) || d.phone.includes(q))
        .slice(0, 3)
    : [];

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shipments, lorries, drivers, routes, or quick commands..."
            className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results / Commands */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions / Commands */}
          <div>
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quick Operations & Tools
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
              <button
                onClick={() => handleNavigate('/dispatcher/optimize')}
                className="flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition group text-xs font-semibold"
              >
                <Sparkles className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
                <span>AI Load & Route Optimizer</span>
              </button>

              <button
                onClick={() => handleNavigate('/dispatcher/live')}
                className="flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition group text-xs font-semibold"
              >
                <Truck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition" />
                <span>Live Fleet GPS Control Center</span>
              </button>

              <button
                onClick={() => handleNavigate('/customer/create-shipment')}
                className="flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-purple-50 text-slate-700 hover:text-purple-700 transition group text-xs font-semibold"
              >
                <Package className="w-4 h-4 text-purple-600 group-hover:scale-110 transition" />
                <span>Create New Consignment Intake</span>
              </button>

              <button
                onClick={() => handleNavigate('/dispatcher/fleet')}
                className="flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition group text-xs font-semibold"
              >
                <Sliders className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition" />
                <span>Commercial Fleet Registry</span>
              </button>

              <button
                onClick={() => handleNavigate('/dispatcher/copilot')}
                className="flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-violet-50 text-slate-700 hover:text-violet-700 transition group text-xs font-semibold"
              >
                <Sparkles className="w-4 h-4 text-violet-600 group-hover:scale-110 transition" />
                <span>Ask FleetMind AI</span>
              </button>

              <button
                onClick={() => handleNavigate('/dispatcher/simulator')}
                className="flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-slate-100 text-slate-700 transition text-xs font-semibold"
              >
                <Sliders className="w-4 h-4 text-slate-600" />
                <span>Open What-If Simulator</span>
              </button>
            </div>
          </div>

          {/* Shipments Results */}
          {filteredShipments.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Shipments</span>
                <span className="text-[10px] font-normal text-slate-400">{filteredShipments.length} shown</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredShipments.map((s) => (
                  <button
                    key={s.id}
                    onClick={() =>
                      handleNavigate(
                        role === 'CUSTOMER'
                          ? `/customer/shipments`
                          : role === 'DRIVER'
                          ? `/driver/route`
                          : role === 'MANAGER'
                          ? `/manager/delivery`
                          : `/dispatcher/shipments`
                      )
                    }
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{s.shipment_code}</span>
                          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                            {s.description}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {s.pickup_city} → <span className="font-semibold text-slate-700">{s.destination_city}</span> • {s.weight_kg} kg
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        s.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : s.status === 'IN_TRANSIT'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {s.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lorries Results */}
          {filteredLorries.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Lorries & Vehicles</span>
                <span className="text-[10px] font-normal text-slate-400">{filteredLorries.length} shown</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredLorries.map((l) => (
                  <button
                    key={l.id}
                    onClick={() =>
                      handleNavigate(
                        role === 'ADMIN'
                          ? `/admin/fleet`
                          : role === 'MANAGER'
                          ? `/manager/fleet-analytics`
                          : `/dispatcher/fleet`
                      )
                    }
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{l.lorry_code}</span>
                          <span className="text-[11px] text-slate-600">{l.model}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {l.registration_number} • {l.fuel_efficiency_km_per_l} km/L • {l.max_weight_kg} kg cap
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        l.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : l.status === 'ON_ROUTE'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {l.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Drivers Results */}
          {filteredDrivers.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Drivers
              </div>
              <div className="space-y-1 mt-1">
                {filteredDrivers.map((d) => (
                  <button
                    key={d.id}
                    onClick={() =>
                      handleNavigate(
                        role === 'ADMIN'
                          ? `/admin/drivers`
                          : role === 'MANAGER'
                          ? `/manager/performance`
                          : `/dispatcher/drivers`
                      )
                    }
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">{d.name}</span>
                        <p className="text-[11px] text-slate-500">
                          {d.phone} • Shift: {d.shift_start} - {d.shift_end}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {d.availability_status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-semibold text-slate-700">↵</kbd> to select</span>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-semibold text-slate-700">esc</kbd> to close</span>
          </div>
          <span className="font-semibold text-blue-600">FleetMind Command Engine</span>
        </div>
      </div>
    </div>
  );
}
