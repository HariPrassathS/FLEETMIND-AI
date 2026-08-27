'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/auth-context';
import { fleetMindStore } from '../../../lib/db/store';
import {
  HeadphonesIcon,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  PhoneCall,
  Mail,
} from 'lucide-react';

export default function CustomerSupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [issueType, setIssueType] = useState('DELAY_INQUIRY');
  const [shipmentId, setShipmentId] = useState('SHP-1042');
  const [priority, setPriority] = useState('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    const load = () => {
      const email = user?.email || 'customer@fleetmind.ai';
      setTickets(fleetMindStore.getSupportTicketsByCustomer(email));
    };

    load();
    const unsub = fleetMindStore.subscribe(() => {
      load();
    });
    return unsub;
  }, [user]);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    fleetMindStore.createSupportTicket({
      customer_id: user?.id || 'cust-abc-electronics',
      customer_name: user?.full_name || 'Rajesh Kumar',
      customer_email: user?.email || 'customer@fleetmind.ai',
      shipment_id: shipmentId,
      issue_type: issueType,
      subject,
      message,
      priority,
    });

    setSubmittedSuccess(true);
    setSubject('');
    setMessage('');
    setIsSubmitting(false);

    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Customer Support Desk</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Report delivery delays, damaged cargo, gate pass verification, or operational inquiries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Open Support Ticket Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Lodge Support Inquiry</h2>
              <p className="text-[11px] text-slate-500 font-medium">Linked automatically to your shipment record</p>
            </div>
          </div>

          {submittedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Support ticket logged successfully! A Fleet Operations Manager will respond shortly.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Issue Category</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                >
                  <option value="DELAY_INQUIRY">Delivery Delay / ETA Inquiry</option>
                  <option value="DAMAGED_CARGO">Damaged Cargo Claim</option>
                  <option value="WRONG_DESTINATION">Address / CFS Correction</option>
                  <option value="BILLING_INQUIRY">Billing & Tariff Rate Query</option>
                  <option value="GENERAL_SUPPORT">General Operations Query</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Related Consignment ID</label>
                <input
                  type="text"
                  required
                  value={shipmentId}
                  onChange={(e) => setShipmentId(e.target.value)}
                  placeholder="e.g. S-1042"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Gate pass window request for Hosur plant delivery"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Explanation *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide complete consignment specifics, dock numbers, or time sensitivity..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting Ticket...' : 'Submit Support Inquiry'}
            </button>
          </form>
        </div>

        {/* Right: Active Ticket Feed & Hotline */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">My Support Tickets</h3>

            <div className="space-y-3">
              {tickets.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No previous support tickets logged.</p>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{t.subject}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{t.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-200/60">
                      <span>Shipment: {t.shipment_id || 'General'}</span>
                      <span>{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Hotline Box */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-6 space-y-3 shadow-card">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
              <PhoneCall className="w-4 h-4 text-blue-400" />
              <span>Operations Dispatch Hotline</span>
            </div>
            <p className="text-xl font-black">+91 1800-419-MIND</p>
            <p className="text-xs text-slate-300 font-medium">
              24/7 dedicated freight support for active transit consignments across NH44, NH45, and NH48 corridors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
