'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles, ArrowRight, Truck, Package, Route, Zap, TrendingDown,
  ShieldCheck, CheckCircle2, Radio, Sliders, Flame, Bot, Activity,
  Award, Layers, ChevronRight, Cpu, MapPin, Clock, Compass,
  RotateCcw, AlertTriangle, Building2, User, Phone, Mail, Lock, LogIn,
  Fuel, IndianRupee, Globe, Star, BarChart3, Shield,
} from 'lucide-react';
import { BrandLogo } from '../components/brand/brand-logo';
import { useAuth } from '../lib/auth/auth-context';

const TICKER_ITEMS = [
  { color: 'text-emerald-400', prefix: '⚡ CONSIGNMENT S-1042:', text: '3.2T Automotive Casings consolidated → L-11 (Tata 1109)', badge: '₹14,200 Saved', badgeColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80' },
  { color: 'text-blue-400', prefix: '● LIVE GPS:', text: 'Carrier L-11 · Murugan Selvam · 42 km/h on NH48', badge: '', badgeColor: '' },
  { color: 'text-purple-400', prefix: '⚡ OPTIMIZATION:', text: 'Karur→Chennai CFS achieved 88% Load Density', badge: '5,388L Diesel Saved', badgeColor: 'text-purple-400 bg-purple-950/80 border-purple-800/80' },
  { color: 'text-teal-400', prefix: '✓ PROOF OF DELIVERY:', text: 'S-1039 verified via 6-digit OTP at Hosur CFS', badge: '', badgeColor: '' },
  { color: 'text-amber-400', prefix: '⚡ REROUTE:', text: 'L-07 re-optimized around NH45 congestion', badge: '-22 mins ETA', badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-800/80' },
];

const STATS = [
  { value: '18.4%', label: 'Fuel Expense Saved', color: 'text-blue-400', glow: 'shadow-blue-500/20' },
  { value: '98.2%', label: 'On-Time SLA Rate', color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  { value: '82.5%', label: 'Avg Payload Density', color: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
  { value: '₹5.2L', label: 'Quarterly Net Savings', color: 'text-amber-400', glow: 'shadow-amber-500/20' },
];

const HOW_STEPS = [
  { title: 'Shipment', desc: 'Demand Input', icon: Package },
  { title: 'AI Parse', desc: 'NLP Extraction', icon: Sparkles },
  { title: 'Constraints', desc: 'Weight & Volume', icon: ShieldCheck },
  { title: 'Grouping', desc: 'Consolidation', icon: Layers },
  { title: 'Assignment', desc: 'Eco Vehicle Match', icon: Truck },
  { title: 'Routing', desc: '2-Opt Waypoints', icon: Route },
  { title: 'Re-Optimize', desc: 'Self-Healing', icon: RotateCcw },
];

const PORTALS = [
  { role: 'Dispatcher', badge: 'bg-blue-500/20 border-blue-500/30 text-blue-300', desc: 'Live map, 15-step optimizer, AI copilot, NLP shipment parser', icon: <Cpu className="w-5 h-5" />, color: 'blue' },
  { role: 'Manager', badge: 'bg-amber-500/20 border-amber-500/30 text-amber-300', desc: 'Fleet analytics, fuel benchmarking, cost trends & ROI dashboards', icon: <BarChart3 className="w-5 h-5" />, color: 'amber' },
  { role: 'Driver PWA', badge: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300', desc: 'Mobile-first, offline-capable, proof of delivery & sync queue', icon: <Truck className="w-5 h-5" />, color: 'emerald' },
  { role: 'Admin', badge: 'bg-purple-500/20 border-purple-500/30 text-purple-300', desc: 'User management, tariff settings, audit logs & health monitor', icon: <Shield className="w-5 h-5" />, color: 'purple' },
];

const AI_FEATURES = [
  { title: 'AI Copilot', desc: 'Dispatcher assistant with safe tools: getAtRiskShipments, getLorries, simulateScenario, getCostMetrics.', icon: <Bot className="w-5 h-5" />, color: 'violet' },
  { title: 'NLP Order Entry', desc: '"Send 2 tonnes from Karur to Chennai before 5 PM tomorrow" → verified structured data instantly.', icon: <Sparkles className="w-5 h-5" />, color: 'blue' },
  { title: 'Explainable AI', desc: 'Mathematical proof explaining why high-efficiency vehicles beat nearest-distance logic.', icon: <CheckCircle2 className="w-5 h-5" />, color: 'emerald' },
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
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 selection:text-blue-100">

      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-white">FleetMind<span className="text-blue-400"> AI</span></span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-[12px] font-semibold text-white/50">
          {[['#how-it-works', 'How It Works'], ['#ai-capabilities', 'AI Intelligence'], ['#optimization', 'Optimization'], ['#roles', 'Portals'], ['#analytics', 'Analytics']].map(([href, label]) => (
            <a key={href} href={href} className="hover:text-white transition">{label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-xs font-bold text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-xl bg-white/5 hover:bg-white/10 transition">
            Sign In
          </Link>
          <Link href="/login?tab=register" className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5">
            Get Started →
          </Link>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-blue-600/15 via-indigo-600/8 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-32 left-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-32 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous Fleet Load & Route Decision Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none">
            <span className="text-white">FleetMind </span>
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">AI</span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent mt-4">
              "Optimize Every Load. Every Route. Every Rupee."
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-2xl mx-auto">
            AI-powered fleet decision intelligence for smarter multi-stop load consolidation, dynamic 2-opt route optimization, fuel price equations, and real-time logistics operations.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/login?tab=register"
              className="px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Create Customer Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="px-7 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 text-sm font-bold rounded-2xl hover:-translate-y-0.5 transition flex items-center gap-2">
              <LogIn className="w-4 h-4 text-white/50" /> Sign In to Command Center
            </Link>
          </div>

          {/* Hero widget */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 space-y-6 text-left hover:bg-white/8 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">Southern Freight Corridor Live Telemetry</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> 24 Lorries Active
                      </span>
                    </div>
                    <p className="text-xs text-white/40">Autonomous corridor grouping across NH45, NH81, NH48 & NH544</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-right">
                    <span className="text-[9px] text-emerald-400 font-black uppercase block">Direct Savings</span>
                    <strong className="text-emerald-300 text-sm font-black">₹5,20,000</strong>
                  </div>
                  <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-right">
                    <span className="text-[9px] text-blue-400 font-black uppercase block">Fuel Saved</span>
                    <strong className="text-blue-300 text-sm font-black">5,388 Liters</strong>
                  </div>
                </div>
              </div>

              {/* Corridor bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {[
                  { route: 'Karur → Chennai CFS', pct: 84, color: 'bg-blue-500', textColor: 'text-blue-400', count: '32 Consignments · 3 Vehicles' },
                  { route: 'Bengaluru → Chennai Hub', pct: 88, color: 'bg-emerald-500', textColor: 'text-emerald-400', count: '28 Consignments · 2 Vehicles' },
                  { route: 'Coimbatore → Bengaluru', pct: 79, color: 'bg-indigo-500', textColor: 'text-indigo-400', count: '24 Consignments · 2 Vehicles' },
                ].map((c) => (
                  <div key={c.route} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/8 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{c.route}</span>
                      <span className={`text-[10px] font-black ${c.textColor}`}>{c.pct}% Load</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className={`${c.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${c.pct}%` }} />
                    </div>
                    <span className="text-[10px] text-white/40 font-medium">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-white/30">
            {['Pure TypeScript Engine', 'FleetMind AI Groq Inference', 'Offline Driver PWA', '18.4% Avg Fuel Savings'].map((b) => (
              <span key={b} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500/70" />{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIVE TICKER ===== */}
      <section className="py-3 bg-slate-900/80 border-y border-white/5 overflow-hidden select-none">
        <div className="flex items-center">
          <div className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-r-lg z-10 shrink-0 flex items-center gap-1.5 shadow-lg shadow-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> LIVE
          </div>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee flex items-center gap-10 text-xs font-medium text-white/50">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <div key={i} className="flex items-center gap-2 shrink-0">
                  <span className={`${item.color} font-black`}>{item.prefix}</span>
                  <span>{item.text}</span>
                  {item.badge && <span className={`${item.badgeColor} font-bold px-2 py-0.5 rounded border text-[10px]`}>{item.badge}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="py-14 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center hover:bg-white/8 hover:-translate-y-0.5 transition">
              <p className={`text-3xl sm:text-4xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROBLEM SECTION ===== */}
      <section className="py-16 px-4 sm:px-8 border-y border-white/5 bg-slate-900/40">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-black text-rose-400 uppercase tracking-widest">The Problem</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">Traditional Fleet Management is Broken & Wasteful</h2>
            <p className="text-sm text-white/40 mt-2">Dispatchers rely on manual intuition, spreadsheets, and basic GPS trackers that lack decision intelligence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <TrendingDown className="w-5 h-5" />, title: 'Empty Deadhead & Fragmented Loads', desc: 'Vehicles return half-empty or travel hundreds of unbillable positioning kilometers without smart corridor consolidation.', color: 'rose' },
              { icon: <Flame className="w-5 h-5" />, title: 'Rising Diesel Costs & Blind Vehicle Choice', desc: 'Dispatchers naively assign the nearest vehicle without computing fuel economy differences (e.g. 5 km/L vs 10.4 km/L).', color: 'amber' },
              { icon: <Clock className="w-5 h-5" />, title: 'Unforgiving SLA Penalties & Delays', desc: 'When a breakdown happens mid-route, dispatchers take hours to recalculate alternatives, causing costly delivery breaches.', color: 'slate' },
            ].map((p) => {
              const colors: Record<string, string> = { rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400', amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400', slate: 'bg-white/5 border-white/10 text-white/50' };
              return (
                <div key={p.title} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 hover:bg-white/8 transition">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${colors[p.color]}`}>{p.icon}</div>
                  <h3 className="text-sm font-black text-white">{p.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== SOLUTION SECTION ===== */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-black text-blue-400 uppercase tracking-widest">The Solution</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">Logistics Decision Intelligence: Not Just Tracking</h2>
          <p className="text-sm text-white/40 mt-2">FleetMind connects the complete loop from natural language demand to mathematical route optimization and real-time execution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            {[
              { num: 1, title: 'AI Natural Language Understanding', desc: 'Parse unstructured cargo orders into verified constraints in seconds.', color: 'bg-blue-500/20 border-blue-500/30 text-blue-400' },
              { num: 2, title: '15-Step Heuristic Optimization Engine', desc: 'Constraint validation, multi-stop grouping, 2-opt TSP & fuel cost math.', color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' },
              { num: 3, title: 'Explainable AI ("WHY" Engine)', desc: 'Transparent mathematical proofs for why specific vehicles were selected.', color: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' },
              { num: 4, title: 'Self-Healing Disruption Engine', desc: 'Instant recovery when breakdowns or traffic jams occur with 1-click re-dispatch.', color: 'bg-amber-500/20 border-amber-500/30 text-amber-400' },
            ].map((step) => (
              <div key={step.num} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4 hover:bg-white/8 transition">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border text-sm font-black shrink-0 ${step.color}`}>{step.num}</div>
                <div>
                  <h4 className="text-sm font-black text-white">{step.title}</h4>
                  <p className="text-xs text-white/40 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black text-emerald-400">Live Optimization Loop</span>
              <span className="text-[10px] font-mono text-white/30">Pure TypeScript</span>
            </div>
            <div className="space-y-2.5 text-xs font-mono">
              <p className="text-blue-400">→ Input: 84 Pending Consignments (South India Corridor)</p>
              <p className="text-white/50">✓ Clustering: 18 Consolidated Multi-Stop Loads</p>
              <p className="text-white/50">✓ Evaluation: Multi-Objective Vehicle Scoring</p>
              <p className="text-white/50">✓ 2-Opt Routing: Waypoint Sequence Improved (-34.2 km)</p>
              <p className="text-emerald-400 font-bold">✓ Result: ₹14,200 Fuel Saved · 0 SLA Breaches</p>
            </div>
            <Link href="/login" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
              <LogIn className="w-3.5 h-3.5" /> Sign In to Run Live Optimizer
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-16 px-4 sm:px-8 border-y border-white/5 bg-slate-900/40">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-black text-blue-400 uppercase tracking-widest">The Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">The Core Decision Loop</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            {HOW_STEPS.map((step, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 hover:-translate-y-0.5 transition">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                  <step.icon className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-[11px] font-black text-white">{step.title}</h4>
                <p className="text-[10px] text-white/40">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI CAPABILITIES ===== */}
      <section id="ai-capabilities" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-black text-violet-400 uppercase tracking-widest">FleetMind AI Intelligence</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">Enterprise AI Built for Real Logistics</h2>
          <p className="text-sm text-white/40 mt-2">No hallucinations. Safe tool-calling architecture strictly querying authoritative backend data.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {AI_FEATURES.map((f) => {
            const fColors: Record<string, string> = { violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400', blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400', emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' };
            return (
              <div key={f.title} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 hover:bg-white/8 hover:-translate-y-0.5 transition">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${fColors[f.color]}`}>{f.icon}</div>
                <h3 className="text-sm font-black text-white">{f.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== LOAD OPTIMIZATION ===== */}
      <section id="optimization" className="py-16 px-4 sm:px-8 border-y border-white/5 bg-slate-900/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Multi-Stop Consolidation</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Smart Load Grouping Along High-Density Corridors</h2>
            <p className="text-sm text-white/40 leading-relaxed">Rather than sending three 2-ton lorries separately on the Karur-Chennai highway, FleetMind aggregates shipments S-101, S-102, and S-104 into a single 10.5-ton vehicle, saving 2 full trucks and ₹14,200 in operating costs.</p>
            <Link href="/login" className="inline-flex items-center gap-2 text-xs font-black text-blue-400 hover:text-blue-300 transition">
              Sign In to Access Optimizer <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Consolidation Group G-07:</p>
            {[
              { code: 'S-101 (2.2T Cotton Bedding)', route: 'Karur → Chennai CFS', badge: 'CRITICAL SLA', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
              { code: 'S-102 (1.9T Jacquard Curtains)', route: 'Karur → Chennai Port', badge: 'HIGH SLA', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
              { code: 'S-104 (2.4T Yarn Rolls)', route: 'Karur → Madhavaram CFS', badge: 'MEDIUM SLA', badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
            ].map((s) => (
              <div key={s.code} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs hover:bg-white/8 transition">
                <div>
                  <p className="font-black text-white">{s.code}</p>
                  <p className="text-white/40">{s.route}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${s.badgeColor}`}>{s.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 2-OPT ROUTING ===== */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="bg-slate-900 rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-black text-blue-400">2-Opt Heuristic Routing</span>
            <span className="text-[10px] font-mono text-white/30">Haversine × 1.28 Road Factor</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <p className="text-white/50">Initial Sequence: P1 → P2 → D1 → D2 (342 km)</p>
            <p className="text-emerald-400">Optimized 2-Opt: P1 → P2 → D2 → D1 (308 km)</p>
            <p className="text-amber-300 font-bold">Saved: 34 km (-9.9% diesel reduction)</p>
          </div>
        </div>
        <div className="space-y-4">
          <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Dynamic Routing</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">2-Opt Heuristics That Respect Pickup Precedence</h2>
          <p className="text-sm text-white/40 leading-relaxed">Standard TSP algorithms fail in logistics because you cannot deliver before picking up. FleetMind enforces strict pickup precedence while iteratively reordering delivery waypoints to minimize distance and fuel burn.</p>
        </div>
      </section>

      {/* ===== PORTAL ROLES ===== */}
      <section id="roles" className="py-16 px-4 sm:px-8 border-y border-white/5 bg-slate-900/40">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Tailored Portals</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">4 Dedicated Role-Based Experiences</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PORTALS.map((p) => {
              const borderMap: Record<string, string> = { blue: 'hover:border-blue-500/30', amber: 'hover:border-amber-500/30', emerald: 'hover:border-emerald-500/30', purple: 'hover:border-purple-500/30' };
              return (
                <div key={p.role} className={`p-6 rounded-3xl bg-white/5 border border-white/10 ${borderMap[p.color]} space-y-3 hover:bg-white/8 hover:-translate-y-0.5 transition`}>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-black ${p.badge}`}>{p.role}</span>
                  <p className="text-xs text-white/40 leading-relaxed">{p.desc}</p>
                  <Link href="/login" className="text-xs font-black text-white/40 hover:text-white inline-flex items-center gap-1 transition pt-2">
                    Sign In <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== ANALYTICS SECTION ===== */}
      <section id="analytics" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Business Impact</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">Real Financial & Operational Metrics</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:-translate-y-0.5 transition">
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs font-bold text-white/40 mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="py-14 px-4 sm:px-8 border-y border-white/5 bg-slate-900/40">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <p className="text-xs font-black text-white/30 uppercase tracking-widest">Modern Tech Stack</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Production-Grade Web & AI Infrastructure</h2>
          <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
            {['Next.js 14 (App Router)', 'Strict TypeScript', 'Tailwind CSS', 'Firebase Auth', 'Supabase PostgreSQL', 'Groq AI (qwen3)', 'Mapbox GL JS', 'Recharts Analytics', 'Installable PWA'].map((t) => (
              <span key={t} className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/40 hover:border-white/20 hover:text-white/60 transition">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Answers & Insights</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-white/40">Everything you need to know about FleetMind AI optimization, routing, and enterprise telemetry.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q: 'How does FleetMind AI differ from standard GPS trackers?', a: 'Legacy trackers answer "Where is the truck?" FleetMind answers "What is the most profitable load to assign, which carrier has the best mileage, and what sequence avoids deadheading?"', color: 'text-blue-400 bg-blue-500/10' },
            { q: 'What happens during highway breakdown disruptions?', a: 'Our Self-Healing Disruption Engine detects breakdown telemetry, identifies available carriers, and generates a 1-click rescue plan with cross-docking waypoint recalculation.', color: 'text-emerald-400 bg-emerald-500/10' },
            { q: 'Does the Driver Cockpit work without internet?', a: 'Yes. Built as an Offline-First PWA with Service Workers and IndexedDB — drivers record deliveries, capture signatures, and sync when cell reception resumes.', color: 'text-purple-400 bg-purple-500/10' },
            { q: 'How does 2-Opt TSP optimization save diesel?', a: 'By uncrossing inefficient route loops and factoring vehicle fuel efficiencies (5 km/L vs 10.4 km/L), FleetMind delivers an average 18.4% reduction in diesel consumption.', color: 'text-amber-400 bg-amber-500/10' },
          ].map((faq, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/8 transition">
              <h3 className="text-sm font-black text-white flex items-start gap-2">
                <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${faq.color}`}>{i + 1}</span>
                {faq.q}
              </h3>
              <p className="text-xs text-white/40 leading-relaxed pl-8">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== DISPATCHER APPLICATION ===== */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-blue-950/50 to-indigo-950/50 rounded-3xl border border-white/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 sm:p-12">
          {/* Info */}
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold w-fit">
              <Sparkles className="w-3.5 h-3.5" /> Operator Onboarding
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">Apply for Dispatcher Command Desk</h2>
            <p className="text-sm text-white/40 leading-relaxed">Join the FleetMind freight network as an authorized Fleet Dispatcher. Consolidate LTL consignments, optimize multi-depot routes with AI heuristics.</p>
            <div className="space-y-2.5 text-xs text-white/60">
              {['15-Step Deterministic Route & Lorry Optimization Engine', 'Self-Healing Disruption Re-Optimizer on Breakdown Alert', 'Admin-Verified Command Credentials for Operational Security'].map((f) => (
                <div key={f} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />{f}</div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
            {dispSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-black text-white">Application Submitted!</h3>
                <p className="text-xs text-white/40 max-w-md mx-auto leading-relaxed">Your Dispatcher desk registration has been forwarded to the FleetMind System Administrator. Once approved, your command portal will unlock automatically.</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/30 transition">
                  Open Sign In Portal
                </Link>
              </div>
            ) : (
              <form onSubmit={handleDispatcherApplication} className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Dispatcher Registration</h3>

                {dispError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />{dispError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Full Name *', icon: <User className="w-4 h-4" />, type: 'text', value: dispForm.fullName, onChange: (v: string) => setDispForm({ ...dispForm, fullName: v }), placeholder: 'e.g. Senthil Nathan', required: true },
                    { label: 'Work Email *', icon: <Mail className="w-4 h-4" />, type: 'email', value: dispForm.email, onChange: (v: string) => setDispForm({ ...dispForm, email: v }), placeholder: 'dispatcher@freight.in', required: true },
                    { label: 'Contact Phone *', icon: <Phone className="w-4 h-4" />, type: 'tel', value: dispForm.phone, onChange: (v: string) => setDispForm({ ...dispForm, phone: v }), placeholder: '+91 98402 11223', required: true },
                    { label: 'Account Password *', icon: <Lock className="w-4 h-4" />, type: 'password', value: dispForm.password, onChange: (v: string) => setDispForm({ ...dispForm, password: v }), placeholder: '••••••••', required: true },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">{field.label}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-white/30">{field.icon}</span>
                        <input type={field.type} required={field.required} value={field.value}
                          onChange={(e) => field.onChange(e.target.value)} placeholder={field.placeholder}
                          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">Fleet License / GSTIN</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-white/30 absolute left-3 top-3" />
                    <input type="text" value={dispForm.notes} onChange={(e) => setDispForm({ ...dispForm, notes: e.target.value })}
                      placeholder="e.g. 33AABCU9603R1ZM / TN-FL-408"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300/80 leading-relaxed">
                  🛡️ <strong className="text-blue-300">Admin Verification Policy:</strong> Your account will be reviewed by the System Administrator. Once approved, your Command Desk will unlock automatically.
                </div>

                <button type="submit" disabled={dispSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-0.5">
                  <Sparkles className="w-4 h-4" />
                  {dispSubmitting ? 'Creating Dispatcher Account…' : 'Create Account & Submit for Verification'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-10 px-4 sm:px-8 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Truck className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-white/60">FleetMind<span className="text-blue-400"> AI</span></span>
            <span className="text-white/20">·</span>
            <span>Optimize Every Load. Every Route. Every Rupee.</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-white font-semibold transition">Sign In</Link>
            <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> All Systems Operational
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
