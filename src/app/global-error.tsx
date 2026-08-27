'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-slate-900 flex items-center justify-center min-h-screen p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-black">
            !
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">Application Encountered an Error</h2>
            <p className="text-xs text-slate-500 mt-1">
              {error?.message || 'An unexpected error occurred while loading this view.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => reset()}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition inline-flex items-center justify-center"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
