'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Truck,
  Package,
  Route,
  Zap,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Radio,
  Sliders,
  Flame,
  Bot,
  Activity,
  Award,
  Layers,
  ChevronRight,
  Cpu,
  MapPin,
  Clock,
  Compass,
  RotateCcw,
  AlertTriangle,
  Building2,
  User,
  Phone,
  Mail,
  Lock,
  LogIn,
} from 'lucide-react';

import { BrandLogo } from '../components/brand/brand-logo';
import { useAuth } from '../lib/auth/auth-context';

export default function LandingPage() {
  const { applyForDispatcherDesk } = useAuth();

  // Dispatcher Application Card state
  const [dispForm, setDispForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    freightZone: 'South India Corridor (NH44 / NH45 / NH48)',
    fleetSize: '25 - 100 Lorries (Medium Fleet)',
    experienceYears: 4,
    notes: '',
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
        fullName: dispForm.fullName,
        email: dispForm.email,
        phone: dispForm.phone,
        password: dispForm.password || 'Password@123',
        freightZone: dispForm.freightZone,
        fleetSize: dispForm.fleetSize,
        experienceYears: Number(dispForm.experienceYears),
        notes: dispForm.notes,
      });
      setDispSubmitted(true);
    } catch (err: any) {
      setDispError(err.message || 'Failed to submit dispatcher application.');
    } finally {
      setDispSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* SECTION 1: NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-subtle">
        <BrandLogo
          variant="full"
          size="md"
          subtitle="Logistics Decision Intelligence"
        />

        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <a href="#how-it-works" className="hover:text-blue-600 transition tracking-tight">How It Works</a>
          <a href="#ai-capabilities" className="hover:text-blue-600 transition tracking-tight">AI Intelligence</a>
          <a href="#optimization" className="hover:text-blue-600 transition tracking-tight">Load Optimization</a>
          <a href="#disruption" className="hover:text-blue-600 transition tracking-tight">Disruptions</a>
          <a href="#roles" className="hover:text-blue-600 transition tracking-tight">Portals</a>
          <a href="#analytics" className="hover:text-blue-600 transition tracking-tight">Analytics</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-card hover:shadow-card-hover transition flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      {/* SECTION 2: HERO */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Background glow mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="text-center max-w-4xl mx-auto space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-bold shadow-subtle animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Autonomous Fleet Load & Route Decision Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] font-sans">
            <span style={{ color: '#0B1F44' }}>FleetMind </span>
            <span className="bg-gradient-to-r from-[#1677FF] to-[#2563EB] bg-clip-text text-transparent">AI</span>
            <span className="block text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent mt-3 font-heading">
              "Optimize Every Load. Every Route. Every Rupee."
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            AI-powered fleet decision intelligence for smarter multi-stop load consolidation, dynamic 2-opt route optimization, fuel price equations, and real-time logistics operations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/login?tab=register"
              className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Customer Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-sm font-bold rounded-xl shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              <span>Sign In to Command Center</span>
            </Link>
          </div>

          {/* Hero Corridor Live Preview Widget */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-left relative overflow-hidden glass-card-hover">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-heading">Southern Freight Corridor Live Telemetry</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        24 Lorries Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Autonomous corridor grouping across NH45, NH81, NH48 & NH544</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-right">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">Direct Savings</span>
                    <strong className="text-emerald-700 text-sm font-black font-display">₹5,20,000</strong>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 text-right">
                    <span className="text-[10px] text-blue-800 font-bold uppercase block">Fuel Saved</span>
                    <strong className="text-blue-700 text-sm font-black font-display">5,388 Liters</strong>
                  </div>
                </div>
              </div>

              {/* Highway Corridor Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-slate-100/60 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Karur → Chennai CFS</span>
                    <span className="text-[10px] font-bold text-blue-600">84% Load Density</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[84%] rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">32 Consignments • 3 Vehicles Dispatched</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-slate-100/60 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Bengaluru → Chennai Hub</span>
                    <span className="text-[10px] font-bold text-emerald-600">88% Load Density</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-[88%] rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">28 Consignments • 2 Vehicles Dispatched</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-slate-100/60 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Coimbatore → Bengaluru</span>
                    <span className="text-[10px] font-bold text-indigo-600">79% Load Density</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full w-[79%] rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">24 Consignments • 2 Vehicles Dispatched</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pure TypeScript Optimization Engine</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> FleetMind AI Inference</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Offline Driver PWA</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 18.4% Average Fuel Savings</span>
          </div>
        </div>
      </section>

      {/* CONTINUOUS LIVE TRANSACTIONS & DISPATCH TICKER */}
      <section className="py-3 bg-slate-900 text-white overflow-hidden border-y border-slate-800 relative select-none">
        <div className="flex items-center">
          <div className="px-4 py-1 bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider rounded-r-lg z-10 shrink-0 flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE DISPATCHES
          </div>

          <div className="overflow-hidden flex-1 relative">
            <div className="animate-marquee flex items-center gap-8 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-emerald-400 font-black">⚡ CONSIGNMENT S-1042:</span>
                <span>3.2T Automotive Transmission Casings consolidated to <strong>L-11 (Tata 1109)</strong></span>
                <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">₹14,200 Saved</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-blue-400 font-black">● LIVE GPS TELEMETRY:</span>
                <span>Carrier <strong>L-11</strong> with pilot <em>Murugan Selvam</em> active at <strong>42 km/h</strong> on NH48 Corridor</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-purple-400 font-black">⚡ CORRIDOR OPTIMIZATION:</span>
                <span>Karur ➔ Chennai CFS Grouping achieved <strong>88% Load Density</strong></span>
                <span className="text-purple-400 font-bold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/80">5,388L Diesel Saved</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-teal-400 font-black">✓ PROOF OF DELIVERY:</span>
                <span>Consignment <strong>S-1039</strong> verified via 6-digit OTP & digital signature at Hosur CFS</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-amber-400 font-black">⚡ REAL-TIME REROUTE:</span>
                <span>Carrier <strong>L-07</strong> dynamically re-optimized around NH45 congestion (<strong>-22 mins ETA</strong>)</span>
              </div>

              {/* Duplicate repeat for seamless continuous infinite marquee */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-emerald-400 font-black">⚡ CONSIGNMENT S-1042:</span>
                <span>3.2T Automotive Transmission Casings consolidated to <strong>L-11 (Tata 1109)</strong></span>
                <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">₹14,200 Saved</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-blue-400 font-black">● LIVE GPS TELEMETRY:</span>
                <span>Carrier <strong>L-11</strong> with pilot <em>Murugan Selvam</em> active at <strong>42 km/h</strong> on NH48 Corridor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PROBLEM */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">The Problem</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Traditional Fleet Management is Broken & Wasteful
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Dispatchers rely on manual intuition, spreadsheets, and basic GPS trackers that lack decision intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-rose-100 bg-rose-50/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Empty Deadhead & Fragmented Loads</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vehicles return half-empty or travel hundreds of unbillable positioning kilometers without smart corridor consolidation.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-amber-100 bg-amber-50/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Rising Diesel Costs & Blind Vehicle Choice</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dispatchers naively assign the nearest vehicle without computing vehicle fuel economy differences (e.g. 5 km/L vs 10.4 km/L).
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Unforgiving SLA Penalties & Delays</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When a breakdown happens mid-route, dispatchers take hours to recalculate alternatives, causing costly delivery breaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SOLUTION */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">The Solution</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Logistics Decision Intelligence: Not Just Tracking
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            FleetMind connects the complete loop from natural language demand to mathematical route optimization and real-time execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">AI Natural Language Understanding</h4>
                <p className="text-xs text-slate-500 mt-0.5">Parse unstructured cargo orders into verified constraints in seconds with FleetMind AI.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">15-Step Heuristic Optimization Engine</h4>
                <p className="text-xs text-slate-500 mt-0.5">Constraint validation, multi-stop grouping, 2-opt TSP improvement, and dynamic fuel cost math.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Explainable AI ("WHY" Engine)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Transparent mathematical proofs for why specific vehicles and sequences were selected.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">4</div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Self-Healing Disruption Engine</h4>
                <p className="text-xs text-slate-500 mt-0.5">Instant recovery plans when breakdowns or traffic jams occur with 1-click re-dispatch.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl border border-slate-800 space-y-4 glass-card-hover">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400">Live Optimization Loop</span>
              <span className="text-[10px] text-slate-400">Pure TypeScript</span>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <div className="text-blue-400">→ Input: 84 Pending Consignments (Corridor South India)</div>
              <div className="text-slate-300">✓ Grouping: Clustered into 18 Consolidated Multi-Stop Loads</div>
              <div className="text-slate-300">✓ Evaluation: Multi-Objective Vehicle Scoring (Fuel vs Distance)</div>
              <div className="text-slate-300">✓ 2-Opt Routing: Waypoint Sequence Improved (-34.2 km)</div>
              <div className="text-emerald-400 font-bold">✓ Result: ₹14,200 Fuel Saved • 0 SLA Breaches</div>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-card"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Run Live Optimizer</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: HOW FLEETMIND WORKS */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-200 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">The Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              How FleetMind Works: The Core Decision Loop
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            {[
              { title: '1. Shipment', desc: 'Demand Input', icon: Package },
              { title: '2. AI Parse', desc: 'FleetMind AI Extraction', icon: Sparkles },
              { title: '3. Constraints', desc: 'Weight & Volume', icon: ShieldCheck },
              { title: '4. Grouping', desc: 'Consolidation', icon: Layers },
              { title: '5. Assignment', desc: 'Eco Vehicle Match', icon: Truck },
              { title: '6. Routing', desc: '2-Opt Waypoints', icon: Route },
              { title: '7. Re-Optimize', desc: 'Self-Healing', icon: RotateCcw },
            ].map((step, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 glass-card-hover">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <step.icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                <p className="text-[10px] text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: AI CAPABILITIES */}
      <section id="ai-capabilities" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">FleetMind AI Intelligence</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Enterprise AI Built for Real Logistics Operations
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No hallucinations. Safe tool-calling architecture strictly querying authoritative backend data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-3 glass-card-hover">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">FleetMind AI Intelligence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dispatcher assistant equipped with safe tools: getAtRiskShipments, getLorries, simulateScenario, and getCostMetrics.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-3 glass-card-hover">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Natural Language Order Entry</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Send 2 tonnes of textiles from Karur to Chennai before tomorrow 5 PM" instantly maps to verified structured data with confirmation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-3 glass-card-hover">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Assignment Explainability</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides mathematical rationale explaining why high-efficiency vehicles beat nearest-distance vehicles to maximize profit.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 7: SMART LOAD OPTIMIZATION */}
      <section id="optimization" className="py-16 bg-white border-y border-slate-200 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Multi-Stop Consolidation</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Smart Load Grouping Along High-Density Corridors
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Rather than sending three 2-ton lorries separately on the Karur-Chennai highway, FleetMind aggregates shipments S-101, S-102, and S-104 into a single 10.5-ton vehicle, saving 2 full trucks and ₹14,200 in operating costs.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <span>Sign In to Access Optimizer</span> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-3 glass-card-hover">
            <div className="text-xs font-bold text-slate-700 uppercase">Consolidation Group G-07 Example:</div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="font-bold text-slate-900">S-101 (2.2T Cotton Bedding)</span>
                  <p className="text-[11px] text-slate-500">Karur → Chennai CFS</p>
                </div>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded text-[10px]">CRITICAL SLA</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="font-bold text-slate-900">S-102 (1.9T Jacquard Curtains)</span>
                  <p className="text-[11px] text-slate-500">Karur → Chennai Port Gateway</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">HIGH SLA</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="font-bold text-slate-900">S-104 (2.4T Yarn Rolls)</span>
                  <p className="text-[11px] text-slate-500">Karur → Madhavaram CFS</p>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">HIGH SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: ROUTE OPTIMIZATION */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 glass-card-hover">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-blue-400">2-Opt Heuristic Routing</span>
            <span className="text-[10px] text-slate-400">Haversine x 1.28 Road Factor</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <p className="text-slate-300">Initial Stop Sequence: P1 → P2 → D1 → D2 (342 km)</p>
            <p className="text-emerald-400">Optimized 2-Opt Sequence: P1 → P2 → D2 → D1 (308 km)</p>
            <p className="text-amber-300">Distance Saved: 34 km (-9.9%)</p>
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Dynamic Routing</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            2-Opt Heuristics That Respect Pickup Precedence
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Standard TSP algorithms fail in logistics because you cannot deliver a package before picking it up. FleetMind enforces strict pickup precedence while iteratively reordering delivery waypoints to minimize distance and fuel burn.
          </p>
        </div>
      </section>

      {/* SECTION 9: REAL-TIME OPERATIONS */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Command Center</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Live Operations Map with Contextual Drawers
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Track vehicle status in real-time. Click any lorry marker to view assigned driver, capacity utilization gauge, and active route stops.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-card hover:shadow-card-hover transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to View Live Telemetry Map</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 10: DISRUPTION MANAGEMENT */}
      <section id="disruption" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Self-Healing Fleet</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Instant Recovery When Things Go Wrong
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Breakdowns and traffic jams happen. FleetMind isolates affected loads and computes a new plan in seconds.
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/login"
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-card hover:shadow-card-hover transition flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Manage Fleet Recovery</span>
          </Link>
        </div>
      </section>

      {/* SECTION 11: ROLE-BASED PLATFORM */}
      <section id="roles" className="py-16 bg-white border-y border-slate-200 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tailored Portals</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              4 Dedicated Role-Based Experiences
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50 space-y-3 glass-card-hover">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded uppercase">Dispatcher</span>
              <h3 className="text-base font-bold text-slate-900">Command Center</h3>
              <p className="text-xs text-slate-600">Live map, 15-step optimization, shipment parser, and FleetMind AI.</p>
              <Link href="/login" className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 pt-2">
                Sign In as Dispatcher <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50 space-y-3 glass-card-hover">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase">Driver PWA</span>
              <h3 className="text-base font-bold text-slate-900">Mobile Execution</h3>
              <p className="text-xs text-slate-600">Mobile-first, bottom navigation, proof of delivery & offline sync queue.</p>
              <Link href="/login" className="text-xs font-bold text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1 pt-2">
                Sign In as Driver <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50 space-y-3 glass-card-hover">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">Manager</span>
              <h3 className="text-base font-bold text-slate-900">BI Analytics</h3>
              <p className="text-xs text-slate-600">Fleet utilization, fuel benchmarking, cost trends & optimization ROI.</p>
              <Link href="/login" className="text-xs font-bold text-amber-600 hover:text-amber-800 inline-flex items-center gap-1 pt-2">
                Sign In as Manager <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50 space-y-3 glass-card-hover">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded uppercase">Admin</span>
              <h3 className="text-base font-bold text-slate-900">System Controller</h3>
              <p className="text-xs text-slate-600">User management, fuel price settings, immutable audit logs & health checks.</p>
              <Link href="/login" className="text-xs font-bold text-purple-600 hover:text-purple-800 inline-flex items-center gap-1 pt-2">
                Sign In as Admin <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: ANALYTICS */}
      <section id="analytics" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Business Impact</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Real Financial & Operational Metrics
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
            <div className="text-3xl font-black text-blue-600">18.4%</div>
            <div className="text-xs font-bold text-slate-700 mt-1">Fuel Expense Saved</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
            <div className="text-3xl font-black text-emerald-600">98.2%</div>
            <div className="text-xs font-bold text-slate-700 mt-1">On-Time SLA Compliance</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
            <div className="text-3xl font-black text-indigo-600">82.5%</div>
            <div className="text-xs font-bold text-slate-700 mt-1">Average Payload Density</div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
            <div className="text-3xl font-black text-amber-600">₹5.2L</div>
            <div className="text-xs font-bold text-slate-700 mt-1">Quarterly Net Savings</div>
          </div>
        </div>
      </section>

      {/* SECTION 13: TECHNOLOGY */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modern Tech Stack</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Production-Grade Web & AI Infrastructure
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto text-xs font-semibold text-slate-700">
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">Next.js 14 (App Router)</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">Strict TypeScript</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">Tailwind CSS (Light Theme)</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">Firebase Authentication</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">Supabase PostgreSQL & Realtime</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">FleetMind AI Neural Engine</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">Leaflet Maps</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">Installable PWA</span>
          </div>
        </div>
      </section>

      {/* SECTION 13.5: FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Answers & Insights</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Everything you need to know about FleetMind AI load consolidation, routing algorithms, and enterprise telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">1</span>
              How does FleetMind AI differ from standard GPS trackers?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Legacy GPS trackers only answer <em>"Where is the truck?"</em>. FleetMind AI acts as an autonomous co-pilot that answers <em>"What is the most profitable load to assign, which carrier has the best mileage equation, and what sequence avoids deadheading?"</em>.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0">2</span>
              What happens during highway breakdown disruptions?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Our Self-Healing Disruption Engine detects breakdown telemetry or driver SOS pings, identifies available carriers in the corridor, and generates a 1-click rescue plan with cross-docking waypoint recalculation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs shrink-0">3</span>
              Does the Driver Cockpit work without internet?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Yes. Built as an Offline-First Progressive Web App (PWA) with Service Workers and IndexedDB, drivers can record turn-by-turn deliveries, capture signatures, and sync when cell reception resumes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs shrink-0">4</span>
              How does the 2-Opt TSP optimization save diesel?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              By uncrossing inefficient route loops and factoring vehicle fuel efficiencies (e.g. 5 km/L vs 10.4 km/L), FleetMind delivers an average of 18.4% reduction in total diesel consumption across regional runs.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 14: APPLY FOR DISPATCHER COMMAND DESK CARD */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-12">
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold w-fit">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Operator Onboarding</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Apply for Dispatcher Command Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Join the FleetMind freight network as an authorized Fleet Dispatcher. Consolidate LTL consignments, optimize multi-depot routes with AI heuristics, and oversee live turn-by-turn operations.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-slate-700 font-semibold">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>15-Step Deterministic Route & Lorry Optimization Engine</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Self-Healing Disruption Re-Optimizer on Breakdown Alert</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Admin-Verified Command Credentials for Operational Security</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7 bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-slate-200/80">
            {dispSubmitted ? (
              <div className="text-center py-8 space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-subtle">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Dispatcher Application Submitted!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your Dispatcher desk registration has been forwarded to the FleetMind System Administrator verification queue. Once approved by Admin, your command portal will unlock automatically.
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition inline-block"
                  >
                    Open Sign In Portal
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDispatcherApplication} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Dispatcher Registration Details
                </h3>

                {dispError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{dispError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={dispForm.fullName}
                        onChange={(e) => setDispForm({ ...dispForm, fullName: e.target.value })}
                        placeholder="e.g. Senthil Nathan"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Work Email *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={dispForm.email}
                        onChange={(e) => setDispForm({ ...dispForm, email: e.target.value })}
                        placeholder="senthil@freightcorridor.in"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Contact Phone *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={dispForm.phone}
                        onChange={(e) => setDispForm({ ...dispForm, phone: e.target.value })}
                        placeholder="+91 98402 11223"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Operating Experience</label>
                    <select
                      value={dispForm.experienceYears}
                      onChange={(e) => setDispForm({ ...dispForm, experienceYears: Number(e.target.value) })}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                    >
                      <option value={1}>1 - 2 Years Dispatch Experience</option>
                      <option value={4}>3 - 5 Years Dispatch Experience</option>
                      <option value={8}>5 - 10 Years Senior Operations</option>
                      <option value={12}>10+ Years Enterprise Fleet Controller</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Account Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={dispForm.password}
                        onChange={(e) => setDispForm({ ...dispForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Fleet License / GSTIN</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={dispForm.notes}
                        onChange={(e) => setDispForm({ ...dispForm, notes: e.target.value })}
                        placeholder="e.g. 33AABCU9603R1ZM / TN-FL-408"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 font-medium leading-relaxed">
                  🛡️ <strong>Admin Verification Policy:</strong> Your Dispatcher Command account will be reviewed by the System Administrator. Once approved by Admin, your live Command Desk dashboard will unlock automatically.
                </div>

                <button
                  type="submit"
                  disabled={dispSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {dispSubmitting ? 'Creating Dispatcher Account...' : 'Create Account & Submit for Admin Verification'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 15: FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo variant="full" size="sm" asLink={false} />
            <span className="text-slate-400">|</span>
            <span>Optimize Every Load. Every Route. Every Rupee.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="hover:text-slate-900 font-semibold"
            >
              Sign In
            </Link>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

