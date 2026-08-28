'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, ArrowRight, Truck, Package, Route, Zap, TrendingDown,
  ShieldCheck, CheckCircle2, Bot, Layers, Cpu, MapPin, Clock,
  Building2, User, Phone, Mail, Lock, LogIn, Fuel, IndianRupee,
  BarChart3, Shield, Compass, ChevronRight, Activity, ArrowUpRight
} from 'lucide-react';
import { BrandLogo } from '../components/brand/brand-logo';
import { useAuth } from '../lib/auth/auth-context';

const STATS = [
  { value: '18.4%', label: 'Fuel Expense Saved', sub: 'vs unoptimized direct runs', color: 'text-blue-600' },
  { value: '98.2%', label: 'On-Time SLA Delivery', sub: 'Across high-density corridors', color: 'text-emerald-600' },
  { value: '82.5%', label: 'Average Payload Density', sub: 'Volumetric consolidation', color: 'text-indigo-600' },
  { value: '₹5.2L+', label: 'Quarterly Cost Savings', sub: 'Calculated tariff optimization', color: 'text-amber-600' },
];

const CORE_CAPABILITIES = [
  {
    icon: <Layers className="w-6 h-6 text-blue-600" />,
    title: 'Smart Load Consolidation',
    desc: 'Automatically merges compatible consignments into active transit corridors using 3D volume and axle-weight capacity algorithms.',
    badge: 'Volumetric Engine',
    bg: 'bg-blue-50/60 border-blue-100',
  },
  {
    icon: <Route className="w-6 h-6 text-emerald-600" />,
    title: 'Dynamic 2-Opt Routing',
    desc: 'Sequences multi-stop waypoints with live road constraints, minimizing deadhead kilometers and avoiding traffic bottlenecks.',
    badge: 'Deadhead Minimizer',
    bg: 'bg-emerald-50/60 border-emerald-100',
  },
  {
    icon: <Bot className="w-6 h-6 text-indigo-600" />,
    title: 'FleetMind AI Copilot',
    desc: 'Natural language consignment parsing, automated carrier recommendation, and transparent decision explanations powered by Groq.',
    badge: 'Neural Inference',
    bg: 'bg-indigo-50/60 border-indigo-100',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
    title: 'Cryptographic Delivery Proof',
    desc: 'Authorizes cargo handover with 6-digit receiver OTP verification, signature canvas pads, and instant digital POD generation.',
    badge: 'Zero Dispute',
    bg: 'bg-purple-50/60 border-purple-100',
  },
];

const PORTALS = [
  {
    role: 'Dispatcher Command Hub',
    desc: 'Live map telemetry, 1-click consolidation optimizer, AI copilot, and consignment intake pool.',
    href: '/dispatcher/dashboard',
    badge: 'Dispatcher Desk',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Cpu className="w-5 h-5 text-blue-600" />,
    features: ['Live Fleet Telemetry', 'Smart Allocation Engine', 'AI Copilot Assistant'],
  },
  {
    role: 'Fleet Manager Analytics',
    desc: 'Deep-dive fuel economy benchmarking, driver performance KPIs, cost variance, and executive reports.',
    href: '/manager/dashboard',
    badge: 'Management Desk',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: <BarChart3 className="w-5 h-5 text-amber-600" />,
    features: ['Fuel Consumption Trends', 'Corridor Profitability', 'Audit & Compliance Logs'],
  },
  {
    role: 'Driver Touch Portal (PWA)',
    desc: 'Mobile-first driver interface with turn navigation, stop checklists, road expense logging, and OTP handover.',
    href: '/driver/dashboard',
    badge: 'Mobile First',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: <Truck className="w-5 h-5 text-emerald-600" />,
    features: ['Turn Navigation Link', 'Digital OTP Verification', 'Road Expense Tracker'],
  },
  {
    role: 'Customer Shipper Portal',
    desc: 'Self-service consignment creation with AI natural language intake, real-time tracking, and POD download.',
    href: '/customer/dashboard',
    badge: 'Shipper Desk',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: <Building2 className="w-5 h-5 text-purple-600" />,
    features: ['AI Consignment Booking', 'Live Cargo Tracking', 'Instant Invoices & POD'],
  },
];

export default function LandingPage() {
  const { applyForDispatcherDesk } = useAuth();
  const [dispForm, setDispForm] = useState({
    fullName: '', email: '', phone: '', password: '',
    freightZone: 'South India Corridor (NH44 / NH45 / NH48)',
    fleetSize: '25 - 100 Lorries (Medium Fleet)', experienceYears: 4, notes: '',
  });
  const [dispSubmitted, setDispSubmitted] = useState(false);
  const [dispSubmitting, setDispSubmitting] = useState(false);
  const [dispError, setDispError] = useState<string | null>(null);

  const handleDispatcherApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispSubmitting(true);
    setDispError(null);
    try {
      await applyForDispatcherDesk({
        fullName: dispForm.fullName, email: dispForm.email, phone: dispForm.phone,
        password: dispForm.password || 'Password@123', freightZone: dispForm.freightZone,
        fleetSize: dispForm.fleetSize, experienceYears: Number(dispForm.experienceYears), notes: dispForm.notes,
      });
      setDispSubmitted(true);
    } catch (err: any) {
      setDispError(err.message || 'Failed to submit application.');
    } finally {
      setDispSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition">
        <BrandLogo variant="full" size="md" />

        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
          <a href="#capabilities" className="hover:text-blue-600 transition">Core Capabilities</a>
          <a href="#portals" className="hover:text-blue-600 transition">Platform Portals</a>
          <a href="#metrics" className="hover:text-blue-600 transition">ROI Economics</a>
          <a href="#dispatch-desk" className="hover:text-blue-600 transition">Dispatcher Desk</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition shadow-xs"
          >
            Sign In
          </Link>
          <Link
            href="/login?tab=register"
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 flex items-center gap-1.5"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Subtle Ambient Radial Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-blue-100/60 via-indigo-50/40 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Logo Showcase & Pill Badge */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white p-2.5 shadow-xl border border-slate-200/80 flex items-center justify-center hover:scale-105 transition-transform duration-300">
              <img
                src="/logo.png"
                alt="FleetMind AI"
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Autonomous Fleet Load & Route Intelligence
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight">
            Optimize Every Load.<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Every Route. Every Rupee.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Intelligent multi-stop load consolidation, dynamic 2-opt routing, real-time fuel efficiency equations, and cryptographic delivery verification.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Enter FleetMind Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/customer/create-shipment"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 text-sm font-bold rounded-2xl shadow-xs transition hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-blue-600" />
              <span>Book Consignment Load</span>
            </Link>
          </div>
        </div>

        {/* Live Operational Preview Card */}
        <div className="mt-14 max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Live Freight Optimization Matrix</h3>
                <p className="text-xs text-slate-500 font-medium">Active corridor simulation: Karur ➔ Chennai CFS</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> 88% Consolidated
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <TrendingDown className="w-3.5 h-3.5" /> Save ₹14,200/run
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 text-left">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">1. Consignment Intake</span>
              <strong className="text-xs font-bold text-slate-900 block">FM-260828-9857 (3,200 kg)</strong>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Extracted via AI NLP parser from plain text instructions. Ready for corridor matching.
              </p>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-blue-500 block tracking-wider">2. Selected Carrier</span>
              <strong className="text-xs font-bold text-slate-900 block">L-01 (Tata 1109 · TN-38-AF-1001)</strong>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                5.2 km/L efficiency @ ₹25/km. Added +18 km detour with zero SLA breach.
              </p>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-emerald-600 block tracking-wider">3. Verified Handover</span>
              <strong className="text-xs font-bold text-slate-900 block">Cryptographic 6-Digit OTP</strong>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Real-time email and SMS authorization to consignee dock with digital signature capture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KPI METRICS SECTION ===== */}
      <section id="metrics" className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map((s, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className={`text-3xl sm:text-4xl font-black ${s.color} block`}>
                  {s.value}
                </span>
                <strong className="text-xs font-bold text-slate-900 block">{s.label}</strong>
                <span className="text-[11px] text-slate-500 font-medium">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CORE CAPABILITIES (FOCUSED MAIN CONTENT) ===== */}
      <section id="capabilities" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Intelligent Logistics Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Engineered for Real-World Freight Operations
          </h2>
          <p className="text-sm text-slate-600">
            Every module is designed to eliminate empty kilometers, reduce diesel spend, and automate dispatch decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CORE_CAPABILITIES.map((cap, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl border transition hover:shadow-lg ${cap.bg} space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center border border-slate-100">
                  {cap.icon}
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200 shadow-xs">
                  {cap.badge}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 mb-1">{cap.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {cap.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ROLE-BASED PORTALS ===== */}
      <section id="portals" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Role-Tailored Workspaces
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              One Unified Platform. Four Specialized Desks.
            </h2>
            <p className="text-sm text-slate-600">
              Tailored interfaces designed specifically for dispatchers, fleet managers, mobile drivers, and enterprise shippers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PORTALS.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-3xl border border-slate-200/80 p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-xs flex items-center justify-center border border-slate-100">
                      {p.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeClass}`}>
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">{p.role}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                      {p.desc}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs text-slate-700 font-medium">
                    {p.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={p.href}
                  className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1 mt-2"
                >
                  <span>Open Desk</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DISPATCHER DESK FAST APPLICATION / CONTACT ===== */}
      <section id="dispatch-desk" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Request Dispatcher Desk Access
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
              Join the FleetMind operational network. Dispatchers receive verified credentials with live optimization tools.
            </p>
          </div>

          {dispSubmitted ? (
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto" />
              <h3 className="text-base font-black text-white">Application Received ✓</h3>
              <p className="text-xs text-blue-100">
                Our operations administrator will review your credentials and activate your dispatch terminal.
              </p>
            </div>
          ) : (
            <form onSubmit={handleDispatcherApplication} className="space-y-4 max-w-lg mx-auto text-xs">
              {dispError && (
                <div className="p-3 bg-rose-500/20 border border-rose-400 text-white rounded-xl text-xs">
                  {dispError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-blue-100 uppercase mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={dispForm.fullName}
                    onChange={(e) => setDispForm({ ...dispForm, fullName: e.target.value })}
                    placeholder="e.g. Senthil Nathan"
                    className="w-full p-2.5 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-100 uppercase mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={dispForm.email}
                    onChange={(e) => setDispForm({ ...dispForm, email: e.target.value })}
                    placeholder="dispatcher@logistics.in"
                    className="w-full p-2.5 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-blue-100 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={dispForm.phone}
                    onChange={(e) => setDispForm({ ...dispForm, phone: e.target.value })}
                    placeholder="+91 98410 00000"
                    className="w-full p-2.5 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-100 uppercase mb-1">Operating Corridor *</label>
                  <input
                    type="text"
                    required
                    value={dispForm.freightZone}
                    onChange={(e) => setDispForm({ ...dispForm, freightZone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-100 uppercase mb-1">Account Password *</label>
                <input
                  type="password"
                  required
                  value={dispForm.password}
                  onChange={(e) => setDispForm({ ...dispForm, password: e.target.value })}
                  placeholder="Set your secure dispatcher password"
                  className="w-full p-2.5 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={dispSubmitting}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {dispSubmitting ? 'Submitting Application...' : 'SUBMIT APPLICATION FOR DISPATCHER APPROVAL'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ===== CLEAN LIGHT FOOTER ===== */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo variant="full" size="sm" />
          
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/login" className="hover:text-blue-600 transition">Sign In</Link>
            <Link href="/dispatcher/dashboard" className="hover:text-blue-600 transition">Dispatcher</Link>
            <Link href="/manager/dashboard" className="hover:text-blue-600 transition">Manager</Link>
            <Link href="/driver/dashboard" className="hover:text-blue-600 transition">Driver</Link>
            <Link href="/customer/dashboard" className="hover:text-blue-600 transition">Customer</Link>
          </div>

          <p className="text-slate-400">
            © {new Date().getFullYear()} FleetMind AI. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
