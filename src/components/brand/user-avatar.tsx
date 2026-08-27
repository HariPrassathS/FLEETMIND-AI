'use client';

import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  roundedClassName?: string;
}

const SIZE_MAP = {
  xs: { box: 'w-6 h-6', text: 'text-[10px]', rounded: 'rounded-lg' },
  sm: { box: 'w-8 h-8', text: 'text-xs', rounded: 'rounded-xl' },
  md: { box: 'w-10 h-10', text: 'text-sm', rounded: 'rounded-2xl' },
  lg: { box: 'w-14 h-14', text: 'text-xl', rounded: 'rounded-2xl' },
  xl: { box: 'w-20 h-20', text: 'text-3xl', rounded: 'rounded-3xl' },
};

// Generates stable pleasant gradient based on name/email
function getGradient(seed?: string | null) {
  const gradients = [
    'from-blue-600 via-indigo-600 to-blue-700',
    'from-emerald-600 via-teal-600 to-emerald-700',
    'from-indigo-600 via-purple-600 to-indigo-700',
    'from-amber-500 via-orange-500 to-amber-600',
    'from-rose-500 via-pink-600 to-rose-600',
    'from-cyan-600 via-blue-600 to-cyan-700',
  ];
  if (!seed) return gradients[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % gradients.length;
  return gradients[idx];
}

export function UserAvatar({
  src,
  name,
  email,
  size = 'sm',
  className = '',
  roundedClassName,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.sm;
  const rounded = roundedClassName || sizeConfig.rounded;

  const letter = (name?.trim()?.charAt(0) || email?.trim()?.charAt(0) || 'U').toUpperCase();
  const gradient = getGradient(name || email);

  // If valid src and no error, render image with onError handler
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'User DP'}
        onError={() => setImgError(true)}
        className={`${sizeConfig.box} ${rounded} object-cover border border-slate-200 shadow-sm shrink-0 ${className}`}
      />
    );
  }

  // Graceful Fallback initial gradient avatar
  return (
    <div
      className={`${sizeConfig.box} ${rounded} bg-gradient-to-tr ${gradient} text-white font-black ${sizeConfig.text} flex items-center justify-center shadow-sm shrink-0 select-none ${className}`}
      title={name || email || 'User Profile'}
    >
      {letter}
    </div>
  );
}
