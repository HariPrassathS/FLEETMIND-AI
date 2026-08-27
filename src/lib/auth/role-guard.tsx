'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, getRoleDashboardPath } from './auth-context';
import { UserRole } from '../optimization/types';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, role, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Verifying credentials & role authorization...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-card p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-sm text-slate-600 mb-6">
            Please log in to access this FleetMind portal and operations control center.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-rose-200 shadow-card p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="inline-block px-2.5 py-1 rounded bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
            403 ACCESS DENIED
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Unauthorized Portal Access</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your account role <span className="font-semibold text-slate-900">[{role}]</span> does not have authorization to view this section.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href={getRoleDashboardPath(role)}
              className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Return to Your Dashboard ({role})
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
