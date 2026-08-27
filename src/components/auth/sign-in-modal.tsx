'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { BrandLogo } from '../brand/brand-logo';
import {
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User,
  Building2,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Truck,
  Shield,
  BarChart3,
  Package,
} from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export function SignInModal({ isOpen, onClose, defaultTab = 'login' }: SignInModalProps) {
  const router = useRouter();
  const { login, loginWithGoogleDispatcher, registerCustomer, getRoleDashboardPath } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Customer Register Wizard state
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

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(loginEmail, loginPassword);
      onClose();
      router.push(getRoleDashboardPath(user.role));
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleDispatcher = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogleDispatcher();
      onClose();
      router.push(getRoleDashboardPath(user.role));
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regStep === 1) {
      if (!regForm.fullName || !regForm.email || !regForm.password) {
        setError('Please complete all required fields.');
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
          onClose();
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
          <BrandLogo size="md" variant="full" />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 mx-6 mt-4 rounded-2xl">
          <button
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
            Sign In to Portal
          </button>
          <button
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
            Create Customer Account
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Google Fast Track */}
              <button
                type="button"
                onClick={handleGoogleDispatcher}
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

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  or sign in with email
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
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
                {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
              </button>
            </form>
          )}

          {/* TAB 2: CREATE CUSTOMER ACCOUNT WIZARD */}
          {activeTab === 'register' && (
            <form onSubmit={handleCustomerRegister} className="space-y-4">
              {/* Step indicator */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">
                  {regStep === 1 && 'Step 1: Shipper Credentials'}
                  {regStep === 2 && 'Step 2: Freight & Billing Profile'}
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
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name (Optional)</label>
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
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Account Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegForm({ ...regForm, customerType: 'BUSINESS' })}
                        className={`p-3 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                          regForm.customerType === 'BUSINESS'
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-blue-600" />
                        Commercial Business
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegForm({ ...regForm, customerType: 'PERSON' })}
                        className={`p-3 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                          regForm.customerType === 'PERSON'
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        Individual Shipper
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone *</label>
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
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Default Operating Hub / City</label>
                    <select
                      value={regForm.defaultCity}
                      onChange={(e) => setRegForm({ ...regForm, defaultCity: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                    >
                      <option value="Bengaluru">Bengaluru (Peenya / Electronic City)</option>
                      <option value="Chennai">Chennai (Ambattur / Guindy / Port)</option>
                      <option value="Coimbatore">Coimbatore (SIDCO / Avinashi Road)</option>
                      <option value="Hosur">Hosur (Automotive SEZ)</option>
                      <option value="Karur">Karur (Textile Freight Corridor)</option>
                      <option value="Salem">Salem (Steel & Agro Complex)</option>
                      <option value="Hyderabad">Hyderabad (HITEC / Balanagar)</option>
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
                      {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
                    </button>
                  </div>
                </div>
              )}

              {regStep === 3 && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
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
