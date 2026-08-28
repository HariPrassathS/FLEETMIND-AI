'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth/auth-context';
import {
  ArrowRight, ArrowLeft, Lock, Mail, AlertCircle, Truck, Package,
  BarChart3, Shield, CheckCircle2, LogIn, UserPlus, Building2,
  User, Phone, Eye, EyeOff, Sparkles, Zap, Activity, Globe, Star,
} from 'lucide-react';
import { BrandLogo } from '../../../components/brand/brand-logo';

const STATS = [
  { value: '18.4%', label: 'Fuel Saved' },
  { value: '98.2%', label: 'SLA Rate' },
  { value: '₹5.2L', label: 'Quarterly Savings' },
  { value: '82%', label: 'Load Density' },
];

const ROLES = [
  { icon: <Shield className="w-4 h-4" />, label: 'Admin', color: 'text-purple-400' },
  { icon: <BarChart3 className="w-4 h-4" />, label: 'Manager', color: 'text-amber-400' },
  { icon: <Truck className="w-4 h-4" />, label: 'Dispatcher', color: 'text-blue-400' },
  { icon: <Package className="w-4 h-4" />, label: 'Customer', color: 'text-emerald-400' },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const { login, loginWithGoogleCustomer, registerCustomer, getRoleDashboardPath } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regForm, setRegForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    customerType: 'BUSINESS' as 'PERSON' | 'BUSINESS',
    defaultCity: 'Bengaluru',
    password: '',
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      setAuthSuccess(`Welcome back, ${user.full_name || user.email}! Redirecting…`);
      setTimeout(() => { router.push(getRoleDashboardPath(user.role)); }, 700);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleCustomer = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogleCustomer();
      setAuthSuccess('Google account verified! Redirecting…');
      setTimeout(() => { router.push('/customer/dashboard'); }, 700);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
      setIsSubmitting(false);
    }
  };

  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regStep === 1) {
      if (!regForm.fullName || !regForm.email || !regForm.password) { setError('Please fill all required fields.'); return; }
      if (regForm.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      setError(null); setRegStep(2); return;
    }
    if (regStep === 2) {
      setError(null); setIsSubmitting(true);
      try {
        await registerCustomer({
          fullName: regForm.fullName,
          companyName: regForm.companyName || regForm.fullName,
          email: regForm.email,
          phone: regForm.phone || '+91 98000 12345',
          customerType: regForm.customerType,
          defaultCity: regForm.defaultCity,
          password: regForm.password,
        });
        setRegStep(3);
        setTimeout(() => { router.push('/customer/dashboard'); }, 1800);
      } catch (err: any) {
        setError(err.message || 'Failed to create account.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const inputClass = "w-full py-2.5 text-sm rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-medium backdrop-blur-sm transition";
  const labelClass = "block text-[11px] font-black text-white/60 uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">

      {/* === LEFT PANEL — Dark brand side === */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />

        {/* Top — Logo + Nav */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-tight">FleetMind<span className="text-blue-400"> AI</span></p>
              <p className="text-white/40 text-[10px] font-mono tracking-widest">LOGISTICS DECISION INTELLIGENCE</p>
            </div>
          </div>
        </div>

        {/* Center — Hero copy */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-blue-300 tracking-wide">Live Network Active</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Optimize Every Load.<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Every Route. Every ₹.
              </span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              AI-powered fleet intelligence with 15-step heuristic optimization, real-time GPS telemetry, and autonomous disruption recovery.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Live ticker */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Optimization</p>
            <div className="space-y-1.5 text-xs font-mono">
              <p className="text-blue-400">→ 84 consignments pending in corridor</p>
              <p className="text-white/60">✓ Clustered into 18 consolidated loads</p>
              <p className="text-white/60">✓ 2-opt routing improved −34.2 km</p>
              <p className="text-emerald-400 font-bold">✓ ₹14,200 saved · 0 SLA breaches</p>
            </div>
          </div>

          {/* Role pills */}
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <div key={r.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold">
                <span className={r.color}>{r.icon}</span>
                <span className="text-white/60">{r.label} Portal</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — Tech stack */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {['Next.js 14', 'TypeScript', 'Supabase', 'Firebase', 'Groq AI', 'Mapbox'].map((t) => (
            <span key={t} className="px-2.5 py-1 text-[10px] font-bold text-white/30 bg-white/5 border border-white/10 rounded-lg">{t}</span>
          ))}
        </div>
      </div>

      {/* === RIGHT PANEL — Auth form === */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Subtle right-side gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[80px]" />

        {/* Back button */}
        <div className="relative z-10 p-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition" />
            Back to Home
          </Link>
          <div className="lg:hidden flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-white/40">Network Active</span>
          </div>
        </div>

        {/* Auth card */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-4">
          <div className="w-full max-w-sm space-y-6">

            {/* Mobile header */}
            <div className="lg:hidden text-center space-y-1">
              <p className="text-white font-black text-xl">FleetMind<span className="text-blue-400"> AI</span></p>
              <p className="text-white/40 text-xs">Logistics Decision Intelligence</p>
            </div>

            {/* Tab toggle */}
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
              {(['login', 'register'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setError(null); if (tab === 'register') setRegStep(1); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {tab === 'login' ? <><LogIn className="w-3.5 h-3.5" /> Sign In</> : <><UserPlus className="w-3.5 h-3.5" /> Register</>}
                </button>
              ))}
            </div>

            {/* Messages */}
            {authSuccess && (
              <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xs font-black animate-bounce">✓</div>
                <div>
                  <p className="text-xs font-black text-emerald-300">Authentication Verified</p>
                  <p className="text-[11px] text-emerald-400/70">{authSuccess}</p>
                </div>
                <span className="ml-auto w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
              </div>
            )}
            {error && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-medium text-rose-300">{error}</span>
              </div>
            )}

            {/* === SIGN IN FORM === */}
            {activeTab === 'login' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white">Welcome back</h2>
                  <p className="text-xs text-white/40">Sign in to your command portal</p>
                </div>

                {/* Google button */}
                <button
                  onClick={handleGoogleCustomer}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">or</span>
                  <div className="flex-1 border-t border-white/10" />
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className={labelClass}>Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-3" />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelClass} style={{ marginBottom: 0 }}>Password</label>
                      <Link href="/forgot-password" className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-white/30 absolute left-3.5 top-3" />
                      <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${inputClass} pl-10 pr-10`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-white/30 hover:text-white/60">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-0.5">
                    <LogIn className="w-4 h-4" />
                    {isSubmitting ? 'Verifying…' : 'Sign In to Command Portal'}
                  </button>
                </form>

                {/* Role hint badges */}
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-white/25 uppercase text-center tracking-widest mb-2">Role-Based Access</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {ROLES.map((r) => (
                      <span key={r.label} className="flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/40">
                        <span className={r.color}>{r.icon}</span>{r.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* === REGISTER FORM === */}
            {activeTab === 'register' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white">
                      {regStep === 1 && 'Create Account'}
                      {regStep === 2 && 'Freight Profile'}
                      {regStep === 3 && 'All Set!'}
                    </h2>
                    <p className="text-xs text-white/40">
                      {regStep === 1 && 'Set up your shipper credentials'}
                      {regStep === 2 && 'Tell us about your freight needs'}
                      {regStep === 3 && 'Launching your dashboard…'}
                    </p>
                  </div>
                  <span className="text-[11px] font-black text-blue-400 bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 rounded-full">
                    {regStep < 3 ? `${regStep} / 2` : '✓'}
                  </span>
                </div>

                {/* Step progress */}
                <div className="flex gap-1.5">
                  {[1, 2].map((s) => (
                    <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-500 ${regStep >= s ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-white/10'}`} />
                  ))}
                </div>

                <form onSubmit={handleCustomerRegister} className="space-y-3.5">
                  {regStep === 1 && (
                    <>
                      <div>
                        <label className={labelClass}>Full Name *</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-white/30 absolute left-3.5 top-3" />
                          <input type="text" required value={regForm.fullName} onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                            placeholder="Rajesh Kumar" className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Company Name</label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-white/30 absolute left-3.5 top-3" />
                          <input type="text" value={regForm.companyName} onChange={(e) => setRegForm({ ...regForm, companyName: e.target.value })}
                            placeholder="ABC Electronics Pvt Ltd" className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Work Email *</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-3" />
                          <input type="email" required value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                            placeholder="rajesh@abcelectronics.in" className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Password *</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-white/30 absolute left-3.5 top-3" />
                          <input type="password" required value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                            placeholder="Min. 6 characters" className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 hover:-translate-y-0.5">
                        Next: Freight Profile <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {regStep === 2 && (
                    <>
                      <div>
                        <label className={labelClass}>Account Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['BUSINESS', 'PERSON'] as const).map((type) => (
                            <button key={type} type="button" onClick={() => setRegForm({ ...regForm, customerType: type })}
                              className={`p-3 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${regForm.customerType === type ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10'}`}>
                              {type === 'BUSINESS' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                              {type === 'BUSINESS' ? 'Commercial' : 'Individual'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Phone Number</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-white/30 absolute left-3.5 top-3" />
                          <input type="tel" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                            placeholder="+91 98410 44556" className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Default Operating City</label>
                        <select value={regForm.defaultCity} onChange={(e) => setRegForm({ ...regForm, defaultCity: e.target.value })}
                          className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium">
                          {['Bengaluru', 'Chennai', 'Coimbatore', 'Hosur', 'Karur', 'Salem', 'Hyderabad'].map((c) => (
                            <option key={c} value={c} className="bg-slate-900">{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => setRegStep(1)} className="px-4 py-2.5 text-xs font-bold text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition">← Back</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50">
                          <CheckCircle2 className="w-4 h-4" />
                          {isSubmitting ? 'Creating…' : 'Create Account'}
                        </button>
                      </div>
                    </>
                  )}

                  {regStep === 3 && (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Account Created!</h3>
                        <p className="text-sm text-white/40 mt-1">Launching your freight dashboard…</p>
                      </div>
                      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  )}
                </form>
              </div>
            )}

          </div>
        </div>

        {/* Bottom footer */}
        <div className="relative z-10 py-4 px-6 text-center">
          <p className="text-[10px] font-medium text-white/20">🔒 256-Bit SSL · FleetMind AI Decision Platform · All rights reserved</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-white/40">Loading FleetMind Portal…</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
