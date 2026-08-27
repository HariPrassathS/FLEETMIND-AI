'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import { Shipment, ShipmentCategory, ShipmentPriority, ShipmentStatus, Lorry, Driver, ConsolidationOption } from '../../../lib/optimization/types';
import { SmartConsolidationCard } from '../../../components/dispatcher/smart-consolidation-card';
import { TruckCapacityVisual } from '../../../components/brand/truck-capacity-visual';
import { getLorryLiveCapacity } from '../../../lib/optimization/capacity';
import {
  Package,
  Plus,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  Truck,
  User,
  Fuel,
  Gauge,
  Check,
  ShieldCheck,
  Phone,
  Mail,
  Building,
  Layers,
  Award,
  AlertTriangle,
  Trash2,
  Zap,
  Navigation,
  Activity,
  BarChart3,
  Eye,
  Scale,
  Thermometer,
  Radio,
} from 'lucide-react';
import { parseShipmentWithAI, ParsedShipment } from '../../../lib/ai/groq';
import { VehicleAvatar } from '../../../components/brand/vehicle-avatar';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>(fleetMindStore.getShipments());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_REVIEW'>('ALL');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Selected vehicle for View Truck Quick Inspect Modal
  const [viewTruckDetails, setViewTruckDetails] = useState<Lorry | null>(null);

  // Autonomous Auto-Dispatch Toggle
  const [autoDispatchCritical, setAutoDispatchCritical] = useState<boolean>(
    fleetMindStore.getSystemSettings().auto_dispatch_critical !== false
  );

  // Selected shipment for 6-Section Full Review Modal
  const [reviewShipment, setReviewShipment] = useState<Shipment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Selected shipment for Vehicle & Driver Selection Modal
  const [assignShipment, setAssignShipment] = useState<Shipment | null>(null);
  const [selectedLorryId, setSelectedLorryId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  // AI Modal states
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Send 2.2 tonnes of cotton textiles from Karur to Chennai Sea Port CFS before tomorrow 5 PM.');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedShipment | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [lorries, setLorries] = useState<Lorry[]>(fleetMindStore.getLorries());
  const [drivers, setDrivers] = useState<Driver[]>(fleetMindStore.getDrivers());

  useEffect(() => {
    setShipments(fleetMindStore.getShipments());
    setLorries(fleetMindStore.getLorries());
    setDrivers(fleetMindStore.getDrivers());
    initSupabaseStoreSync(true);
    const unsub = fleetMindStore.subscribe(() => {
      setShipments(fleetMindStore.getShipments());
      setLorries(fleetMindStore.getLorries());
      setDrivers(fleetMindStore.getDrivers());
    });
    return unsub;
  }, []);

  const toggleAutoDispatch = () => {
    const nextVal = !autoDispatchCritical;
    setAutoDispatchCritical(nextVal);
    fleetMindStore.updateSystemSettings({ auto_dispatch_critical: nextVal });
    
    if (nextVal) {
      const unassignedCritical = shipments.filter((s) => s.priority === 'CRITICAL' && !s.assigned_lorry_id);
      unassignedCritical.forEach((s) => {
        fleetMindStore.tryAutoDispatchShipment(s.id);
      });
      setSuccessToast(`⚡ Autonomous Auto-Dispatch Active! Processed ${unassignedCritical.length} critical consignment(s).`);
    } else {
      setSuccessToast('Autonomous Auto-Dispatch turned OFF.');
    }
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const pendingReviewCount = shipments.filter(
    (s) => s.status === 'PENDING_REVIEW' || s.status === 'PENDING' || s.status === 'PENDING_DISPATCH'
  ).length;

  // Filter shipments
  const filteredShipments = shipments.filter((s) => {
    if (activeTab === 'PENDING_REVIEW') {
      if (s.status !== 'PENDING_REVIEW' && s.status !== 'PENDING' && s.status !== 'PENDING_DISPATCH') {
        return false;
      }
    }

    const matchesSearch =
      s.shipment_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pickup_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || s.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleAccept = (shipmentId: string) => {
    const updated = fleetMindStore.acceptShipment(shipmentId);
    if (updated) {
      setReviewShipment(null);
      // Immediately open vehicle assignment
      setAssignShipment(updated);
    }
  };

  const handleReject = (shipmentId: string) => {
    if (!rejectReason.trim()) return;
    fleetMindStore.rejectShipment(shipmentId, rejectReason);
    setReviewShipment(null);
    setIsRejecting(false);
    setRejectReason('');
  };

  const handleManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignShipment || !selectedLorryId) return;

    fleetMindStore.assignLorryAndDriver(
      assignShipment.id,
      selectedLorryId,
      selectedDriverId || undefined
    );

    setSuccessToast(`Consignment ${assignShipment.shipment_code} successfully assigned!`);
    setTimeout(() => setSuccessToast(null), 3000);
    setAssignShipment(null);
    setSelectedLorryId('');
    setSelectedDriverId('');
  };

  const handleConsolidationApply = (shipmentId: string, option: ConsolidationOption) => {
    const updated = fleetMindStore.applyConsolidationOption(shipmentId, option);
    if (updated) {
      const isCons = option.decision_type === 'ADD_TO_EXISTING_TRIP';
      setSuccessToast(
        isCons
          ? `Consignment ${updated.shipment_code} successfully consolidated into carrier ${option.lorry.lorry_code}'s active run!`
          : `Consignment ${updated.shipment_code} allocated to dedicated carrier ${option.lorry.lorry_code}!`
      );
      setTimeout(() => setSuccessToast(null), 3500);
      setAssignShipment(null);
    }
  };

  const handleAiParse = async () => {
    setIsAiParsing(true);
    setAiError(null);
    try {
      const parsed = await parseShipmentWithAI(aiPrompt);
      if (parsed) {
        setParsedData(parsed);
      } else {
        setAiError('Failed to parse text. Please check the format.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Error occurred while calling AI');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleAiConfirm = () => {
    if (!parsedData) return;

    fleetMindStore.createShipment({
      customer_name: parsedData.sender_company || parsedData.sender_name || 'Commercial Shipper',
      sender_name: parsedData.sender_name || 'Shipper Contact',
      sender_company: parsedData.sender_company,
      sender_phone: parsedData.sender_phone || '+91 98410 00000',
      description: parsedData.commodity,
      weight_kg: parsedData.weight_kg,
      volume_m3: parsedData.volume_m3 || Number((parsedData.weight_kg / 350).toFixed(1)),
      package_count: parsedData.package_count || 1,
      fragile: parsedData.fragile || false,
      pickup_city: parsedData.pickup_city,
      pickup_address: parsedData.pickup_address,
      destination_city: parsedData.destination_city,
      destination_address: parsedData.destination_address,
      delivery_deadline: parsedData.delivery_deadline,
      category: parsedData.category,
      priority: parsedData.priority,
      status: 'PENDING_REVIEW',
    });

    setIsAiModalOpen(false);
    setParsedData(null);
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'PENDING_DISPATCH':
      case 'PENDING_REVIEW':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-300 shadow-sm animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>PENDING DISPATCH</span>
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-900 border border-purple-300 shadow-sm">
            <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>ACCEPTED</span>
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>ASSIGNED</span>
          </span>
        );
      case 'IN_TRANSIT':
      case 'DISPATCHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-300 shadow-sm">
            <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0 animate-spin" />
            <span>IN TRANSIT</span>
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-900 border border-teal-300 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>DELIVERED (POD)</span>
          </span>
        );
      case 'REJECTED':
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-900 border border-rose-300 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 shadow-sm">
            <span>{status}</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: ShipmentPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-sm animate-pulse">
            <Zap className="w-3 h-3 fill-current text-amber-300" />
            <span>CRITICAL SLA</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm">
            <span>HIGH</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            <span>MEDIUM</span>
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
            <span>LOW</span>
          </span>
        );
    }
  };

  return (
    <>
      <PortalHeader
        title="Shipment Requests & Freight Intake Inbox"
        subtitle="Review customer booking requests, verify multi-stop freight feasibility, and assign optimal commercial carriers"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Toast */}
        {successToast && (
          <div className="fixed top-14 left-4 right-4 z-50 bg-slate-950 text-white border border-slate-700 p-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* KPI Cards & Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Consignments</span>
            <div className="text-2xl font-black text-slate-900">{shipments.length}</div>
            <span className="text-[11px] font-semibold text-slate-500">Across network</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-600 block tracking-wider">Pending Review</span>
            <div className="text-2xl font-black text-amber-700">{pendingReviewCount}</div>
            <span className="text-[11px] font-semibold text-amber-600/80">Awaiting approval</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-600 block tracking-wider">Assigned</span>
            <div className="text-2xl font-black text-blue-700">
              {shipments.filter((s) => s.status === 'ASSIGNED' || s.status === 'ACCEPTED').length}
            </div>
            <span className="text-[11px] font-semibold text-blue-600/80">Staged for pilot</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-indigo-600 block tracking-wider">In Transit</span>
            <div className="text-2xl font-black text-indigo-700">
              {shipments.filter((s) => s.status === 'IN_TRANSIT').length}
            </div>
            <span className="text-[11px] font-semibold text-indigo-600/80">Broadcasting GPS</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-600 block tracking-wider">Delivered</span>
            <div className="text-2xl font-black text-emerald-700">
              {shipments.filter((s) => s.status === 'DELIVERED').length}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600/80">100% Verified POD</span>
          </div>
        </div>

        {/* Action Header & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition ${
                  activeTab === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Consignments ({shipments.length})
              </button>
              <button
                onClick={() => setActiveTab('PENDING_REVIEW')}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'PENDING_REVIEW' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Incoming Requests</span>
                {pendingReviewCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === 'PENDING_REVIEW' ? 'bg-amber-900/30 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {pendingReviewCount}
                  </span>
                )}
              </button>
            </div>

            {/* Autonomous Critical Auto-Dispatch Switch */}
            <button
              onClick={toggleAutoDispatch}
              className={`px-3.5 py-2 text-xs font-black rounded-xl border transition flex items-center gap-2 shadow-sm ${
                autoDispatchCritical
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-purple-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title="When enabled, any Critical priority consignment unassigned for 1 minute is automatically dispatched to the fastest carrier"
            >
              <Zap className={`w-3.5 h-3.5 ${autoDispatchCritical ? 'text-amber-300 fill-current animate-bounce' : 'text-slate-400'}`} />
              <span>⚡ Auto-Dispatch Critical: <strong className={autoDispatchCritical ? 'text-amber-300' : 'text-slate-800'}>{autoDispatchCritical ? 'ON (1-Min Fail-Safe)' : 'OFF'}</strong></span>
            </button>

            <Link
              href="/dispatcher/create-shipment"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Intake Booking
            </Link>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-800 text-xs font-bold rounded-xl border border-violet-200 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-violet-600" />
              AI Natural Language
            </button>
          </div>

          <div className="flex flex-1 max-w-md items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search code, client, city, commodity..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Consignment Code</th>
                  <th className="py-3.5 px-4">Client & Commodity</th>
                  <th className="py-3.5 px-4">Route Corridor</th>
                  <th className="py-3.5 px-4">Freight Mass</th>
                  <th className="py-3.5 px-4">Priority SLA</th>
                  <th className="py-3.5 px-4">Dispatch Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                      No consignments match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((s) => {
                    const createdAtMs = new Date(s.created_at || Date.now()).getTime();
                    const elapsedSec = Math.floor((Date.now() - createdAtMs) / 1000);
                    const remainingSec = Math.max(0, 60 - elapsedSec);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition group">
                        <td className="py-4 px-4 font-mono font-black text-blue-600 text-xs">
                          {s.shipment_code}
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">{s.customer_name || 'Enterprise Consignee'}</span>
                            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                              <Package className="w-3 h-3 text-slate-400" />
                              {s.description}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900 flex items-center gap-1">
                              {s.pickup_city} <ArrowRight className="w-3 h-3 text-slate-400" /> {s.destination_city}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[190px] block font-medium">
                              {s.destination_address}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900">{s.weight_kg.toLocaleString()} kg</span>
                            <span className="text-[11px] text-slate-500 font-semibold block">{s.volume_m3} m³</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {getPriorityBadge(s.priority)}
                            {s.priority === 'CRITICAL' && !s.assigned_lorry_id && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-mono text-[9px] font-black border border-purple-200 animate-pulse">
                                <Clock className="w-2.5 h-2.5 text-purple-700" />
                                Auto in {remainingSec}s
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-medium block">
                              By {new Date(s.delivery_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {getStatusBadge(s.status)}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                setReviewShipment(s);
                                setIsRejecting(false);
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition text-[11px]"
                            >
                              Review Details
                            </button>

                            {!s.assigned_lorry_id ? (
                              <button
                                onClick={() => setAssignShipment(s)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-sm transition text-[11px] flex items-center gap-1.5"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Assign Vehicle</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setAssignShipment(s)}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-black rounded-xl transition text-[11px] flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{s.assigned_lorry_code || 'Assigned'} (Re-assign)</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete consignment ${s.shipment_code}?`)) {
                                  fleetMindStore.deleteShipment(s.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                              title="Delete Consignment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6-SECTION FULL REVIEW MODAL ("SHOW EVERYTHING BEFORE ACCEPTING") */}
        {reviewShipment && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col my-auto overflow-hidden animate-in fade-in">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">
                        Consignment Intake Review: {reviewShipment.shipment_code}
                      </h3>
                      {getStatusBadge(reviewShipment.status)}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Submitted on {new Date(reviewShipment.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setReviewShipment(null)}
                  className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Content (6 Comprehensive Sections) */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
                {/* SECTION 1: Customer Information */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-black uppercase text-[11px] tracking-wider">
                    <Building className="w-4 h-4 text-blue-600" />
                    Section 1: Customer & Shipper Details
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Company / Client</span>
                      <strong className="text-slate-900 text-sm block">{reviewShipment.customer_name || 'Commercial Freight Corp'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Email</span>
                      <span className="text-slate-700 font-medium block">{reviewShipment.customer_email || 'client@logistics.in'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Sender Type</span>
                      <span className="text-slate-700 font-medium block">{reviewShipment.sender_type || 'BUSINESS'}</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2 & 3: Pickup & Delivery Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SECTION 2: Pickup */}
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 font-black uppercase text-[11px] tracking-wider">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Section 2: Pickup Location
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Address</span>
                        <strong className="text-slate-900 block">{reviewShipment.pickup_address}</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">City & Hub</span>
                          <span className="font-bold text-slate-800">{reviewShipment.pickup_city}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Coordinates</span>
                          <span className="font-mono text-slate-600">{reviewShipment.pickup_lat.toFixed(4)}, {reviewShipment.pickup_lng.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Delivery */}
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-black uppercase text-[11px] tracking-wider">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Section 3: Delivery Destination & Receiver
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Destination Address</span>
                        <strong className="text-slate-900 block">{reviewShipment.destination_address}</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Receiver Name</span>
                          <span className="font-bold text-slate-800">{reviewShipment.receiver_name || 'Authorized Consignee'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Receiver Phone</span>
                          <span className="font-mono text-slate-600">{reviewShipment.receiver_phone || '+91 98401 99887'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Cargo Specifications & Capacity Bar Chart */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-black uppercase text-[11px] tracking-wider">
                    <Layers className="w-4 h-4 text-purple-600" />
                    Section 4: Cargo Specifications & Capacity Load Analytics
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Weight</span>
                      <strong className="text-base font-black text-slate-900">{reviewShipment.weight_kg.toLocaleString()} kg</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Volume</span>
                      <strong className="text-base font-black text-slate-900">{reviewShipment.volume_m3} m³</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Category</span>
                      <strong className="text-sm font-bold text-slate-900">{reviewShipment.category}</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Packages</span>
                      <strong className="text-sm font-bold text-slate-900">{reviewShipment.package_count || 10} Units</strong>
                    </div>
                  </div>

                  {/* Visual Payload & Volume Capacity Bar Chart */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-slate-800 flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        Lorry Capacity & Loading Utilization Bar Chart
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">10,000 kg Standard Fleet Limit</span>
                    </div>

                    {/* Weight Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">Payload Weight: <strong className="text-slate-900">{reviewShipment.weight_kg.toLocaleString()} kg</strong></span>
                        <span className="text-blue-600 font-mono">{Math.min(100, Math.round((reviewShipment.weight_kg / 10000) * 100))}% of 10,000 kg Lorry Limit</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            reviewShipment.weight_kg > 10000
                              ? 'bg-rose-500'
                              : reviewShipment.weight_kg > 7500
                              ? 'bg-amber-500'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, (reviewShipment.weight_kg / 10000) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Volume Bar */}
                    <div className="space-y-1 pt-0.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">Cargo Volume: <strong className="text-slate-900">{reviewShipment.volume_m3} m³</strong></span>
                        <span className="text-purple-600 font-mono">{Math.min(100, Math.round((reviewShipment.volume_m3 / 32) * 100))}% of 32 m³ Cargo Bay</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, (reviewShipment.volume_m3 / 32) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {reviewShipment.fragile && (
                    <div className="bg-amber-50 text-amber-800 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Fragile Cargo: Requires gentle acceleration, padded lashing, and low transit vibration.
                    </div>
                  )}
                </div>

                {/* SECTION 5: Priority & SLA Deadline */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-black uppercase text-[11px] tracking-wider">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Section 5: Priority & SLA Deadline Constraints
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Priority Rating</span>
                      <span className={`inline-block px-2.5 py-0.5 rounded font-black text-xs uppercase ${
                        reviewShipment.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {reviewShipment.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Mandated Deadline</span>
                      <strong className="text-slate-900 text-sm block">
                        {new Date(reviewShipment.delivery_deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                        {new Date(reviewShipment.delivery_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">SLA Classification</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        FEASIBLE (Standard Window)
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION 6: System Analysis & Candidate Vehicle Overview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200 space-y-3">
                  <div className="flex items-center gap-2 text-blue-950 font-black uppercase text-[11px] tracking-wider">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Section 6: FleetMind AI Feasibility & Decision Engine Analysis
                  </div>
                  <p className="text-xs text-blue-900">
                    Calculated corridor distance: <strong>~340 km</strong>. Required vehicle capacity: <strong>{reviewShipment.weight_kg.toLocaleString()} kg</strong> payload / <strong>{reviewShipment.volume_m3} m³</strong> volume. Multiple eligible commercial lorries are available at Chennai and Salem depots.
                  </p>
                </div>

                {/* Reject Reason Form if rejecting */}
                {isRejecting && (
                  <div className="bg-rose-50 p-4 rounded-2xl border border-rose-300 space-y-2 animate-in fade-in">
                    <label className="block font-black text-rose-950 uppercase text-[11px]">
                      Reason for Rejection (Visible to Customer)
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Incompatible hazardous commodity for standard dry carrier, or destination address out of service corridor."
                      className="w-full p-2.5 text-xs rounded-xl border border-rose-300 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setReviewShipment(null)}
                  className="px-4 py-2 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {!isRejecting ? (
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition"
                    >
                      Reject Request
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReject(reviewShipment.id)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition"
                    >
                      Confirm Rejection
                    </button>
                  )}

                  {(reviewShipment.status === 'PENDING_REVIEW' || reviewShipment.status === 'PENDING') && (
                    <button
                      type="button"
                      onClick={() => handleAccept(reviewShipment.id)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Accept Shipment & Select Carrier
                    </button>
                  )}

                  {!reviewShipment.assigned_lorry_id && reviewShipment.status !== 'PENDING_REVIEW' && reviewShipment.status !== 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = reviewShipment;
                        setReviewShipment(null);
                        setAssignShipment(target);
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      Assign Vehicle & Driver Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMART SHIPMENT CONSOLIDATION & CARRIER ALLOCATION MODAL */}
        {assignShipment && (() => {
          const consolidationAnalysis = fleetMindStore.analyzeShipmentConsolidation(assignShipment.id);
          return (
            <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Smart Allocation & Trip Consolidation: {assignShipment.shipment_code}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        Cargo: {assignShipment.weight_kg.toLocaleString()} kg • {assignShipment.volume_m3} m³ ({assignShipment.pickup_city} ➔ {assignShipment.destination_city})
                      </span>
                    </div>
                  </div>

                  <button onClick={() => setAssignShipment(null)} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                  {consolidationAnalysis ? (
                    <SmartConsolidationCard
                      analysis={consolidationAnalysis}
                      onApplyOption={(option) => handleConsolidationApply(assignShipment.id, option)}
                      onCancel={() => setAssignShipment(null)}
                    />
                  ) : (
                    <div className="text-center py-10 text-slate-400">
                      Analyzing fleet capacity...
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* AI AUTO EXTRACT MODAL */}
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">AI Natural Language Consignment Intake</h3>
                </div>
                <button onClick={() => setIsAiModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Paste or describe shipment details in plain English:
                </label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Move 4 tonnes of agricultural machinery from Coimbatore to Chennai before tomorrow 6 PM."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAiParse}
                  disabled={isAiParsing}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
                >
                  {isAiParsing ? 'Parsing with Groq...' : '⚡ Extract Structured Consignment'}
                </button>
              </div>

              {parsedData && (
                <div className="bg-violet-50 p-4 rounded-2xl border border-violet-200 space-y-3 text-xs animate-in fade-in">
                  <span className="font-black text-violet-950 uppercase text-[10px] block">Structured Payload Preview</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div><strong>Cargo:</strong> {parsedData.commodity}</div>
                    <div><strong>Weight:</strong> {parsedData.weight_kg} kg</div>
                    <div><strong>Origin:</strong> {parsedData.pickup_city}</div>
                    <div><strong>Destination:</strong> {parsedData.destination_city}</div>
                    <div><strong>Priority:</strong> {parsedData.priority}</div>
                    <div><strong>Category:</strong> {parsedData.category}</div>
                  </div>

                  <button
                    onClick={handleAiConfirm}
                    className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl transition"
                  >
                    Submit Consignment to Intake Pool
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Truck Quick Inspect Modal */}
        {viewTruckDetails && (() => {
          const truckCap = getLorryLiveCapacity(viewTruckDetails);
          return (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in my-auto">
                <div className="p-6 bg-slate-900 text-white flex items-start justify-between relative overflow-hidden">
                  <div className="flex items-center gap-3 z-10">
                    <VehicleAvatar
                      src={viewTruckDetails.image_url}
                      lorryCode={viewTruckDetails.lorry_code}
                      model={viewTruckDetails.model}
                      isRefrigerated={viewTruckDetails.is_refrigerated}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-black border border-blue-400/30 uppercase">
                          {viewTruckDetails.lorry_code}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          viewTruckDetails.status === 'AVAILABLE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {viewTruckDetails.status}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white mt-1">{viewTruckDetails.model}</h3>
                      <span className="text-xs text-slate-400 font-mono">{viewTruckDetails.registration_number}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewTruckDetails(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-xs">
                  {/* Dynamic Realistic Truck Capacity Visual */}
                  <TruckCapacityVisual
                    lorry={viewTruckDetails}
                    capacity={truckCap}
                    mode="detailed"
                    showMetrics={true}
                  />

                  {/* Assigned Consignments Breakdown */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-purple-600" /> Assigned Consignments ({truckCap.assignedShipments.length})
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {truckCap.volumeOccupancyPct}% Volume Occupied
                      </span>
                    </div>

                    {truckCap.assignedShipments.length > 0 ? (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                        {truckCap.assignedShipments.map((s) => (
                          <div
                            key={s.id}
                            className="p-2 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px]"
                          >
                            <div>
                              <span className="font-black text-slate-900 font-mono">{s.shipment_code}</span>
                              <span className="text-slate-500 text-[10px] block truncate">
                                {s.pickup_city} ➔ {s.destination_city}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-slate-800">{s.weight_kg.toLocaleString()} kg</span>
                              <span className="text-purple-700 text-[10px] block font-bold">{s.volume_m3} m³</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 py-1 italic">
                        No active consignments currently assigned to this vehicle (0% Load).
                      </p>
                    )}
                  </div>

                  {/* Vehicle Technical & Mileage Specs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Fuel Mileage</span>
                      <strong className="text-sm font-black text-blue-600">{viewTruckDetails.fuel_efficiency_km_per_l} km / L</strong>
                      <span className="text-[10px] text-slate-500 block">Commercial Diesel</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Refrigeration</span>
                      <strong className="text-sm font-black text-slate-900">
                        {viewTruckDetails.is_refrigerated ? 'Reefer Cold-Chain' : 'Ambient Dry Cargo'}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">Temperature spec</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 space-y-1">
                    <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">Live Hardware GPS Terminal</span>
                    <p className="text-slate-900 font-bold text-xs">{viewTruckDetails.current_address || 'Designated Regional Hub Depot'}</p>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Lat: {viewTruckDetails.current_lat.toFixed(4)}, Lng: {viewTruckDetails.current_lng.toFixed(4)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewTruckDetails(null)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-card transition"
                  >
                    Close Truck Inspector
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </main>
    </>
  );
}
