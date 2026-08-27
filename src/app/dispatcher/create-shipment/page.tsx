'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { ShipmentCategory, ShipmentPriority } from '../../../lib/optimization/types';
import { parseShipmentWithAI, ParsedShipment } from '../../../lib/ai/groq';
import { CITY_COORDINATES, resolveCityCoordinates } from '../../../lib/routing/city-coordinates';
import {
  Package,
  Sparkles,
  MapPin,
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
  FileText,
  Truck,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DispatcherCreateShipmentPage() {
  const router = useRouter();

  // Mode: AI vs Manual
  const [activeMode, setActiveMode] = useState<'ai' | 'manual'>('ai');

  // AI Extraction State
  const [aiPrompt, setAiPrompt] = useState(
    'Intake 3.2 tonnes of CNC transmission casings from Chennai Port CFS to Hosur SIPCOT Phase 1 for delivery by tomorrow 5 PM. Sender is Apex Precision Ltd.'
  );
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedShipment | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Manual Form State
  const [form, setForm] = useState({
    // Sender / Customer
    customerName: 'Apex Precision Engineering Ltd',
    senderCompany: 'Apex Precision Engineering Ltd',
    senderName: 'Suresh Ramanathan',
    senderEmail: 'suresh.r@apexprecision.in',
    senderPhone: '+91 98401 22334',
    pickupCity: 'Chennai',
    pickupAddress: 'Chennai Port Container Freight Station, Gate 2',
    pickupLat: 13.0827,
    pickupLng: 80.2707,

    // Receiver
    receiverCompany: 'Hosur Automotive Assemblies Ltd',
    receiverName: 'Rahul Kumar',
    receiverEmail: 'rahul.kumar@hosurauto.in',
    receiverPhone: '+91 98401 12345',
    destinationCity: 'Hosur',
    destinationAddress: 'Hosur SIPCOT Industrial Complex, Phase 1',
    destinationLat: 12.8399,
    destinationLng: 77.677,

    // Cargo details
    description: 'CNC Machined Transmission Casings & Flanges (3,200 kg)',
    category: 'AUTOMOTIVE' as ShipmentCategory,
    weightKg: 3200,
    volumeM3: 11.5,
    packageCount: 24,
    priority: 'HIGH' as ShipmentPriority,
    deliveryDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
    valueInr: 480000,
    specialInstructions: 'Direct dispatch. Temperature stability verified.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Ingestion Handler
  const handleParseWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiParsing(true);
    setAiError(null);
    setParsedData(null);

    try {
      const result = await parseShipmentWithAI(aiPrompt);
      setParsedData(result);

      // Auto-populate form
      const pickupCoords = resolveCityCoordinates(result.pickup_city);
      const destCoords = resolveCityCoordinates(result.destination_city);

      setForm((prev) => ({
        ...prev,
        description: `${result.commodity} (${result.weight_kg.toLocaleString()} kg)`,
        category: result.category,
        weightKg: result.weight_kg,
        volumeM3: result.volume_m3 || Number((result.weight_kg / 300).toFixed(1)),
        packageCount: result.package_count || 10,
        priority: result.priority,
        pickupCity: result.pickup_city,
        pickupAddress: result.pickup_address,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        destinationCity: result.destination_city,
        destinationAddress: result.destination_address,
        destinationLat: destCoords.lat,
        destinationLng: destCoords.lng,
        senderName: result.sender_name || prev.senderName,
        senderCompany: result.sender_company || prev.senderCompany,
        customerName: result.sender_company || prev.customerName,
        senderPhone: result.sender_phone || prev.senderPhone,
        receiverName: result.receiver_name || prev.receiverName,
        receiverCompany: result.receiver_company || prev.receiverCompany,
        receiverPhone: result.receiver_phone || prev.receiverPhone,
        deliveryDeadline: result.delivery_deadline.slice(0, 16),
      }));
    } catch (err: any) {
      setAiError(err.message || 'AI extraction failed. Please enter details manually.');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleCityChange = (field: 'pickupCity' | 'destinationCity', city: string) => {
    const coords = resolveCityCoordinates(city);
    if (field === 'pickupCity') {
      setForm((prev) => ({
        ...prev,
        pickupCity: city,
        pickupLat: coords.lat,
        pickupLng: coords.lng,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        destinationCity: city,
        destinationLat: coords.lat,
        destinationLng: coords.lng,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newShipment = fleetMindStore.createShipment({
        customer_name: form.customerName,
        description: form.description,
        pickup_lat: form.pickupLat,
        pickup_lng: form.pickupLng,
        pickup_address: form.pickupAddress,
        pickup_city: form.pickupCity,
        destination_lat: form.destinationLat,
        destination_lng: form.destinationLng,
        destination_address: form.destinationAddress,
        destination_city: form.destinationCity,
        weight_kg: Number(form.weightKg),
        volume_m3: Number(form.volumeM3),
        category: form.category,
        priority: form.priority,
        delivery_deadline: new Date(form.deliveryDeadline).toISOString(),
        value_inr: Number(form.valueInr),
        sender_name: form.senderName,
        sender_company: form.senderCompany,
        sender_phone: form.senderPhone,
        sender_email: form.senderEmail,
        receiver_name: form.receiverName,
        receiver_company: form.receiverCompany,
        receiver_phone: form.receiverPhone,
        receiver_email: form.receiverEmail,
      });

      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}

      setTimeout(() => {
        router.push('/dispatcher/shipments');
      }, 700);
    } catch (err: any) {
      alert(err.message || 'Error booking consignment');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PortalHeader
        title="Intake New Consignment"
        subtitle="Book and ingest commercial freight consignments for fleet load grouping & route optimization"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Navigation & Mode Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/dispatcher/shipments"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              ← Back to All Shipments
            </Link>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
            <button
              onClick={() => setActiveMode('ai')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
                activeMode === 'ai'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              ⚡ AI Auto-Extract
            </button>
            <button
              onClick={() => setActiveMode('manual')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeMode === 'manual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Manual Booking Form
            </button>
          </div>
        </div>

        {/* AI INTAKE BOX */}
        {activeMode === 'ai' && (
          <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-wider text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                FleetMind AI Natural Language Parser
              </div>
              <h3 className="text-xl font-black">Natural Language Consignment Extraction</h3>
              <p className="text-xs text-blue-100 max-w-2xl">
                Paste raw dispatch orders, emails, or operational instructions. FleetMind AI will parse commodity, weight, SLA deadline, priority, and coordinates automatically.
              </p>
            </div>

            <form onSubmit={handleParseWithAI} className="space-y-3">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white text-xs placeholder:text-blue-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Example: Send 2.5 tonnes of cotton textiles from Karur to Chennai CFS before tomorrow 5 PM..."
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-blue-200">
                  Tip: Supports weight units, city corridors, commodity types & SLA time targets
                </span>
                <button
                  type="submit"
                  disabled={isAiParsing}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  {isAiParsing ? 'Analyzing with Groq AI...' : 'Extract & Auto-Fill Form'}
                </button>
              </div>
            </form>

            {aiError && (
              <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {parsedData && (
              <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-xs space-y-2 text-emerald-100 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Consignment Successfully Extracted! Details populated below.</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div><span className="text-emerald-300/70 font-bold block">Commodity:</span> {parsedData.commodity}</div>
                  <div><span className="text-emerald-300/70 font-bold block">Weight:</span> {parsedData.weight_kg.toLocaleString()} kg</div>
                  <div><span className="text-emerald-300/70 font-bold block">Corridor:</span> {parsedData.pickup_city} → {parsedData.destination_city}</div>
                  <div><span className="text-emerald-300/70 font-bold block">Priority:</span> {parsedData.priority}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INTAKE FORM */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-8">
          {/* Section 1: Customer & Sender Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-blue-600" />
              1. Customer & Origin (Pickup) Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer / Shipper Name</label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value, senderCompany: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pickup City</label>
                <select
                  value={form.pickupCity}
                  onChange={(e) => handleCityChange('pickupCity', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {Object.keys(CITY_COORDINATES).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Pickup Address & Hub</label>
                <input
                  type="text"
                  required
                  value={form.pickupAddress}
                  onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sender Contact Person</label>
                <input
                  type="text"
                  value={form.senderName}
                  onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sender Contact Phone</label>
                <input
                  type="text"
                  value={form.senderPhone}
                  onChange={(e) => setForm({ ...form, senderPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Destination Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-emerald-600" />
              2. Destination & Receiver Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Destination City</label>
                <select
                  value={form.destinationCity}
                  onChange={(e) => handleCityChange('destinationCity', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {Object.keys(CITY_COORDINATES).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receiver Company Name</label>
                <input
                  type="text"
                  required
                  value={form.receiverCompany}
                  onChange={(e) => setForm({ ...form, receiverCompany: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Delivery Address</label>
                <input
                  type="text"
                  required
                  value={form.destinationAddress}
                  onChange={(e) => setForm({ ...form, destinationAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receiver Contact Person</label>
                <input
                  type="text"
                  value={form.receiverName}
                  onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receiver Phone Number</label>
                <input
                  type="text"
                  value={form.receiverPhone}
                  onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Cargo Payload & Optimization Constraints */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <Package className="w-4 h-4 text-purple-600" />
              3. Cargo Specifications & SLA Priority
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cargo Description</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payload Weight (kg)</label>
                <input
                  type="number"
                  required
                  min="10"
                  max="40000"
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-black text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cargo Volume (m³)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={form.volumeM3}
                  onChange={(e) => setForm({ ...form, volumeM3: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cargo Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ShipmentCategory })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="GENERAL">GENERAL FREIGHT</option>
                  <option value="AUTOMOTIVE">AUTOMOTIVE</option>
                  <option value="TEXTILE">TEXTILE & APPAREL</option>
                  <option value="ELECTRONICS">ELECTRONICS</option>
                  <option value="PERISHABLE">PERISHABLE (REFRIGERATED)</option>
                  <option value="AGRICULTURE">AGRICULTURE</option>
                  <option value="FRAGILE">FRAGILE GOODS</option>
                  <option value="HAZARDOUS">HAZARDOUS CARGO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SLA Priority Engine</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as ShipmentPriority })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-black text-blue-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="CRITICAL">🔥 CRITICAL (Highest Priority)</option>
                  <option value="HIGH">⚡ HIGH PRIORITY</option>
                  <option value="MEDIUM">● MEDIUM PRIORITY</option>
                  <option value="LOW">○ LOW PRIORITY</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target SLA Delivery Deadline</label>
                <input
                  type="datetime-local"
                  required
                  value={form.deliveryDeadline}
                  onChange={(e) => setForm({ ...form, deliveryDeadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Declared Value (₹ INR)</label>
                <input
                  type="number"
                  min="0"
                  value={form.valueInr}
                  onChange={(e) => setForm({ ...form, valueInr: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/dispatcher/shipments"
              className="text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              Cancel
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {isSubmitting ? 'Booking & Ingesting Consignment...' : 'Book & Ingest Consignment'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
