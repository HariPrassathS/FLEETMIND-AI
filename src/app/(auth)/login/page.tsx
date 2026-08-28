'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth/auth-context';
import { UserRole } from '../../../lib/optimization/types';
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  AlertCircle,
  Truck,
  Package,
  BarChart3,
  Shield,
  CheckCircle2,
  LogIn,
  UserPlus,
  Building2,
  User,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '../../../components/brand/brand-logo';

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

  // Customer Register Wizard
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
      setAuthSuccess(`Welcome back, ${user.full_name || user.email}! Redirecting to ${user.role} Portal...`);
      setTimeout(() => {
        router.push(getRoleDashboardPath(user.role));
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleCustomer = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogleCustomer();
      setAuthSuccess(`Google account verified! Redirecting to Customer Dashboard...`);
      setTimeout(() => {
        router.push('/customer/dashboard');
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
      setIsSubmitting(false);
    }
  };

  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regStep === 1) {
      if (!regForm.fullName || !regForm.email || !regForm.password) {
        setError('Please fill in all required fields.');
        return;
      }
      if (regForm.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setError(null);
      setRegStep(2);
      return;
    }

    if (regStep === 2) {
      setError(null);
      setIsSubmitting(true);
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
        setTimeout(() => {
          router.push('/customer/dashboard');
        }, 1500);
      } catch (err: any) {
        setError(err.message || 'Failed to create customer account.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Quick-fill credentials helper for demo
  const quickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between relative selection:bg-blue-100 selection:text-blue-900">
      {/* Background subtle radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-transparent pointer-events-none -z-10" />

      {/* Top Header with Back Navigation */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 group-hover:text-blue-600 transition" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">FleetMind Network Online</span>
        </div>
      </header>

      {/* Center Normal Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4 sm:my-8 z-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-8 space-y-6">

            {/* Brand Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <BrandLogo size="lg" variant="full" />
              </div>
              <p className="text-xs font-medium text-slate-500">
                Logistics Decision Intelligence Platform
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex border border-slate-200 bg-slate-100/90 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                  activeTab === 'login'
                    ? 'bg-white text-blue-700 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setRegStep(1);
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                  activeTab === 'register'
                    ? 'bg-white text-blue-700 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Shipper
              </button>
            </div>

            {/* Success Alert */}
            {authSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center gap-3 animate-in fade-in">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-emerald-900">{authSuccess}</p>
                </div>
                <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Google Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleCustomer}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                  Continue with Google
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    or enter email
                  </span>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium bg-slate-50/50 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-[11px] text-blue-600 hover:underline font-semibold">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium bg-slate-50/50 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  {isSubmitting ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
                </button>

                {/* Quick Demo Credentials Strip */}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                    Quick Role Login (Demo)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => quickFill('admin@fleetmind.ai', 'Password@123')}
                      className="p-2 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-800 font-bold text-left transition flex items-center gap-1.5"
                    >
                      <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Admin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => quickFill('manager@fleetmind.ai', 'Password@123')}
                      className="p-2 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-800 font-bold text-left transition flex items-center gap-1.5"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Manager</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => quickFill('dispatcher@fleetmind.ai', 'Password@123')}
                      className="p-2 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-800 font-bold text-left transition flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Dispatcher</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => quickFill('driver@fleetmind.ai', 'Password@123')}
                      className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 font-bold text-left transition flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Driver</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: CREATE SHIPPER ACCOUNT */}
            {activeTab === 'register' && (
              <form onSubmit={handleCustomerRegister} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">
                    {regStep === 1 && 'Step 1: Shipper Credentials'}
                    {regStep === 2 && 'Step 2: Freight Profile'}
                    {regStep === 3 && 'Account Created!'}
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Step {regStep} of 2
                  </span>
                </div>

                {regStep === 1 && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={regForm.fullName}
                          onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                          placeholder="Rajesh Kumar"
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={regForm.companyName}
                          onChange={(e) => setRegForm({ ...regForm, companyName: e.target.value })}
                          placeholder="ABC Logistics Pvt Ltd"
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Email *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          placeholder="rajesh@company.in"
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password *</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          required
                          value={regForm.password}
                          onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                          placeholder="Min. 6 characters"
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      Next: Freight Profile
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {regStep === 2 && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Category</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegForm({ ...regForm, customerType: 'BUSINESS' })}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                            regForm.customerType === 'BUSINESS'
                              ? 'border-blue-600 bg-blue-50 text-blue-900'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Building2 className="w-4 h-4 text-blue-600" />
                          Commercial
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegForm({ ...regForm, customerType: 'PERSON' })}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                            regForm.customerType === 'PERSON'
                              ? 'border-blue-600 bg-blue-50 text-blue-900'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <User className="w-4 h-4 text-blue-600" />
                          Individual
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          required
                          value={regForm.phone}
                          onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                          placeholder="+91 98410 44556"
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Default Operating City</label>
                      <select
                        value={regForm.defaultCity}
                        onChange={(e) => setRegForm({ ...regForm, defaultCity: e.target.value })}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                      >
                        <option value="Bengaluru">Bengaluru (Peenya / Electronic City)</option>
                        <option value="Chennai">Chennai (Port / Ambattur)</option>
                        <option value="Coimbatore">Coimbatore (SIDCO)</option>
                        <option value="Hosur">Hosur (Automotive SEZ)</option>
                        <option value="Karur">Karur (Textile Corridor)</option>
                        <option value="Salem">Salem (Agro Complex)</option>
                        <option value="Hyderabad">Hyderabad</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isSubmitting ? 'Creating Profile...' : 'Complete & Launch'}
                      </button>
                    </div>
                  </div>
                )}

                {regStep === 3 && (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">Account Created Successfully!</h4>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      Welcome to FleetMind AI. Launching your customer freight dashboard now...
                    </p>
                  </div>
                )}
              </form>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] font-medium text-slate-400 z-10 flex flex-wrap items-center justify-center gap-4">
        <span>🔒 256-Bit SSL Encrypted Enterprise Portal</span>
        <span>•</span>
        <span>FleetMind AI Decision Platform</span>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading FleetMind Portal...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
