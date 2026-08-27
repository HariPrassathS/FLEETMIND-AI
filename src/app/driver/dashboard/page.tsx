'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth/auth-context';
import { fleetMindStore } from '../../../lib/db/store';
import { DeliveryEventType } from '../../../types/database';
import { queueDriverAction } from '../../../lib/utils/offline-queue';
import {
  Truck,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  User,
  X,
  Sparkles,
  ShieldCheck,
  Camera,
  FileCheck,
  Send,
  Lock,
  RotateCcw,
  Phone,
  Building2,
  Package,
  Fuel,
  IndianRupee,
  Receipt,
  PlusCircle,
} from 'lucide-react';
import { DriverGpsTracker } from '../../../components/driver/driver-gps-tracker';

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState(fleetMindStore.getRoutes());
  const [shipments, setShipments] = useState(fleetMindStore.getShipments());
  const [lorries, setLorries] = useState(fleetMindStore.getLorries());
  const [drivers, setDrivers] = useState(fleetMindStore.getDrivers());
  const [expenses, setExpenses] = useState(fleetMindStore.getExpenses());

  // On-Road Expense State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<'FUEL' | 'TOLL' | 'MAINTENANCE' | 'DRIVER_ALLOWANCE' | 'OTHER'>('FUEL');
  const [expenseAmount, setExpenseAmount] = useState('3500');
  const [expenseLiters, setExpenseLiters] = useState('36');
  const [expenseLocation, setExpenseLocation] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  // Delivery Verification State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verifStep, setVerifStep] = useState<1 | 2 | 3 | 4>(1);
  const [otpInfo, setOtpInfo] = useState<{ otp_code: string; expires_at: string; masked_email: string; masked_phone: string } | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // POD details
  const [receiverName, setReceiverName] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Delay modal
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayReason, setDelayReason] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setRoutes(fleetMindStore.getRoutes());
      setShipments(fleetMindStore.getShipments());
      setLorries(fleetMindStore.getLorries());
      setDrivers(fleetMindStore.getDrivers());
      setExpenses(fleetMindStore.getExpenses());
    });
    return unsub;
  }, []);

  // Find current driver from the store
  const currentDriver = drivers.find(
    (d) => (user?.email && d.email && d.email.toLowerCase() === user.email.toLowerCase()) ||
           (user?.full_name && d.name && d.name.toLowerCase() === user.full_name.toLowerCase()) ||
           (user?.id && (d.id === user.id || d.user_id === user.id)) ||
           (user?.email && d.phone && user.email.includes(d.phone.replace(/\D/g, '')))
  ) || (drivers.length > 0 ? drivers[0] : null);

  // Find lorry assigned to this driver
  const assignedLorry = currentDriver
    ? (lorries.find((l) => l.driver_id === currentDriver.id || l.assigned_driver_id === currentDriver.id || l.id === currentDriver.assigned_lorry_id) || lorries[0] || null)
    : (lorries.find((l) => l.assigned_driver_name === user?.full_name) || lorries[0] || null);

  // Get shipments assigned to this driver or driver's lorry
  const myShipments = shipments.filter(
    (s) => (currentDriver && (s.assigned_driver_id === currentDriver.id || s.assigned_driver_name === currentDriver.name)) ||
           (user?.full_name && s.assigned_driver_name?.toLowerCase() === user.full_name.toLowerCase()) ||
           (assignedLorry && (s.assigned_lorry_id === assignedLorry.id || s.assigned_lorry_code === assignedLorry.lorry_code))
  );

  // If driver has no specifically filtered shipments, pick all active dispatches
  const effectiveShipments = myShipments.length > 0
    ? myShipments
    : shipments.filter((s) => ['ASSIGNED', 'IN_TRANSIT', 'PICKED_UP', 'ACCEPTED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s.status));

  // Filter ONLY non-delivered active shipments for current navigation
  const activeShipments = effectiveShipments.filter((s) => s.status !== 'DELIVERED' && s.status !== 'CANCELLED');
  const isAllCompleted = effectiveShipments.length > 0 && activeShipments.length === 0;

  // Find active route or active shipment
  const activeRoute = routes.find((r) => r.driver_id === currentDriver?.id) || routes[0] || null;
  const currentShipment = activeShipments.find((s) => ['IN_TRANSIT', 'ASSIGNED', 'PICKED_UP', 'ACCEPTED', 'OUT_FOR_DELIVERY'].includes(s.status)) || activeShipments[0] || null;

  const isPickup = currentShipment ? (currentShipment.status === 'ASSIGNED' || currentShipment.status === 'ACCEPTED') : false;
  const isDelivered = isAllCompleted || (currentShipment ? currentShipment.status === 'DELIVERED' : false);

  const dynamicStop = currentShipment ? {
    stop_type: isPickup ? 'PICKUP' : 'DELIVERY',
    address: isPickup ? (currentShipment.pickup_address || `${currentShipment.pickup_city} Depot`) : (currentShipment.destination_address || `${currentShipment.destination_city} Consignee Dock`),
    city: isPickup ? currentShipment.pickup_city : currentShipment.destination_city,
    latitude: isPickup ? currentShipment.pickup_lat : currentShipment.destination_lat,
    longitude: isPickup ? currentShipment.pickup_lng : currentShipment.destination_lng,
    phone: isPickup ? currentShipment.sender_phone : currentShipment.receiver_phone,
    deadline: currentShipment.delivery_deadline,
  } : null;

  const handleDriverAction = (eventType: DeliveryEventType, notes?: string, recipient?: string) => {
    if (!currentShipment) return;

    const actionData = {
      shipment_id: currentShipment.id,
      route_id: activeRoute?.id || `RT-${currentShipment.shipment_code}`,
      driver_id: user?.id || currentDriver?.id || 'driver-01',
      driver_name: user?.full_name || currentDriver?.name || 'Driver',
      event_type: eventType,
      latitude: dynamicStop?.latitude || 13.0827,
      longitude: dynamicStop?.longitude || 80.2707,
      notes: notes || `Action ${eventType} triggered by driver`,
      recipient_name: recipient,
    };

    if (navigator.onLine) {
      fleetMindStore.recordDeliveryEvent(actionData);
    } else {
      queueDriverAction(actionData);
    }

    setSuccessToast(`Recorded: ${eventType.replace(/_/g, ' ')}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // OTP Handlers
  const handleSendOtp = () => {
    const info = fleetMindStore.createDeliveryOtp(currentShipment.id, user?.id || 'driver-01');
    setOtpInfo(info);
    setVerifStep(2);
    setOtpError(null);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    setOtpError(null);

    const result = fleetMindStore.verifyDeliveryOtp(currentShipment.id, enteredOtp);
    setIsVerifyingOtp(false);

    if (result.success) {
      setOtpSuccess(true);
      setTimeout(() => {
        setVerifStep(3);
      }, 800);
    } else {
      setOtpError(result.message);
    }
  };

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1677FF';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleFinalDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const signatureSvg = canvas ? canvas.toDataURL() : undefined;

    fleetMindStore.completeDeliveryProof(currentShipment.id, {
      receiver_name: receiverName,
      signature_svg: signatureSvg,
      photo_data_url: photoDataUrl,
      delivery_notes: deliveryNotes,
      driver_id: user?.id || 'driver-01',
    });

    setVerifStep(4);
    setTimeout(() => {
      setIsVerificationModalOpen(false);
      setVerifStep(1);
      setSuccessToast(`Consignment ${currentShipment.shipment_code} Marked DELIVERED ✓`);
    }, 2000);
  };

  const handleDelaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDriverAction('DELAY_REPORTED', delayReason);
    setIsDelayModalOpen(false);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0) return;

    setIsSubmittingExpense(true);
    const lorryId = assignedLorry?.id || 'lorry-01';
    const lorryCode = assignedLorry?.lorry_code || 'L-01';
    const driverId = user?.id || currentDriver?.id || 'driver-01';
    const driverName = user?.full_name || currentDriver?.name || 'Pilot Driver';

    fleetMindStore.createExpense({
      lorry_id: lorryId,
      lorry_code: lorryCode,
      driver_id: driverId,
      driver_name: driverName,
      trip_id: activeRoute?.id,
      category: expenseCategory,
      amount_inr: Number(expenseAmount),
      fuel_liters: expenseCategory === 'FUEL' ? Number(expenseLiters) : undefined,
      fuel_station: expenseLocation || `${currentShipment?.pickup_city || 'Highway'} Fuel Pump`,
      description: expenseDescription || `${expenseCategory} on ${currentShipment ? `${currentShipment.pickup_city} ➔ ${currentShipment.destination_city}` : 'Corridor'}`,
      date: new Date().toISOString(),
    });

    setIsSubmittingExpense(false);
    setIsExpenseModalOpen(false);
    setExpenseDescription('');
    setExpenseLocation('');
    setSuccessToast(`₹${Number(expenseAmount).toLocaleString()} ${expenseCategory} Logged & Sent to Dispatcher!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Filter expenses logged by this driver
  const myExpenses = expenses.filter(
    (e) => (currentDriver && (e.driver_id === currentDriver.id || e.driver_name === currentDriver.name)) ||
           (user?.full_name && e.driver_name?.toLowerCase() === user.full_name.toLowerCase()) ||
           (assignedLorry && (e.lorry_id === assignedLorry.id || e.lorry_code === assignedLorry.lorry_code))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-lg mx-auto">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-14 left-4 right-4 z-50 bg-emerald-600 text-white p-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in max-w-sm mx-auto">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Driver Cockpit Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg shadow-sm">
              {user?.full_name?.charAt(0) || currentDriver?.name?.charAt(0) || 'D'}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-blue-200 font-bold block">
                Active Driver Cockpit
              </span>
              <h2 className="text-lg font-bold leading-tight">{user?.full_name || currentDriver?.name || 'Driver'}</h2>
              <p className="text-xs text-blue-100">
                Vehicle: {assignedLorry ? `${assignedLorry.lorry_code} (${assignedLorry.registration_number})` : 'Vehicle Awaiting Assignment'}
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${isAllCompleted ? 'bg-emerald-500 text-white shadow-sm' : currentShipment ? (isPickup ? 'bg-amber-400 text-slate-950' : 'bg-emerald-400 text-slate-950') : 'bg-slate-700 text-white'}`}>
            {isAllCompleted ? 'ALL RUNS COMPLETED ✓' : currentShipment ? (isPickup ? 'GOING TO PICKUP' : 'IN TRANSIT') : 'STANDBY'}
          </span>
        </div>

        {/* Route Details Bar */}
        <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-100 font-medium">
          <span>Route: <strong className="text-white">{isAllCompleted ? 'All Consignments Safely Delivered ✓' : currentShipment ? `${currentShipment.pickup_city} → ${currentShipment.destination_city}` : 'No Active Assignment'}</strong></span>
          <span>{isAllCompleted ? `${effectiveShipments.filter(s => s.status === 'DELIVERED').length} Completed Runs` : currentShipment ? `${(currentShipment.weight_kg || 0).toLocaleString()} kg • ${currentShipment.category}` : '0 kg Payload'}</span>
        </div>
      </div>

      {/* Real Mobile Driver GPS Broadcast Widget */}
      <DriverGpsTracker
        driverId={user?.id || currentDriver?.id || 'driver-01'}
        driverName={user?.full_name || currentDriver?.name || 'Driver'}
        lorryCode={assignedLorry?.lorry_code || 'L-01'}
        shipmentId={currentShipment?.id || 'standby'}
      />

      {/* On-Road Expense & Fuel Quick Log Trigger */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">On-Road Expense Logger</h4>
            <span className="text-[10px] text-slate-500 font-medium">Diesel Fuel • FASTag Tolls • Food • Repairs</span>
          </div>
        </div>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Spend</span>
        </button>
      </div>

      {/* Next Stop Card / All Deliveries Completed Card / Standby Card */}
      {currentShipment && dynamicStop ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Designated {dynamicStop.stop_type} Stop
            </span>
            <span className="text-xs font-bold text-slate-900">
              Deadline: {dynamicStop.deadline ? new Date(dynamicStop.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
            </span>
          </div>

          <div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${dynamicStop.stop_type === 'PICKUP' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {dynamicStop.stop_type}
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1">
              {dynamicStop.address}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Consignment: <strong className="text-slate-900">{currentShipment.shipment_code}</strong> ({(currentShipment.weight_kg || 0).toLocaleString()} kg • {currentShipment.category})
            </p>
          </div>

          {/* Big Touch Driver Action Buttons */}
          <div className="space-y-2 pt-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${dynamicStop.latitude || 13.0827},${dynamicStop.longitude || 80.2707}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-card transition flex items-center justify-center gap-2 min-h-[50px]"
            >
              <Navigation className="w-4 h-4" />
              START TURN NAVIGATION
            </a>

            {/* Dynamic contextual buttons based on stop type */}
            {dynamicStop.stop_type === 'PICKUP' ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDriverAction('ARRIVED_PICKUP', 'Driver reached shipper pickup warehouse')}
                  className="py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-sm transition min-h-[48px] flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  ARRIVED AT PICKUP
                </button>

                <button
                  onClick={() => handleDriverAction('PICKED_UP', 'Cargo loaded and secured. Moving on route.')}
                  className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-card transition min-h-[48px] flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  CONFIRM PICKUP
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDriverAction('ARRIVED_DESTINATION', 'Driver arrived at receiver destination dock')}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition min-h-[48px]"
                >
                  ARRIVED AT DESTINATION
                </button>

                <button
                  onClick={() => {
                    setIsVerificationModalOpen(true);
                    setVerifStep(1);
                  }}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-card transition min-h-[48px] flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  VERIFY & DELIVER (OTP)
                </button>
              </div>
            )}

            <button
              onClick={() => setIsDelayModalOpen(true)}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl border border-rose-200 transition min-h-[44px] flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              REPORT DELAY OR BREAKDOWN
            </button>
          </div>
        </div>
      ) : isAllCompleted ? (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border-2 border-emerald-200 rounded-3xl p-6 shadow-card space-y-4 text-center animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-emerald-950">ALL DELIVERIES COMPLETED ✓</h3>
            <p className="text-xs text-emerald-800 font-semibold max-w-sm mx-auto leading-relaxed">
              All assigned consignments for lorry <strong>{assignedLorry?.lorry_code || 'L-01'}</strong> have been safely handed over with cryptographic OTP & digital signature proof.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href="/driver/history"
              className="py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>View History ({effectiveShipments.filter(s => s.status === 'DELIVERED').length})</span>
            </Link>
            <Link
              href="/driver/shipments"
              className="py-3 bg-white hover:bg-slate-50 text-slate-800 border border-emerald-200 text-xs font-bold rounded-2xl shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Cargo Manifest</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">Standby • Ready for Dispatch</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            No active shipments are currently assigned to your roster. Once the dispatcher allocates a load, turn navigation, pickup address, and receiver OTP will activate here.
          </p>
        </div>
      )}

      {/* Customer & Consignee Cargo Manifest Card */}
      {currentShipment && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Customer & Consignee Manifest
            </span>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
              {currentShipment.shipment_code}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Customer / Shipper Info */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">1. Shipper / Customer</span>
                <span className="text-[10px] bg-slate-200/80 text-slate-700 font-bold px-1.5 py-0.5 rounded">PICKUP</span>
              </div>
              <strong className="text-slate-900 text-sm font-bold block">
                {currentShipment.sender_company || currentShipment.customer_name || 'Commercial Shipper'}
              </strong>
              <p className="text-slate-600 font-medium text-[11px]">
                Contact: <strong className="text-slate-800">{currentShipment.sender_name || 'Warehouse Dispatcher'}</strong>
              </p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                📍 {currentShipment.pickup_address || currentShipment.pickup_city}
              </p>
              {currentShipment.sender_phone && (
                <a
                  href={`tel:${currentShipment.sender_phone}`}
                  className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] shadow-sm transition"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Shipper ({currentShipment.sender_phone})</span>
                </a>
              )}
            </div>

            {/* Consignee / Receiver Info */}
            <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-blue-600 font-bold uppercase">2. Consignee / Receiver</span>
                <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded">DELIVERY</span>
              </div>
              <strong className="text-slate-900 text-sm font-bold block">
                {currentShipment.receiver_company || 'Authorized Receiving Dock'}
              </strong>
              <p className="text-slate-600 font-medium text-[11px]">
                Contact: <strong className="text-slate-800">{currentShipment.receiver_name}</strong>
              </p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                📍 {currentShipment.destination_address || currentShipment.destination_city}
              </p>
              {currentShipment.receiver_phone && (
                <a
                  href={`tel:${currentShipment.receiver_phone}`}
                  className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] shadow-sm transition"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Consignee ({currentShipment.receiver_phone})</span>
                </a>
              )}
            </div>

            {/* Special Instructions & Cargo */}
            {currentShipment.special_instructions && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                <strong>Handling Note:</strong> {currentShipment.special_instructions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress & Stops sequence */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Route Waypoint Stops
        </h4>

        <div className="space-y-2">
          {activeRoute?.stops.map((stop, idx) => (
            <div
              key={stop.id}
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                stop.status === 'COMPLETED' ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <span className="font-bold text-slate-900">{idx + 1}. {stop.stop_type}</span>
                <p className="text-[11px] text-slate-600 truncate max-w-[200px]">{stop.address}</p>
              </div>
              <span className={`text-[10px] font-bold ${stop.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-400'}`}>
                {stop.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECURE DELIVERY VERIFICATION & OTP MODAL */}
      {isVerificationModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsVerificationModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5" />
                <div>
                  <h3 className="text-sm font-bold">Delivery Verification</h3>
                  <p className="text-[11px] text-emerald-100">Consignment {currentShipment.shipment_code}</p>
                </div>
              </div>
              <button
                onClick={() => setIsVerificationModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* STEP 1: SEND OTP */}
              {verifStep === 1 && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-subtle">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Authorize Handover via OTP</h4>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 leading-relaxed">
                      A 6-digit cryptographic one-time password will be dispatched to the receiver contact for identity confirmation.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Receiver:</span>
                      <strong className="text-slate-900">{currentShipment.receiver_name || 'Rahul Kumar'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Masked Contact:</span>
                      <span className="font-mono font-bold text-slate-700">r***@example.com (******1234)</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSendOtp}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-card transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>SEND DELIVERY OTP TO RECEIVER</span>
                  </button>
                </div>
              )}

              {/* STEP 2: ENTER & VERIFY OTP */}
              {verifStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-2xl text-xs text-blue-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>OTP Dispatched Successfully!</span>
                    </div>
                    <p className="text-[11px] text-blue-700">
                      Sent to receiver email & SMS notification.
                      {otpInfo && (
                        <span className="block mt-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded w-fit">
                          Consignee Handover OTP: {otpInfo.otp_code}
                        </span>
                      )}
                    </p>
                  </div>

                  {otpError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 text-center">
                      Enter 6-Digit Receiver OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="• • • • • •"
                      className="w-full py-3 text-center text-xl tracking-[0.5em] font-mono font-black rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || enteredOtp.length < 6}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-card transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isVerifyingOtp ? 'Verifying on Server...' : 'VERIFY OTP'}</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Resend OTP Code
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: SIGNATURE & PHOTO PROOF */}
              {verifStep === 3 && (
                <form onSubmit={handleFinalDeliverySubmit} className="space-y-4 text-xs">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ OTP Cryptographically Verified!</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Receiver Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                    />
                  </div>

                  {/* Signature Canvas Pad */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 uppercase">Draw Signature on Screen *</label>
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Clear
                      </button>
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={380}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-28 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 cursor-crosshair touch-none"
                    />
                    <span className="text-[10px] text-slate-400 block text-center mt-1">
                      {hasSignature ? '✓ Signature recorded' : 'Touch/drag finger or cursor to sign'}
                    </span>
                  </div>

                  {/* Delivery Notes */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Cargo Condition Notes</label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-card transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRM FINAL DELIVERY & UPLOAD POD</span>
                  </button>
                </form>
              )}

              {/* STEP 4: SUCCESS */}
              {verifStep === 4 && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">DELIVERED & VERIFIED ✓</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Proof of Delivery saved. Customer and Dispatcher dashboards updated in real-time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent On-Road Expenses Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-amber-600" /> Logged Road Expenses ({myExpenses.length})
          </span>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Log New
          </button>
        </div>

        {myExpenses.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400 font-medium">
            No on-road expenses recorded yet for this shift.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {myExpenses.slice(0, 5).map((exp) => (
              <div
                key={exp.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      exp.category === 'FUEL'
                        ? 'bg-blue-100 text-blue-800'
                        : exp.category === 'TOLL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {exp.category}
                    </span>
                    <span className="font-bold text-slate-800 truncate max-w-[150px]">{exp.description}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {new Date(exp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {exp.lorry_code}
                  </span>
                </div>
                <strong className="text-slate-900 font-black text-sm">₹{exp.amount_inr.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Delay Modal */}
      {isDelayModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDelayModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
            <div className="bg-rose-600 p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Report Delay / Breakdown
              </h3>
              <button onClick={() => setIsDelayModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDelaySubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Reason for Delay</label>
                <textarea
                  rows={3}
                  required
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDelayModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* On-Road Expense Logging Modal */}
      {isExpenseModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsExpenseModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Log Road Expense</h3>
                  <span className="text-[10px] text-amber-100 font-medium">Syncs directly to Dispatcher desk</span>
                </div>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="p-5 space-y-4 text-xs">
              {/* Category Picker */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Expense Type</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="FUEL">⛽ Diesel Fuel Refill</option>
                  <option value="TOLL">🛣️ Highway FASTag / Toll Plaza</option>
                  <option value="MAINTENANCE">🔧 Vehicle Repair / Puncture</option>
                  <option value="DRIVER_ALLOWANCE">🍱 Food & Driver Allowance</option>
                  <option value="OTHER">📦 Other On-Road Expense</option>
                </select>
              </div>

              {/* Amount ₹ INR */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Amount (₹ INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="e.g. 3500"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 font-black text-slate-900 focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>

              {/* Fuel Liters if Fuel */}
              {expenseCategory === 'FUEL' && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Fuel Quantity (Litres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={expenseLiters}
                    onChange={(e) => setExpenseLiters(e.target.value)}
                    placeholder="e.g. 36.5"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* Station / Plaza Name */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {expenseCategory === 'FUEL' ? 'Fuel Station' : expenseCategory === 'TOLL' ? 'Toll Plaza Name' : 'Location'}
                </label>
                <input
                  type="text"
                  value={expenseLocation}
                  onChange={(e) => setExpenseLocation(e.target.value)}
                  placeholder={
                    expenseCategory === 'FUEL'
                      ? 'e.g. Indian Oil COCO, Salem NH-44'
                      : expenseCategory === 'TOLL'
                      ? 'e.g. Omalur Toll Plaza FASTag'
                      : 'e.g. Workshop / Rest Stop'
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Receipt No / Notes</label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="e.g. Full tank diesel before Ghat section"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Submit to Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
