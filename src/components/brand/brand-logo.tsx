'use client';

import React from 'react';
import Link from 'next/link';

export interface BrandLogoProps {
  /**
   * Wordmark variant:
   * - 'full': [Logo] FleetMind AI
   * - 'compact': [Logo] FleetMind
   * - 'icon': [Logo]
   */
  variant?: 'full' | 'compact' | 'icon';
  /**
   * Size presets:
   * - 'sm': Logo ~28px, Wordmark ~18px
   * - 'md': Logo ~32-34px, Wordmark ~20-22px (standard navbar & sidebar)
   * - 'lg': Logo ~46-48px, Wordmark ~26-28px (auth header)
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Wrap in Next.js Link
   */
  asLink?: boolean;
  /**
   * Target link URL
   */
  href?: string;
  /**
   * Optional subtitle under the wordmark
   */
  subtitle?: string;
  /**
   * Optional role or capability badge next to wordmark
   */
  badge?: string;
  /**
   * Role badge tint color
   */
  badgeColor?: 'blue' | 'purple' | 'amber' | 'emerald' | 'slate';
  /**
   * Additional container CSS classes
   */
  className?: string;
}

export function BrandLogo({
  variant = 'full',
  size = 'md',
  asLink = true,
  href = '/',
  subtitle,
  badge,
  badgeColor = 'blue',
  className = '',
}: BrandLogoProps) {
  // Dimensions precisely calibrated to spec (Logo ~30-34px desktop, ~28px mobile, ~48px auth)
  const iconSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-[34px] sm:h-[34px]',
    lg: 'w-11 h-11 sm:w-12 sm:h-12',
  }[size];

  // Wordmark font size: 20-24px desktop, 18px mobile, 26-28px auth
  const textSizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-[21px]',
    lg: 'text-2xl sm:text-[26px]',
  }[size];

  const subtitleSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  }[size];

  const badgeStyles = {
    blue: 'bg-blue-50 text-[#1677FF] border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }[badgeColor];

  const content = (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Existing Logo Icon - kept untouched with authentic proportions */}
      <img
        src="/logo.png"
        alt="FleetMind AI"
        width={size === 'lg' ? 48 : size === 'sm' ? 28 : 34}
        height={size === 'lg' ? 48 : size === 'sm' ? 28 : 34}
        style={{
          width: size === 'lg' ? 48 : size === 'sm' ? 28 : 34,
          height: size === 'lg' ? 48 : size === 'sm' ? 28 : 34,
        }}
        className={`${iconSizeClasses} object-contain shrink-0 transition-transform duration-200 group-hover:scale-105`}
      />

      {variant !== 'icon' && (
        <div className="flex flex-col justify-center leading-none text-left">
          <div className="flex items-center gap-1.5 leading-none">
            {/* Wordmark: "FleetMind" in solid deep navy (#0B1F44), bold geometric sans-serif */}
            <span
              style={{ color: '#0B1F44' }}
              className={`font-extrabold tracking-[-0.025em] ${textSizeClasses} font-sans`}
            >
              FleetMind
            </span>

            {/* Wordmark: "AI" in vivid blue (#1677FF -> #2563EB) */}
            {variant === 'full' && (
              <span
                className={`font-extrabold tracking-[-0.02em] bg-gradient-to-r from-[#1677FF] to-[#2563EB] bg-clip-text text-transparent ${textSizeClasses} font-sans`}
              >
                AI
              </span>
            )}

            {badge && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider ${badgeStyles}`}
              >
                {badge}
              </span>
            )}
          </div>

          {subtitle && (
            <p className={`text-slate-500 font-medium tracking-tight ${subtitleSizeClasses} mt-1 leading-none`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href={href} className="inline-flex items-center group">
        {content}
      </Link>
    );
  }

  return content;
}
