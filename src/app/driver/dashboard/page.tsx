'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { DriverGpsTracker } from '../../../components/driver/driver-gps-tracker';

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState(fleetMindStore.getRoutes());
  const [shipments, setShipments] = useState(fleetMindStore.getShipments());
  const [lorries, setLorries] = useState(fleetMindStore.getLorries());
  const [drivers, setDrivers] = useState(fleetMindStore.getDrivers());

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
    });
    return unsub;
  }, []);

  // Find current driver from the store
  const currentDriver = drivers.find(
    (d) => d.email === user?.email || d.name === user?.full_name || d.id === user?.id
  ) || drivers[0];

  // Find lorry assigned to this driver
  const assignedLorry = lorries.find(
    (l) => l.assigned_driver_id === currentDriver?.id || l.id === currentDriver?.assigned_lorry_id
  ) || lorries.find((l) => l.id === routes[0]?.lorry_id) || lorries[0];

  // Find active route for this driver
  const activeRoute = routes.find((r) => r.driver_id === currentDriver?.id) || routes.find((r) => r.stops.length > 0) || routes[0];
  const nextStop = activeRoute?.stops.find((s) => s.status !== 'COMPLETED') || activeRoute?.stops[0];

  // Get shipments assigned to this driver
  const myShipments = shipments.filter(
    (s) => s.assigned_driver_id === currentDriver?.id || s.assigned_driver_name === currentDriver?.name || s.assigned_lorry_id === assignedLorry?.id
  );
  const currentShipment = myShipments.find((s) => s.id === nextStop?.shipment_id) || myShipments.find((s) => s.status === 'IN_TRANSIT' || s.status === 'DISPATCHED') || myShipments[0] || shipments[0];

  const handleDriverAction = (eventType: DeliveryEventType, notes?: string, recipient?: string) => {
    if (!activeRoute || !nextStop) return;

    const actionData = {
      shipment_id: nextStop.shipment_id,
      route_id: activeRoute.id,
      driver_id: user?.id || 'driver-01',
      driver_name: user?.full_name || 'Murugan Selvam',
      event_type: eventType,
      latitude: nextStop.latitude,
      longitude: nextStop.longitude,
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
              {user?.full_name?.charAt(0) || 'M'}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-blue-200 font-bold block">
                Active Route Cockpit
              </span>
              <h2 className="text-lg font-bold leading-tight">{user?.full_name || 'Murugan Selvam'}</h2>
              <p className="text-xs text-blue-100">Vehicle: {assignedLorry?.lorry_code || 'L-11'} ({assignedLorry?.registration_number || 'TN-01-AB-4501'})</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black tracking-wider uppercase">
            ON ROUTE
          </span>
        </div>

        {/* Route Details Bar */}
        <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-100 font-medium">
          <span>Route: <strong className="text-white">{activeRoute?.route_code || 'RT-CHN-HOS-01'}</strong></span>
          <span>{activeRoute?.total_distance_km || 310} km • {activeRoute?.stops?.length || 4} Stops</span>
        </div>
      </div>

      {/* Real Mobile Driver GPS Broadcast Widget */}
      <DriverGpsTracker
        driverId={user?.id || 'driver-01'}
        driverName={user?.full_name || 'Murugan Selvam'}
        lorryCode={assignedLorry?.lorry_code || 'L-11'}
        shipmentId={currentShipment?.id || 'shipment-1042'}
      />

      {/* Next Stop Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Designated Delivery Stop
          </span>
          <span className="text-xs font-bold text-slate-900">
            ETA: {nextStop ? new Date(nextStop.arrival_eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '16:30'}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800">
            {nextStop?.stop_type || 'DELIVERY'}
          </span>
          <h3 className="text-base font-black text-slate-900 mt-1">
            {nextStop?.address || 'Hosur SIPCOT Industrial Complex, Phase 1'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Consignment: <strong className="text-slate-900">{currentShipment?.shipment_code || 'S-1042'}</strong> ({currentShipment?.weight_kg || 500} kg • {currentShipment?.category || 'ELECTRONICS'})
          </p>
        </div>

        {/* Big Touch Driver Action Buttons */}
        <div className="space-y-2 pt-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${nextStop?.latitude || 12.8399},${nextStop?.longitude || 77.6770}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-card transition flex items-center justify-center gap-2 min-h-[50px]"
          >
            <Navigation className="w-4 h-4" />
            START TURN NAVIGATION
          </a>

          {/* Dynamic contextual buttons based on stop type */}
          {nextStop?.stop_type === 'PICKUP' ? (
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
    </div>
  );
}
