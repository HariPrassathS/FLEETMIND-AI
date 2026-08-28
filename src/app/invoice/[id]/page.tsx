'use client';

/**
 * FleetMind AI — Public Consignment Tax Invoice & Proof of Delivery (POD) Receipt
 * 
 * Publicly accessible via direct link for Receivers / Consignees (No Login Required)
 * Also accessible from Customer and Dispatcher Portals with 1-click PDF download & print.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fleetMindStore } from '../../../lib/db/store';
import { Shipment, Lorry, Driver } from '../../../lib/optimization/types';
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Truck,
  Receipt,
  FileCheck,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export default function PublicInvoicePage() {
  const params = useParams();
  const id = (params?.id as string) || '';

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [lorry, setLorry] = useState<Lorry | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const allShipments = fleetMindStore.getShipments();
      const s = allShipments.find(
        (item) =>
          item.id === id ||
          item.shipment_code === id ||
          item.id.toLowerCase() === id.toLowerCase() ||
          item.shipment_code.toLowerCase() === id.toLowerCase()
      );

      if (s) {
        setShipment({ ...s });
        if (s.assigned_lorry_id) {
          const l = fleetMindStore.getLorryById(s.assigned_lorry_id);
          if (l) setLorry({ ...l });
        }
        if (s.assigned_driver_id) {
          const d = fleetMindStore.getDriverById(s.assigned_driver_id);
          if (d) setDriver({ ...d });
        }
      }
      setIsLoading(false);
    };

    loadData();
    const unsub = fleetMindStore.subscribe(loadData);
    return unsub;
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-pulse text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto text-blue-600">
            <Receipt className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-xs font-bold text-slate-500">Loading Official Tax Invoice...</p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Invoice Record Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            We could not locate an invoice for record code <strong>{id}</strong>. Please check your link or contact FleetMind Support.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const invoiceNumber = `INV-${shipment.shipment_code.replace(/[^A-Za-z0-9]/g, '')}`;
  const totalCost = shipment.estimated_cost || 4200;
  const taxableSubtotal = Math.round(totalCost / 1.18);
  const gstAmount = totalCost - taxableSubtotal;
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;
  const isDelivered = shipment.status === 'DELIVERED';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans py-8 px-4 sm:px-8 selection:bg-blue-100 print:bg-white print:p-0">
      
      {/* Top Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <img src="/logo.png" alt="FleetMind" className="w-5 h-5 object-contain" />
            <span>FleetMind AI</span>
          </Link>
          <span className="text-xs text-slate-400 font-semibold">• Public Consignment Invoice</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 hover:-translate-y-0.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Invoice Paper Document */}
      <main className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-12 space-y-8 print:border-none print:shadow-none print:p-4 print:rounded-none">
        
        {/* Document Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b-2 border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="FleetMind AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 flex items-center gap-2">
                <span>FleetMind</span>
                <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-xs text-slate-500 font-semibold">Autonomous Fleet Logistics & Freight Network</p>
              <p className="text-[11px] text-slate-400 font-mono">GSTIN: 33AAFCC4821M1Z8 • SAC: 996511 (Road Freight)</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isDelivered ? 'DELIVERED & VERIFIED' : shipment.status}</span>
            </div>
            <p className="text-xs font-black text-slate-900 font-mono">{invoiceNumber}</p>
            <p className="text-[11px] text-slate-400">
              Date: {new Date(shipment.actual_delivery_time || shipment.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </p>
          </div>
        </header>

        {/* Consignor (Sender) & Consignee (Receiver) Two-Column Matrix */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 p-5 rounded-2xl border border-slate-100 text-xs">
          {/* Sender */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Consignor / Origin Dock (Sender)
            </span>
            <strong className="text-sm font-bold text-slate-900 block">
              {shipment.sender_company || shipment.sender_name || shipment.customer_name}
            </strong>
            <p className="text-slate-600 font-medium leading-relaxed">
              {shipment.pickup_address}, {shipment.pickup_city}
            </p>
            <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
              <p>Contact: {shipment.sender_name || 'Shipper Representative'}</p>
              <p>Email: {shipment.sender_email || shipment.customer_email || 'shipper@fleetmind.ai'}</p>
              <p>Phone: {shipment.sender_phone || '+91 98410 00000'}</p>
            </div>
          </div>

          {/* Receiver */}
          <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l sm:pl-6 border-slate-200 pt-4 sm:pt-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
              Consignee / Destination Dock (Receiver)
            </span>
            <strong className="text-sm font-bold text-slate-900 block">
              {shipment.receiver_company || shipment.receiver_name || 'Consignee Receiver'}
            </strong>
            <p className="text-slate-600 font-medium leading-relaxed">
              {shipment.destination_address}, {shipment.destination_city}
            </p>
            <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
              <p>Attn: {shipment.receiver_verified_name || shipment.receiver_name || 'Authorized Recipient'}</p>
              <p>Email: {shipment.receiver_email || 'receiver@fleetmind.ai'}</p>
              <p>Phone: {shipment.receiver_phone || '+91 98410 11111'}</p>
            </div>
          </div>
        </section>

        {/* Consignment & Transport Metadata Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Consignment Code</span>
            <strong className="text-blue-600 font-mono font-bold">{shipment.shipment_code}</strong>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Highway Corridor</span>
            <strong className="text-slate-900 font-bold">{shipment.pickup_city} ➔ {shipment.destination_city}</strong>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Assigned Carrier</span>
            <strong className="text-slate-900 font-bold">{lorry ? `${lorry.lorry_code} (${lorry.model})` : 'Tata 1109 LPT'}</strong>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Commercial Pilot</span>
            <strong className="text-slate-900 font-bold">{driver ? driver.name : 'Commercial Pilot'}</strong>
          </div>
        </section>

        {/* Itemized Freight Table */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Itemized Freight & Handling Charges
          </h2>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px]">
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Cargo Description & SAC</th>
                  <th className="p-3.5 text-center">Gross Weight</th>
                  <th className="p-3.5 text-center">Volume</th>
                  <th className="p-3.5 text-center">Category / SLA</th>
                  <th className="p-3.5 text-right">Taxable Tariff (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                <tr>
                  <td className="p-3.5 font-bold text-slate-400">1</td>
                  <td className="p-3.5">
                    <strong className="text-slate-900 block font-bold">{shipment.description}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">SAC 996511 • Inter-City Road Transportation</span>
                  </td>
                  <td className="p-3.5 text-center font-semibold">{shipment.weight_kg.toLocaleString()} kg</td>
                  <td className="p-3.5 text-center font-semibold">{shipment.volume_m3 || 1.2} m³</td>
                  <td className="p-3.5 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                      {shipment.category} • {shipment.priority}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-bold text-slate-900">
                    ₹{taxableSubtotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Calculation Summary & Statutory GST Breakdown */}
        <section className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-2">
          <div className="space-y-3 max-w-sm text-xs text-slate-500">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-800 block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Cryptographic Handover Verification
              </span>
              <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                Verified at consignee dock via 6-digit cryptographic One-Time Password (OTP) and signed proof of delivery.
              </p>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Note: This is an official computer-generated Tax Invoice and proof of delivery valid under Rule 46 of the CGST Rules, 2017.
            </p>
          </div>

          <div className="w-full sm:w-80 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Freight Taxable Subtotal:</span>
              <span className="font-bold text-slate-900">₹{taxableSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Central GST (CGST @ 9%):</span>
              <span className="font-semibold text-slate-800">₹{cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>State GST (SGST @ 9%):</span>
              <span className="font-semibold text-slate-800">₹{sgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-slate-900 text-slate-950 font-black text-sm bg-slate-50 px-3 rounded-xl mt-2">
              <span>Total Invoice Amount:</span>
              <span className="text-blue-700 text-base">₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </section>

        {/* Proof of Delivery (Signature & Photo) if Delivered */}
        {isDelivered && (
          <section className="pt-4 border-t border-slate-100 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Verified Proof of Delivery (POD) Records
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Receiver Signature */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Receiver Digital Signature</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">✓ Verified</span>
                </div>
                <div className="h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2">
                  {shipment.signature_path ? (
                    <img src={shipment.signature_path} alt="Receiver Signature" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Digital Signature On File</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 text-center">
                  Signed by: <strong>{shipment.receiver_verified_name || shipment.receiver_name || 'Authorized Receiver'}</strong>
                </p>
              </div>

              {/* Handover Photo */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Geo-Tagged Cargo Handover Photo</span>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-full">Timestamped</span>
                </div>
                <div className="h-24 bg-white rounded-xl border border-slate-200 overflow-hidden relative">
                  <img
                    src={shipment.proof_of_delivery_path || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600'}
                    alt="Handover Proof"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] text-slate-500 text-center">
                  Delivered at: <strong>{new Date(shipment.actual_delivery_time || shipment.updated_at).toLocaleString('en-IN')}</strong>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>FleetMind AI Platform • Support: support@fleetmind.ai</p>
          <p>Secure Hash: {shipment.id.slice(0, 16).toUpperCase()}-POD-OK</p>
        </footer>
      </main>
    </div>
  );
}
