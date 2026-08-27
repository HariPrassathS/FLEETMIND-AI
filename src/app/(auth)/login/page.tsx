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
      setAuthSuccess(`Authentication verified for ${user.full_name || user.email}! Redirecting to ${user.role} Portal...`);
      setTimeout(() => {
        router.push(getRoleDashboardPath(user.role));
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleCustomer = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogleCustomer();
      setAuthSuccess(`Google Shipper account verified! Redirecting to Customer Dashboard...`);
      setTimeout(() => {
        router.push('/customer/dashboard');
      }, 700);
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
        }, 1800);
      } catch (err: any) {
        setError(err.message || 'Failed to create customer account.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/50 via-indigo-50/20 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Back to Home button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50/60 border border-slate-200/90 hover:border-blue-200 px-3.5 py-2 rounded-xl shadow-subtle hover:shadow-card transition group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 group-hover:text-blue-600 transition" />
          <span>Back to FleetMind AI Home</span>
        </Link>
        <span className="text-[11px] font-semibold text-slate-400">Secure Access</span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl shadow-xl border border-slate-200/80">
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-6">
            <BrandLogo size="lg" variant="full" />
            <p className="text-xs text-slate-500 font-semibold mt-1">Unified Logistics Intelligence Portal</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white text-blue-700 shadow-card font-extrabold'
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
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-blue-700 shadow-card font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Customer
            </button>
          </div>

          {authSuccess && (
            <div className="mb-4 p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs text-emerald-950 flex items-center gap-3 animate-in fade-in zoom-in-95 shadow-md">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-bounce">
                ✓
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-emerald-950">Login Successful</p>
                <p className="text-emerald-700 font-semibold text-[11px] mt-0.5">{authSuccess}</p>
              </div>
              <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleCustomer}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  or enter credentials
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Password</label>
                  <Link href="/forgot-password" className="text-[11px] text-blue-600 hover:underline font-semibold">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card hover:shadow-card-hover transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                {isSubmitting ? 'Verifying...' : 'Sign In to Dashboard'}
              </button>
            </form>
          )}

          {/* TAB 2: CREATE CUSTOMER ACCOUNT */}
          {activeTab === 'register' && (
            <form onSubmit={handleCustomerRegister} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">
                  {regStep === 1 && 'Step 1: Shipper Credentials'}
                  {regStep === 2 && 'Step 2: Freight Profile'}
                  {regStep === 3 && 'Account Created!'}
                </span>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Step {regStep} of 2
                </span>
              </div>

              {regStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        placeholder="Rajesh Kumar"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={regForm.companyName}
                        onChange={(e) => setRegForm({ ...regForm, companyName: e.target.value })}
                        placeholder="ABC Electronics Pvt Ltd"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Email *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        placeholder="rajesh@abcelectronics.in"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center justify-center gap-2"
                  >
                    Next: Freight Profile
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {regStep === 2 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegForm({ ...regForm, customerType: 'BUSINESS' })}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                          regForm.customerType === 'BUSINESS'
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-blue-600" />
                        Commercial
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegForm({ ...regForm, customerType: 'PERSON' })}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                          regForm.customerType === 'PERSON'
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-slate-200 text-slate-600'
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
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        placeholder="+91 98410 44556"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
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
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center justify-center gap-2"
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
