'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { ExpenseCategory, ExpenseRecord } from '../../../lib/optimization/types';
import {
  IndianRupee,
  Receipt,
  Plus,
  Truck,
  User,
  Calendar,
  X,
  Search,
  Filter,
  PieChart,
  Layers,
} from 'lucide-react';

export default function DispatcherExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(fleetMindStore.getExpenses());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [form, setForm] = useState({
    lorry_id: 'lorry-01',
    category: 'TOLL' as ExpenseCategory,
    amount_inr: 450,
    estimated_amount_inr: 450,
    description: 'NH-44 Toll plaza FASTag fee',
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setExpenses(fleetMindStore.getExpenses());
    });
    return unsub;
  }, []);

  const lorries = fleetMindStore.getLorries();
  const summary = fleetMindStore.getExpenseSummary();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    fleetMindStore.createExpense({
      lorry_id: form.lorry_id,
      category: form.category,
      amount_inr: Number(form.amount_inr),
      estimated_amount_inr: Number(form.estimated_amount_inr),
      description: form.description,
      date: new Date(form.date).toISOString(),
    });
    setIsAddModalOpen(false);
  };

  const filteredExpenses = expenses.filter((e) => {
    if (categoryFilter === 'ALL') return true;
    return e.category === categoryFilter;
  });

  const getCategoryBadge = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'FUEL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800">FUEL</span>;
      case 'TOLL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">TOLL</span>;
      case 'MAINTENANCE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800">MAINTENANCE</span>;
      case 'DRIVER_ALLOWANCE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">ALLOWANCE</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700">{cat}</span>;
    }
  };

  return (
    <>
      <PortalHeader
        title="Fleet Operating Expenses & Toll Hub"
        subtitle="Manage logistics operational expenses, FASTag highway tolls, maintenance invoices, and driver allowances"
        category="FleetMind AI · Expense Ledger"
        icon={<Receipt className="w-5 h-5" />}
        accent="blue"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Recorded Spend</span>
            <div className="text-2xl font-black text-slate-900">₹{summary.totalExpensesInr.toLocaleString()}</div>
            <span className="text-[11px] font-semibold text-slate-500">Across all fleet categories</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-600 block tracking-wider">Fuel Costs</span>
            <div className="text-2xl font-black text-blue-700">₹{(summary.byCategory['FUEL'] || 0).toLocaleString()}</div>
            <span className="text-[11px] font-semibold text-blue-600/80">Direct diesel expenditures</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-600 block tracking-wider">Highway Tolls (FASTag)</span>
            <div className="text-2xl font-black text-emerald-700">₹{(summary.byCategory['TOLL'] || 0).toLocaleString()}</div>
            <span className="text-[11px] font-semibold text-emerald-600/80">Corridor toll plazas</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-rose-600 block tracking-wider">Workshop Repairs</span>
            <div className="text-2xl font-black text-rose-700">₹{(summary.byCategory['MAINTENANCE'] || 0).toLocaleString()}</div>
            <span className="text-[11px] font-semibold text-rose-600/80">Preventive & emergency</span>
          </div>
        </div>

        {/* Action Header & Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Categories</option>
              <option value="FUEL">FUEL</option>
              <option value="TOLL">TOLL</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="DRIVER_ALLOWANCE">DRIVER ALLOWANCE</option>
              <option value="PARKING">PARKING</option>
              <option value="OTHER">OTHER</option>
            </select>

            <span className="text-xs text-slate-500 font-semibold">
              Showing {filteredExpenses.length} Expense Items
            </span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-card transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense Record
          </button>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Lorry / Trip</th>
                  <th className="py-3.5 px-4">Est. vs Actual Amount</th>
                  <th className="py-3.5 px-4 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((exp) => {
                    const est = exp.estimated_amount_inr || exp.amount_inr;
                    const diff = exp.amount_inr - est;
                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {new Date(exp.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>

                        <td className="py-4 px-4">
                          {getCategoryBadge(exp.category)}
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-800">
                          {exp.description}
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900 flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-blue-600" />
                              {exp.lorry_code || 'Fleet'}
                            </span>
                            {exp.trip_code && (
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {exp.trip_code}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900 text-sm">
                              ₹{exp.amount_inr.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Est: ₹{est.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right">
                          {diff === 0 ? (
                            <span className="text-[11px] font-bold text-slate-400">On Budget</span>
                          ) : diff > 0 ? (
                            <span className="text-[11px] font-bold text-rose-600">+₹{diff.toLocaleString()} Over</span>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-600">-₹{Math.abs(diff).toLocaleString()} Under</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 px-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">No Expense Records Found</p>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                            Tolls, driver allowances, warehouse loading tariffs, and parking receipts will appear here.
                          </p>
                        </div>
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                          + Add Expense Record
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Expense */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">Record Operational Expense</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Expense Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                    >
                      <option value="TOLL">TOLL (FASTAG)</option>
                      <option value="FUEL">FUEL</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="DRIVER_ALLOWANCE">DRIVER ALLOWANCE</option>
                      <option value="PARKING">PARKING</option>
                      <option value="LOADING_UNLOADING">LOADING / UNLOADING</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Vehicle</label>
                    <select
                      value={form.lorry_id}
                      onChange={(e) => setForm({ ...form, lorry_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                    >
                      {lorries.map((l) => (
                        <option key={l.id} value={l.id}>{l.lorry_code} ({l.registration_number})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Actual Amount (₹ INR)</label>
                    <input
                      type="number"
                      required
                      value={form.amount_inr}
                      onChange={(e) => setForm({ ...form, amount_inr: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Estimated Budget (₹ INR)</label>
                    <input
                      type="number"
                      value={form.estimated_amount_inr}
                      onChange={(e) => setForm({ ...form, estimated_amount_inr: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Expense Description</label>
                  <input
                    type="text"
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    placeholder="e.g. FASTag toll charges at Krishnagiri plaza"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-slate-600 font-bold rounded-xl hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
