'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/auth-context';
import { fleetMindStore } from '../../../lib/db/store';
import { ShipmentCategory, ShipmentPriority } from '../../../lib/optimization/types';
import { parseShipmentWithAI, ParsedShipment } from '../../../lib/ai/groq';
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
} from 'lucide-react';

export default function CreateShipmentPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Mode: AI vs Manual
  const [activeMode, setActiveMode] = useState<'ai' | 'manual'>('ai');

  // AI Extraction State
  const [aiPrompt, setAiPrompt] = useState(
    'I need to send 500 kg of electronics from Coimbatore to Chennai tomorrow before 5 PM. Sender is ABC Electronics and receiver is XYZ Electronics.'
  );
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedShipment | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Manual Form State
  const [form, setForm] = useState({
    // Sender
    senderType: 'BUSINESS' as 'PERSON' | 'BUSINESS',
    senderName: user?.full_name || 'Rajesh Kumar',
    senderCompany: 'ABC Electronics India Pvt Ltd',
    senderEmail: user?.email || 'customer@fleetmind.ai',
    senderPhone: '+91 98410 44556',
    senderAddressLine1: '42 Peenya Industrial Area, Phase II',
    senderAddressLine2: 'Near SIDCO Freight Gate',
    senderCity: 'Coimbatore',
    senderState: 'Tamil Nadu',
    senderPostalCode: '641021',
    senderCountry: 'India',
    pickupLat: 11.0168,
    pickupLng: 76.9558,

    // Receiver
    receiverType: 'BUSINESS' as 'PERSON' | 'BUSINESS',
    receiverName: 'Rahul Kumar',
    receiverCompany: 'XYZ Electronics Distributors',
    receiverEmail: 'rahul.kumar@xyzelectronics.in',
    receiverPhone: '+91 98401 12345',
    receiverAddressLine1: '108 Mount Road, Guindy Commercial Hub',
    receiverAddressLine2: 'Dock 4, Industrial Bay',
    receiverCity: 'Chennai',
    receiverState: 'Tamil Nadu',
    receiverPostalCode: '600032',
    receiverCountry: 'India',
    deliveryLat: 13.0827,
    deliveryLng: 80.2707,

    // Package Details
    description: 'Precision Printed Circuit Boards & IC Modules (500 kg)',
    category: 'ELECTRONICS' as ShipmentCategory,
    weightKg: 500,
    volumeM3: 1.8,
    packageCount: 14,
    fragile: true,
    priority: 'HIGH' as ShipmentPriority,
    pickupTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16),
    deliveryDeadline: new Date(Date.now() + 26 * 3600 * 1000).toISOString().slice(0, 16),
    specialInstructions: 'Handle with extreme ESD care. Temperature controlled lorry preferred.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);

  // Handle Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          pickupLat: pos.coords.latitude,
          pickupLng: pos.coords.longitude,
          senderAddressLine2: `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        }));
        setGeoLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGeoLocating(false);
      }
    );
  };

  // AI Parser
  const handleParseWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiParsing(true);
    setAiError(null);
    try {
      const result = await parseShipmentWithAI(aiPrompt);
      setParsedData(result);
    } catch (err: any) {
      setAiError(err.message || 'Failed to parse shipment with FleetMind AI.');
    } finally {
      setIsAiParsing(false);
    }
  };

  // Populate Form from AI output
  const handlePopulateFormFromAi = () => {
    if (!parsedData) return;
    setForm((prev) => ({
      ...prev,
      description: parsedData.commodity,
      weightKg: parsedData.weight_kg,
      volumeM3: parsedData.volume_m3 || Number((parsedData.weight_kg / 350).toFixed(2)),
      senderCity: parsedData.pickup_city,
      senderAddressLine1: parsedData.pickup_address,
      receiverCity: parsedData.destination_city,
      receiverAddressLine1: parsedData.destination_address,
      category: parsedData.category,
      priority: parsedData.priority,
      deliveryDeadline: parsedData.delivery_deadline.slice(0, 16),
      senderCompany: parsedData.sender_company || prev.senderCompany,
      receiverCompany: parsedData.receiver_company || prev.receiverCompany,
    }));
    setActiveMode('manual');
  };

  // Confirm and Create from AI directly
  const handleConfirmAiShipment = () => {
    if (!parsedData) return;
    setIsSubmitting(true);

    const newShipment = fleetMindStore.createShipment({
      customer_id: user?.id || 'cust-abc-electronics',
      customer_name: user?.full_name || 'ABC Electronics India Pvt Ltd',
      customer_email: user?.email || 'customer@fleetmind.ai',
      description: parsedData.commodity,
      weight_kg: parsedData.weight_kg,
      volume_m3: parsedData.volume_m3 || Number((parsedData.weight_kg / 350).toFixed(2)),
      package_count: parsedData.package_count || 10,
      fragile: parsedData.fragile !== undefined ? parsedData.fragile : false,
      category: parsedData.category,
      priority: parsedData.priority,
      delivery_deadline: new Date(parsedData.delivery_deadline).toISOString(),
      pickup_city: parsedData.pickup_city,
      pickup_address: parsedData.pickup_address,
      destination_city: parsedData.destination_city,
      destination_address: parsedData.destination_address,
      sender_name: parsedData.sender_name || user?.full_name || 'Rajesh Kumar',
      sender_company: parsedData.sender_company || 'ABC Electronics India Pvt Ltd',
      sender_email: user?.email || 'customer@fleetmind.ai',
      sender_phone: parsedData.sender_phone || '+91 98410 44556',
      receiver_name: parsedData.receiver_name || 'Rahul Kumar',
      receiver_company: parsedData.receiver_company || 'XYZ Electronics Distributors',
      receiver_email: 'rahul.kumar@xyzelectronics.in',
      receiver_phone: '+91 98401 12345',
      status: 'PENDING_DISPATCH',
    });

    // Notify
    fleetMindStore.createNotification({
      user_id: user?.email || 'customer@fleetmind.ai',
      shipment_id: newShipment.id,
      type: 'SHIPMENT_CREATED',
      title: `Shipment ${newShipment.shipment_code} Created`,
      message: `Your consignment has been lodged with Dispatcher Command. Optimization and vehicle assignment in progress.`,
      action_url: `/customer/shipments/${newShipment.id}`,
    });

    fleetMindStore.createNotification({
      user_id: 'dispatcher@fleetmind.ai',
      shipment_id: newShipment.id,
      type: 'SHIPMENT_CREATED',
      title: `New Shipper Load: ${newShipment.shipment_code}`,
      message: `Customer ${user?.full_name || 'Shipper'} created a ${newShipment.weight_kg}kg ${newShipment.category} consignment for ${newShipment.destination_city}.`,
      action_url: `/dispatcher/shipments`,
    });

    router.push(`/customer/shipments/${newShipment.id}`);
  };

  // Submit Manual Form
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newShipment = fleetMindStore.createShipment({
      customer_id: user?.id || 'cust-abc-electronics',
      customer_name: form.senderCompany || user?.full_name || 'Commercial Shipper',
      customer_email: form.senderEmail,
      description: form.description,
      weight_kg: Number(form.weightKg),
      volume_m3: Number(form.volumeM3),
      package_count: Number(form.packageCount),
      fragile: form.fragile,
      category: form.category,
      priority: form.priority,
      special_instructions: form.specialInstructions,
      pickup_time: new Date(form.pickupTime).toISOString(),
      delivery_deadline: new Date(form.deliveryDeadline).toISOString(),
      pickup_city: form.senderCity,
      pickup_address: `${form.senderAddressLine1}, ${form.senderAddressLine2}`,
      destination_city: form.receiverCity,
      destination_address: `${form.receiverAddressLine1}, ${form.receiverAddressLine2}`,
      sender_type: form.senderType,
      sender_name: form.senderName,
      sender_company: form.senderCompany,
      sender_email: form.senderEmail,
      sender_phone: form.senderPhone,
      sender_address_line1: form.senderAddressLine1,
      sender_address_line2: form.senderAddressLine2,
      sender_city: form.senderCity,
      sender_state: form.senderState,
      sender_postal_code: form.senderPostalCode,
      sender_country: form.senderCountry,
      pickup_lat: form.pickupLat,
      pickup_lng: form.pickupLng,
      receiver_type: form.receiverType,
      receiver_name: form.receiverName,
      receiver_company: form.receiverCompany,
      receiver_email: form.receiverEmail,
      receiver_phone: form.receiverPhone,
      receiver_address_line1: form.receiverAddressLine1,
      receiver_address_line2: form.receiverAddressLine2,
      receiver_city: form.receiverCity,
      receiver_state: form.receiverState,
      receiver_postal_code: form.receiverPostalCode,
      destination_lat: form.deliveryLat,
      destination_lng: form.deliveryLng,
      status: form.priority === 'CRITICAL' ? 'ACCEPTED' : 'PENDING_REVIEW',
    });

    fleetMindStore.createNotification({
      user_id: form.senderEmail,
      shipment_id: newShipment.id,
      type: 'SHIPMENT_CREATED',
      title: `Shipment ${newShipment.shipment_code} Created`,
      message: `Your consignment has been registered. Dispatcher is running multi-depot consolidation.`,
      action_url: `/customer/shipments/${newShipment.id}`,
    });

    fleetMindStore.createNotification({
      user_id: 'dispatcher@fleetmind.ai',
      shipment_id: newShipment.id,
      type: 'SHIPMENT_CREATED',
      title: `New Shipper Consignment: ${newShipment.shipment_code}`,
      message: `${form.senderCompany || form.senderName} booked a ${newShipment.weight_kg}kg ${newShipment.category} consignment for ${newShipment.destination_city}.`,
      action_url: `/dispatcher/shipments`,
    });

    router.push(`/customer/shipments/${newShipment.id}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Create New Consignment</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Book an LTL/FTL shipment with complete sender, receiver, and package parameters
          </p>
        </div>

        {/* Mode Pill Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveMode('ai')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === 'ai'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-card'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create with AI</span>
          </button>
          <button
            onClick={() => setActiveMode('manual')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === 'manual'
                ? 'bg-white text-blue-700 shadow-card font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Full Form Entry</span>
          </button>
        </div>
      </div>

      {/* AI CREATION SECTION */}
      {activeMode === 'ai' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">FleetMind AI Natural Language Order Entry</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Describe your consignment in plain English. AI extracts all origin, destination, weights, deadlines, and participants.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Consignment Description:
            </label>
            <textarea
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Send 500 kg of electronics from Coimbatore to Chennai tomorrow before 5 PM. Sender is ABC Electronics and receiver is XYZ Electronics."
              className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-600 font-medium"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 font-medium">
                Example: &quot;Send 2 tonnes of textiles from Karur to Chennai Port before tomorrow 5 PM&quot;
              </span>
              <button
                onClick={handleParseWithAi}
                disabled={isAiParsing}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isAiParsing ? 'FleetMind AI Extracting...' : 'Parse with FleetMind AI'}
              </button>
            </div>
          </div>

          {aiError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {/* AI Extracted Confirmation Card */}
          {parsedData && (
            <div className="bg-violet-50/70 border border-violet-200 rounded-3xl p-6 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-violet-200">
                <div className="flex items-center gap-2 text-violet-950 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>AI Extracted Parameters (Requires Confirmation)</span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-violet-200 text-violet-800 font-black tracking-wider uppercase">
                  Zod Validated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Commodity</span>
                  <p className="font-bold text-slate-900">{parsedData.commodity}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Weight & Volume</span>
                  <p className="font-bold text-slate-900">
                    {parsedData.weight_kg.toLocaleString()} kg • {parsedData.volume_m3 || (parsedData.weight_kg / 350).toFixed(1)} m³
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Category & Priority</span>
                  <p className="font-bold text-slate-900">
                    {parsedData.category} • {parsedData.priority}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</span>
                  <p className="font-semibold text-slate-800">
                    {parsedData.pickup_city} ({parsedData.pickup_address})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Destination</span>
                  <p className="font-semibold text-blue-700 font-bold">
                    {parsedData.destination_city} ({parsedData.destination_address})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Target Deadline</span>
                  <p className="font-bold text-slate-900">{new Date(parsedData.delivery_deadline).toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-violet-200 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handlePopulateFormFromAi}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
                >
                  Edit / Populate in Form
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAiShipment}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Creating Shipment...' : 'CONFIRM & CREATE SHIPMENT'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULL MANUAL FORM */}
      {activeMode === 'manual' && (
        <form onSubmit={handleSubmitManual} className="space-y-6">
          {/* SENDER SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  1
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Sender Information</h2>
              </div>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoLocating}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>{geoLocating ? 'Detecting Location...' : 'Use Current Location'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sender Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, senderType: 'BUSINESS' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      form.senderType === 'BUSINESS'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-extrabold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Business
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, senderType: 'PERSON' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      form.senderType === 'PERSON'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-extrabold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Person
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name</label>
                <input
                  type="text"
                  value={form.senderCompany}
                  onChange={(e) => setForm({ ...form, senderCompany: e.target.value })}
                  placeholder="ABC Electronics India Pvt Ltd"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={form.senderName}
                  onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                  placeholder="Rajesh Kumar"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.senderEmail}
                  onChange={(e) => setForm({ ...form, senderEmail: e.target.value })}
                  placeholder="rajesh@abcelectronics.in"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={form.senderPhone}
                  onChange={(e) => setForm({ ...form, senderPhone: e.target.value })}
                  placeholder="+91 98410 44556"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Origin City *</label>
                <input
                  type="text"
                  required
                  value={form.senderCity}
                  onChange={(e) => setForm({ ...form, senderCity: e.target.value })}
                  placeholder="Coimbatore"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pickup Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={form.senderAddressLine1}
                  onChange={(e) => setForm({ ...form, senderAddressLine1: e.target.value })}
                  placeholder="42 Peenya Industrial Area, Phase II"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>
          </div>

          {/* RECEIVER SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Receiver Information</h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Receiver email and phone are used for delivery OTP verification and notification
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receiver Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, receiverType: 'BUSINESS' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      form.receiverType === 'BUSINESS'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-extrabold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Business
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, receiverType: 'PERSON' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      form.receiverType === 'PERSON'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-extrabold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Person
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Facility Name</label>
                <input
                  type="text"
                  value={form.receiverCompany}
                  onChange={(e) => setForm({ ...form, receiverCompany: e.target.value })}
                  placeholder="XYZ Electronics Distributors"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Authorized Receiver Name *</label>
                <input
                  type="text"
                  required
                  value={form.receiverName}
                  onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
                  placeholder="Rahul Kumar"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receiver Email (for OTP) *</label>
                <input
                  type="email"
                  required
                  value={form.receiverEmail}
                  onChange={(e) => setForm({ ...form, receiverEmail: e.target.value })}
                  placeholder="rahul.kumar@xyzelectronics.in"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receiver Phone (for OTP) *</label>
                <input
                  type="tel"
                  required
                  value={form.receiverPhone}
                  onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })}
                  placeholder="+91 98401 12345"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Destination City *</label>
                <input
                  type="text"
                  required
                  value={form.receiverCity}
                  onChange={(e) => setForm({ ...form, receiverCity: e.target.value })}
                  placeholder="Chennai"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={form.receiverAddressLine1}
                  onChange={(e) => setForm({ ...form, receiverAddressLine1: e.target.value })}
                  placeholder="108 Mount Road, Guindy Commercial Hub"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                />
              </div>
            </div>
          </div>

          {/* PACKAGE & DEADLINE SPECIFICATIONS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                3
              </div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Package & Deadline Specifications</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Commodity Description *</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Precision Electronic Circuit Boards & SMD Components"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ShipmentCategory })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                >
                  <option value="ELECTRONICS">ELECTRONICS</option>
                  <option value="TEXTILE">TEXTILE</option>
                  <option value="AUTOMOTIVE">AUTOMOTIVE</option>
                  <option value="FOOD">FOOD / REEFER</option>
                  <option value="INDUSTRIAL">INDUSTRIAL</option>
                  <option value="DOCUMENTS">DOCUMENTS</option>
                  <option value="MEDICAL">MEDICAL</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Weight (kg) *</label>
                <input
                  type="number"
                  required
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Volume (m³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.volumeM3}
                  onChange={(e) => setForm({ ...form, volumeM3: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Package Count</label>
                <input
                  type="number"
                  value={form.packageCount}
                  onChange={(e) => setForm({ ...form, packageCount: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Priority SLA</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as ShipmentPriority })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                >
                  <option value="CRITICAL">CRITICAL (High Urgency)</option>
                  <option value="HIGH">HIGH Priority</option>
                  <option value="MEDIUM">MEDIUM Priority</option>
                  <option value="LOW">LOW Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Deadline *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.deliveryDeadline}
                  onChange={(e) => setForm({ ...form, deliveryDeadline: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="fragileToggle"
                  checked={form.fragile}
                  onChange={(e) => setForm({ ...form, fragile: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="fragileToggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Fragile / High-Care Cargo
                </label>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card hover:shadow-card-hover transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Registering Consignment...' : 'Confirm & Create Consignment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
