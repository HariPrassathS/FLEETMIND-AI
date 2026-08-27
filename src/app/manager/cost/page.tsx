'use client';

import React from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { DollarSign, TrendingDown, Fuel, UserCheck, Shield } from 'lucide-react';
import { formatCurrencyINR } from '../../../lib/utils/cn';

export default function ManagerCostPage() {
  const routes = fleetMindStore.getRoutes();
  const settings = fleetMindStore.getSystemSettings();

  const totalFuelCost = routes.reduce((s, r) => s + (r.fuel_consumption_liters * settings.fuel_price_per_liter), 0);
  const totalDriverCost = routes.reduce((s, r) => s + (r.total_distance_km * settings.driver_base_rate_per_km), 0);
  const totalFixedCost = routes.length * settings.fixed_dispatch_cost_per_lorry;
  const totalCost = totalFuelCost + totalDriverCost + totalFixedCost;

  return (
    <>
      <PortalHeader
        title="Transportation Cost Intelligence"
        subtitle="Dynamic breakdown of fuel expenses, driver allowances, fixed dispatch overhead & cost-per-km trends"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Trip Expense</span>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{totalCost.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 mt-0.5">Calculated across active routes</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Direct Diesel Burn</span>
            <div className="text-2xl font-black text-blue-700 mt-1">₹{totalFuelCost.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 mt-0.5">{(totalCost > 0 ? (totalFuelCost / totalCost) * 100 : 62).toFixed(1)}% of total operational cost</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Driver Base Allowance</span>
            <div className="text-2xl font-black text-slate-800 mt-1">₹{totalDriverCost.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 mt-0.5">₹{settings.driver_base_rate_per_km}/km statutory rate</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Fixed Dispatch Overhead</span>
            <div className="text-2xl font-black text-slate-800 mt-1">₹{totalFixedCost.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 mt-0.5">₹{settings.fixed_dispatch_cost_per_lorry} / vehicle dispatch</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Cost Equations & Unit Economics
          </h3>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-mono">
            <div className="font-bold text-slate-900">Total Route Cost Equation:</div>
            <div className="text-blue-700">Cost = (Distance / FuelEfficiency) × ₹{settings.fuel_price_per_liter} + (Distance × ₹{settings.driver_base_rate_per_km}) + ₹{settings.fixed_dispatch_cost_per_lorry}</div>
            <p className="text-slate-500 font-sans text-[11px] pt-1">
              Dynamic fuel prices and driver rates are pulled in real-time from authoritative System Settings.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
