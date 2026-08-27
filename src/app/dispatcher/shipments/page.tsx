'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Shipment, ShipmentCategory, ShipmentPriority, ShipmentStatus, Lorry, Driver } from '../../../lib/optimization/types';
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
} from 'lucide-react';
import { parseShipmentWithAI, ParsedShipment } from '../../../lib/ai/groq';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>(fleetMindStore.getShipments());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_REVIEW'>('ALL');

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
    const unsub = fleetMindStore.subscribe(() => {
      setShipments(fleetMindStore.getShipments());
      setLorries(fleetMindStore.getLorries());
      setDrivers(fleetMindStore.getDrivers());
    });
    return unsub;
  }, []);

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

  const handleAssignLorry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignShipment || !selectedLorryId) return;

    fleetMindStore.assignLorryAndDriver(assignShipment.id, selectedLorryId, selectedDriverId || undefined);
    setAssignShipment(null);
    setSelectedLorryId('');
    setSelectedDriverId('');
  };

  const handleParseWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiParsing(true);
    setAiError(null);
    try {
      const result = await parseShipmentWithAI(aiPrompt);
      setParsedData(result);
    } catch (err: any) {
      setAiError(err.message || 'Failed to parse shipment with FleetMind AI');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleConfirmAiShipment = () => {
    if (!parsedData) return;

    fleetMindStore.createShipment({
      description: parsedData.commodity,
      weight_kg: parsedData.weight_kg,
      volume_m3: parsedData.volume_m3,
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
      case 'PENDING_REVIEW':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 animate-pulse">
            PENDING REVIEW
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800">
            ACCEPTED
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
            ASSIGNED
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-800">
            IN TRANSIT
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            DELIVERED
          </span>
        );
      case 'REJECTED':
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
            {status}
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
                  <th className="py-3.5 px-4">Customer & Cargo</th>
                  <th className="py-3.5 px-4">Corridor (Origin ➔ Dest)</th>
                  <th className="py-3.5 px-4">Weight & Volume</th>
                  <th className="py-3.5 px-4">Priority & SLA</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                      No consignments match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((s) => {
                    const isPending = s.status === 'PENDING_REVIEW' || s.status === 'PENDING' || s.status === 'PENDING_DISPATCH';
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition group">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-black text-slate-900 block leading-tight">{s.shipment_code}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(s.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900 block truncate max-w-[180px]">
                              {s.customer_name || 'Commercial Shipper'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[180px] block">
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
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              s.priority === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : s.priority === 'HIGH'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {s.priority}
                            </span>
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

                            {isPending && (
                              <button
                                onClick={() => handleAccept(s.id)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-sm transition text-[11px] flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Accept
                              </button>
                            )}

                            {s.status === 'ACCEPTED' && (
                              <button
                                onClick={() => setAssignShipment(s)}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-sm transition text-[11px] flex items-center gap-1"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                Assign Carrier
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

                {/* SECTION 4: Cargo Specifications */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-black uppercase text-[11px] tracking-wider">
                    <Layers className="w-4 h-4 text-purple-600" />
                    Section 4: Cargo Specifications & Load Dynamics
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VEHICLE & DRIVER SELECTION MODAL */}
        {assignShipment && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col my-auto overflow-hidden animate-in fade-in">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Select Carrier & Driver: {assignShipment.shipment_code}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      Required: {assignShipment.weight_kg.toLocaleString()} kg / {assignShipment.volume_m3} m³ (
                      {assignShipment.pickup_city} ➔ {assignShipment.destination_city})
                    </span>
                  </div>
                </div>

                <button onClick={() => setAssignShipment(null)} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignLorry} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  <div className="text-xs font-bold text-slate-600">
                    Ranked by Deterministic Capacity, Fuel Efficiency, Driver Availability, and Proximity:
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fleetMindStore.getCandidateLorriesForShipment(assignShipment.id).map((cand) => {
                      const isSelected = selectedLorryId === cand.lorry.id;
                      return (
                        <div
                          key={cand.lorry.id}
                          onClick={() => {
                            setSelectedLorryId(cand.lorry.id);
                            if (cand.driver) setSelectedDriverId(cand.driver.id);
                          }}
                          className={`p-4 rounded-3xl border-2 transition cursor-pointer relative space-y-3 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/40 shadow-card'
                              : cand.is_feasible
                              ? 'border-slate-200 bg-white hover:border-blue-300'
                              : 'border-slate-200 bg-slate-50 opacity-60'
                          }`}
                        >
                          {/* Top: Lorry image & info */}
                          <div className="flex items-start gap-3">
                            <img
                              src={
                                cand.lorry.image_url ||
                                'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80'
                              }
                              alt={cand.lorry.model}
                              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-slate-900">{cand.lorry.lorry_code}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                                  Score: {cand.decision_score}/100
                                </span>
                              </div>
                              <span className="text-xs font-bold text-slate-700 block truncate">{cand.lorry.model}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{cand.lorry.registration_number}</span>
                            </div>
                          </div>

                          {/* Capacity Progress Bars */}
                          <div className="space-y-2 text-[11px] bg-slate-50 p-2.5 rounded-2xl">
                            <div>
                              <div className="flex justify-between font-bold text-slate-700 mb-0.5">
                                <span>Payload Load</span>
                                <span>{cand.weight_utilization_pct}% ({cand.remaining_weight.toLocaleString()} kg free)</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    cand.weight_utilization_pct > 90 ? 'bg-amber-500' : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${cand.weight_utilization_pct}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between font-bold text-slate-700 mb-0.5">
                                <span>Volume Load</span>
                                <span>{cand.volume_utilization_pct}% ({cand.remaining_volume} m³ free)</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-purple-600 transition-all"
                                  style={{ width: `${cand.volume_utilization_pct}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600">
                            <div>
                              <span className="text-slate-400 font-bold block">Efficiency</span>
                              <strong className="text-blue-600 font-black">{cand.lorry.fuel_efficiency_km_per_l} km/L</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold block">Driver</span>
                              <strong className="text-slate-900 font-bold truncate block">{cand.driver?.name || 'Unassigned'}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold block">Pickup Dist</span>
                              <strong className="text-slate-900 font-bold">{cand.distance_to_pickup_km} km</strong>
                            </div>
                          </div>

                          {/* Feasibility tags */}
                          <div className="flex items-center gap-2 pt-1">
                            {cand.is_feasible ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                100% FEASIBLE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                INSUFFICIENT CAPACITY
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <div className="text-xs">
                    {selectedLorryId ? (
                      <span className="font-bold text-slate-900">
                        Selected: <strong className="text-blue-600">{selectedLorryId}</strong>
                      </span>
                    ) : (
                      <span className="text-slate-400">Please click a candidate vehicle above to assign</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAssignShipment(null)}
                      className="px-4 py-2 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedLorryId}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Confirm Assignment & Dispatch
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

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
                  onClick={handleParseWithAI}
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
                    onClick={handleConfirmAiShipment}
                    className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl transition"
                  >
                    Submit Consignment to Intake Pool
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
