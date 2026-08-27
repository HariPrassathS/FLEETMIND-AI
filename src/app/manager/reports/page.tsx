'use client';

import React, { useState } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Calendar,
  FileText,
  FileCode,
  Package,
  Truck,
  Users,
  TrendingUp,
  DollarSign,
  Fuel,
} from 'lucide-react';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function convertToCSV(items: any[]): string {
  if (items.length === 0) return 'No data available\n';
  const headers = Object.keys(items[0]);
  const rows = items.map((obj) =>
    headers
      .map((header) => {
        let val = obj[header];
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
        val = String(val ?? '').replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export default function ManagerReportsPage() {
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const handleExportShipments = () => {
    const shipments = fleetMindStore.getShipments();
    const data =
      shipments.length > 0
        ? shipments.map((s) => ({
            Shipment_Code: s.shipment_code,
            Description: s.description,
            Weight_KG: s.weight_kg,
            Volume_M3: s.volume_m3,
            Pickup_City: s.pickup_city,
            Destination_City: s.destination_city,
            Status: s.status,
            Assigned_Lorry: s.assigned_lorry_code || 'Unassigned',
            Assigned_Driver: s.assigned_driver_name || 'Unassigned',
            Created_At: s.created_at,
          }))
        : [{ Message: 'No shipments currently recorded in database' }];

    const csv = convertToCSV(data);
    downloadFile(csv, `FleetMind_Shipments_Export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    setDownloaded('Shipments & Freight Consignments CSV');
    setTimeout(() => setDownloaded(null), 3000);
  };

  const handleExportFleet = () => {
    const lorries = fleetMindStore.getLorries();
    const data =
      lorries.length > 0
        ? lorries.map((l) => ({
            Lorry_Code: l.lorry_code,
            Registration: l.registration_number,
            Model: l.model,
            Max_Weight_KG: l.max_weight_kg,
            Max_Volume_M3: l.max_volume_m3,
            Fuel_Efficiency_KM_L: l.fuel_efficiency_km_per_l,
            Current_Location: l.current_address,
            Status: l.status,
            Assigned_Driver: l.assigned_driver_name || 'None',
          }))
        : [{ Message: 'No vehicles currently recorded in database' }];

    const csv = convertToCSV(data);
    downloadFile(csv, `FleetMind_Lorries_Export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    setDownloaded('Fleet Vehicles & Telemetry CSV');
    setTimeout(() => setDownloaded(null), 3000);
  };

  const handleExportDrivers = () => {
    const drivers = fleetMindStore.getDrivers();
    const data =
      drivers.length > 0
        ? drivers.map((d) => ({
            Driver_Name: d.name,
            Phone: d.phone,
            License_Number: d.license_number,
            Availability: d.availability_status,
            Shift_Start: d.shift_start,
            Shift_End: d.shift_end,
            Performance_Score: d.performance_score,
            Assigned_Lorry_ID: d.assigned_lorry_id || 'Standby Pool',
          }))
        : [{ Message: 'No drivers currently recorded in database' }];

    const csv = convertToCSV(data);
    downloadFile(csv, `FleetMind_Drivers_Export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    setDownloaded('Drivers & Duty Shifts CSV');
    setTimeout(() => setDownloaded(null), 3000);
  };

  const handleExportOptimization = () => {
    const runs = fleetMindStore.getOptimizationRuns();
    const data =
      runs.length > 0
        ? runs.map((r) => ({
            Run_ID: r.run_id,
            Timestamp: r.timestamp,
            Consignments_Count: r.assignments?.reduce((sum, a) => sum + (a.shipment_ids?.length || 0), 0) || 0,
            Vehicles_Used: r.after_metrics?.total_lorries_used || r.assignments?.length || 0,
            Total_Distance_KM: r.after_metrics?.total_distance_km || 0,
            Total_Fuel_Liters: r.after_metrics?.total_fuel_liters || 0,
            Total_Cost_INR: r.after_metrics?.total_cost_inr || 0,
            Cost_Saved_INR: r.savings?.cost_inr || 0,
            Execution_Time_MS: r.execution_time_ms,
          }))
        : [{ Message: 'No optimization runs recorded yet' }];

    const csv = convertToCSV(data);
    downloadFile(csv, `FleetMind_Optimization_ROI_Export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    setDownloaded('15-Step Heuristics ROI Ledger CSV');
    setTimeout(() => setDownloaded(null), 3000);
  };

  const handleExportFinancials = () => {
    const expenses = fleetMindStore.getExpenses();
    const fuelRecords = fleetMindStore.getFuelRecords();
    const settings = fleetMindStore.getSystemSettings();

    const data =
      expenses.length > 0
        ? expenses.map((e) => ({
            Expense_ID: e.id,
            Date: e.date,
            Category: e.category,
            Amount_INR: e.amount_inr,
            Lorry_Code: e.lorry_code || e.lorry_id || 'Fleet Carrier',
            Description: e.description,
          }))
        : [
            {
              Note: 'Active System Rate Parameters',
              Diesel_Price_Per_Liter: settings.fuel_price_per_liter,
              Driver_Base_Rate_Per_KM: settings.driver_base_rate_per_km,
              Operating_Cost_Per_KM: settings.operating_cost_per_km,
              Fixed_Dispatch_Cost_Per_Lorry: settings.fixed_dispatch_cost_per_lorry,
            },
          ];

    const csv = convertToCSV(data);
    downloadFile(csv, `FleetMind_Financial_Spend_Export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    setDownloaded('Financial Spend & System Rates CSV');
    setTimeout(() => setDownloaded(null), 3000);
  };

  const handleExportCompleteDump = () => {
    const dump = {
      exported_at: new Date().toISOString(),
      system_settings: fleetMindStore.getSystemSettings(),
      shipments: fleetMindStore.getShipments(),
      lorries: fleetMindStore.getLorries(),
      drivers: fleetMindStore.getDrivers(),
      routes: fleetMindStore.getRoutes(),
      optimization_runs: fleetMindStore.getOptimizationRuns(),
      expenses: fleetMindStore.getExpenses(),
      fuel_records: fleetMindStore.getFuelRecords(),
      alerts: fleetMindStore.getAlerts(),
      audit_logs: fleetMindStore.getAuditLogs(),
    };

    const json = JSON.stringify(dump, null, 2);
    downloadFile(json, `FleetMind_Complete_Audit_Dump_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    setDownloaded('Complete Database Audit Dump JSON');
    setTimeout(() => setDownloaded(null), 3000);
  };

  return (
    <>
      <PortalHeader
        title="Executive Reports & Export Center"
        subtitle="Download live CSV audits and JSON ledgers for transportation spend, fleet assets, driver hours & optimization ROI"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {downloaded && (
          <div className="bg-emerald-600 text-white p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-card">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>Successfully generated and downloaded: {downloaded}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Shipments */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between space-y-5 hover:shadow-card-hover transition">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5 shadow-sm">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Shipments & Consignments</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Full ledger of all freight consignments, tonnage, pickup/drop corridors, and active delivery statuses.
              </p>
            </div>
            <button
              onClick={handleExportShipments}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-blue-200/70"
            >
              <Download className="w-3.5 h-3.5" />
              Download Consignments CSV
            </button>
          </div>

          {/* Card 2: Fleet Vehicles */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between space-y-5 hover:shadow-card-hover transition">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5 shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Fleet Vehicles & Telemetry</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Carrier registry, registration numbers, payload limits, km/L mileage ratings, and live depot coordinates.
              </p>
            </div>
            <button
              onClick={handleExportFleet}
              className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-emerald-200/70"
            >
              <Download className="w-3.5 h-3.5" />
              Download Fleet Registry CSV
            </button>
          </div>

          {/* Card 3: Drivers */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between space-y-5 hover:shadow-card-hover transition">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3.5 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Drivers & Duty Shifts</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pilot licenses, contact numbers, shift schedules, availability statuses, and safety performance scores.
              </p>
            </div>
            <button
              onClick={handleExportDrivers}
              className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-purple-200/70"
            >
              <Download className="w-3.5 h-3.5" />
              Download Drivers CSV
            </button>
          </div>

          {/* Card 4: Optimization Heuristics */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between space-y-5 hover:shadow-card-hover transition">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3.5 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Optimization & ROI Proof Ledger</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Mathematical before vs after delta audit, distance reduced, diesel saved, and execution latencies in ms.
              </p>
            </div>
            <button
              onClick={handleExportOptimization}
              className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-amber-200/70"
            >
              <Download className="w-3.5 h-3.5" />
              Download ROI Ledger CSV
            </button>
          </div>

          {/* Card 5: Financial Spend */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between space-y-5 hover:shadow-card-hover transition">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3.5 shadow-sm">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Transportation Spend & Rates</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Itemized trip expense records, fuel price benchmarks per liter, driver statutory rates, and dispatch overhead.
              </p>
            </div>
            <button
              onClick={handleExportFinancials}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-rose-200/70"
            >
              <Download className="w-3.5 h-3.5" />
              Download Financial Spend CSV
            </button>
          </div>

          {/* Card 6: Complete Audit JSON Dump */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between space-y-5 hover:shadow-card-hover transition">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3.5 shadow-sm">
                <FileCode className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Complete JSON Audit Backup</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Full-fidelity cryptographic state export containing all tables, telemetry logs, and system settings.
              </p>
            </div>
            <button
              onClick={handleExportCompleteDump}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON Audit Dump
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
