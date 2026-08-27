'use client';

import React, { useState } from 'react';
import { Truck, ShieldCheck, Thermometer, Zap } from 'lucide-react';

export const VEHICLE_PRESET_IMAGES = [
  {
    id: 'tata-signa',
    name: 'Tata Signa (Heavy Multi-Axle)',
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80',
    type: 'Heavy 10-Wheeler',
  },
  {
    id: 'eicher-pro',
    name: 'Eicher Pro (Heavy Hauler)',
    url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&auto=format&fit=crop&q=80',
    type: 'Multi-Axle Cargo',
  },
  {
    id: 'bharatbenz',
    name: 'BharatBenz 2823R (Container Hauler)',
    url: 'https://images.unsplash.com/photo-1586191582056-a67b37063c63?w=600&auto=format&fit=crop&q=80',
    type: 'Container Carrier',
  },
  {
    id: 'ashok-leyland',
    name: 'Ashok Leyland BOSS (ICV)',
    url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&auto=format&fit=crop&q=80',
    type: 'ICV Platform',
  },
  {
    id: 'mahindra-blazo',
    name: 'Mahindra Blazo X (Heavy Cargo)',
    url: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=600&auto=format&fit=crop&q=80',
    type: 'Heavy Platform',
  },
  {
    id: 'reefer-coldchain',
    name: 'Tata Ultra Reefer (Cold-Chain)',
    url: 'https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=600&auto=format&fit=crop&q=80',
    type: 'Refrigerated Reefer',
  },
  {
    id: 'ev-courier',
    name: 'Express EV Commercial Van',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
    type: 'City Express',
  },
];

interface VehicleAvatarProps {
  src?: string | null;
  lorryCode?: string;
  model?: string;
  isRefrigerated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function VehicleAvatar({
  src,
  lorryCode = 'L-01',
  model = 'Commercial Lorry',
  isRefrigerated = false,
  size = 'md',
  className = '',
}: VehicleAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl text-xs',
    md: 'w-14 h-14 rounded-2xl text-sm',
    lg: 'w-20 h-20 rounded-3xl text-base',
    xl: 'w-28 h-28 rounded-3xl text-lg',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-12 h-12',
  };

  const getBrandGradient = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('tata')) return 'from-blue-600 to-indigo-700 text-white';
    if (lower.includes('eicher')) return 'from-amber-600 to-orange-700 text-white';
    if (lower.includes('bharatbenz')) return 'from-emerald-600 to-teal-800 text-white';
    if (lower.includes('ashok')) return 'from-purple-600 to-indigo-800 text-white';
    if (lower.includes('mahindra')) return 'from-rose-600 to-red-800 text-white';
    return 'from-slate-700 to-slate-900 text-white';
  };

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br ${getBrandGradient(
          model
        )} flex flex-col items-center justify-center font-black shadow-sm shrink-0 relative overflow-hidden border border-white/20 ${className}`}
      >
        <Truck className={iconSizes[size]} />
        <span className="text-[9px] font-mono tracking-tight font-black uppercase mt-0.5">
          {lorryCode}
        </span>
        {isRefrigerated && (
          <span className="absolute top-1 right-1 p-0.5 rounded-full bg-cyan-400 text-slate-950" title="Reefer Cold Chain">
            <Thermometer className="w-2.5 h-2.5" />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative shrink-0 overflow-hidden border border-slate-200 shadow-sm bg-slate-100 ${className}`}>
      <img
        src={src}
        alt={model}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent p-1 text-center">
        <span className="text-[8px] font-black text-white font-mono uppercase block leading-none">
          {lorryCode}
        </span>
      </div>
      {isRefrigerated && (
        <span className="absolute top-1 right-1 p-0.5 rounded-full bg-cyan-400 text-slate-950 shadow-sm" title="Reefer Cold Chain">
          <Thermometer className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
}
