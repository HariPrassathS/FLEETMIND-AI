'use client';

import React from 'react';
import Link from 'next/link';
import { Home, LogIn } from 'lucide-react';
import { BrandLogo } from '../components/brand/brand-logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 text-center space-y-5">
        <BrandLogo variant="full" size="md" className="mx-auto" />
        
        <div className="text-5xl font-black text-blue-600 tracking-tight">404</div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading">Page Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            The requested operations dashboard or route does not exist.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Link
            href="/login"
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition inline-flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/"
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition inline-flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
