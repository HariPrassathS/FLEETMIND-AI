'use client';

import React, { useId } from 'react';
import { Lorry, Shipment } from '../../lib/optimization/types';
import { getLorryLiveCapacity, calculateProjectedFit, LorryLiveCapacity } from '../../lib/optimization/capacity';
import { Scale, Layers, AlertTriangle, CheckCircle2, Package, Truck, Sparkles } from 'lucide-react';

export interface TruckCapacityVisualProps {
  lorry?: Lorry;
  capacity?: LorryLiveCapacity;
  newShipment?: { weight_kg: number; volume_m3: number } | null;
  mode?: 'compact' | 'detailed' | 'projected' | 'customer' | 'driver' | 'modal';
  isSelected?: boolean;
  className?: string;
  showMetrics?: boolean;
}

export function TruckCapacityVisual({
  lorry,
  capacity: providedCapacity,
  newShipment,
  mode = 'detailed',
  isSelected = false,
  className = '',
  showMetrics = true,
}: TruckCapacityVisualProps) {
  const clipId = useId();

  // Compute live capacity if not directly provided
  const liveCapacity = providedCapacity || (lorry ? getLorryLiveCapacity(lorry) : null);

  if (!liveCapacity) {
    return null;
  }

  const {
    currentWeightKg,
    maxWeightKg,
    weightOccupancyPct,
    remainingWeightKg,
    currentVolumeM3,
    maxVolumeM3,
    volumeOccupancyPct,
    remainingVolumeM3,
    onboardWeightKg,
    onboardVolumeM3,
    onboardVolumePct,
    hasPlannedPendingPickup,
    loadStatus,
    statusColor,
    badgeText,
  } = liveCapacity;

  // Calculate projected metrics if a new shipment is passed for assignment evaluation
  const projectedFit = newShipment ? calculateProjectedFit(liveCapacity, newShipment) : null;

  // Container geometry dimensions (within 280x105 viewBox)
  const containerX = 18;
  const containerY = 16;
  const containerWidth = 162;
  const containerHeight = 58;

  // Calculate pixel widths for cargo fill
  const currentFillPct = Math.min(100, Math.max(0, volumeOccupancyPct));
  const currentFillWidth = (currentFillPct / 100) * containerWidth;

  const projectedFillPct = projectedFit ? Math.min(100, projectedFit.projectedVolumePct) : currentFillPct;
  const projectedFillWidth = (projectedFillPct / 100) * containerWidth;
  const newShipmentSliceWidth = Math.max(0, projectedFillWidth - currentFillWidth);

  // Generate dynamic package boxes based on volume occupancy
  const generateCargoBoxes = () => {
    if (currentFillPct <= 0 && (!projectedFit || projectedFit.projectedVolumePct <= 0)) {
      return null;
    }

    const boxes: React.ReactNode[] = [];
    const cols = 8;
    const rows = 3;
    const boxW = containerWidth / cols - 2;
    const boxH = containerHeight / rows - 3;

    // Total boxes proportional to volume (up to cols * rows = 24 boxes)
    const currentActiveBoxes = Math.round((currentFillPct / 100) * (cols * rows));
    const projectedTotalBoxes = projectedFit ? Math.round((projectedFit.projectedVolumePct / 100) * (cols * rows)) : currentActiveBoxes;

    let boxIndex = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = rows - 1; r >= 0; r--) {
        boxIndex++;
        const bx = containerX + 2 + c * (boxW + 2);
        const by = containerY + 2 + r * (boxH + 3);

        const isCurrent = boxIndex <= currentActiveBoxes;
        const isProjected = !isCurrent && boxIndex <= projectedTotalBoxes;

        if (isCurrent) {
          // Current existing freight carton / crate
          const isCrate = (c + r) % 3 === 0;
          boxes.push(
            <g key={`box-${c}-${r}`}>
              <rect
                x={bx}
                y={by}
                width={boxW}
                height={boxH}
                rx={1.5}
                fill={isCrate ? '#0284c7' : '#d97706'}
                stroke="#ffffff"
                strokeWidth={0.5}
                opacity={0.92}
              />
              {/* Packaging tape / crate cross strap */}
              {!isCrate ? (
                <line
                  x1={bx + boxW * 0.25}
                  y1={by}
                  x2={bx + boxW * 0.25}
                  y2={by + boxH}
                  stroke="#fef3c7"
                  strokeWidth={0.8}
                  opacity={0.8}
                />
              ) : (
                <line
                  x1={bx}
                  y1={by + boxH * 0.5}
                  x2={bx + boxW}
                  y2={by + boxH * 0.5}
                  stroke="#bae6fd"
                  strokeWidth={0.7}
                  opacity={0.8}
                />
              )}
            </g>
          );
        } else if (isProjected) {
          // Projected New Consignment Box (pulsing emerald / violet accent)
          boxes.push(
            <g key={`proj-box-${c}-${r}`}>
              <rect
                x={bx}
                y={by}
                width={boxW}
                height={boxH}
                rx={1.5}
                fill="#8b5cf6"
                stroke="#ffffff"
                strokeWidth={0.6}
                strokeDasharray="1.5,1"
                opacity={0.95}
              />
              <line
                x1={bx}
                y1={by + boxH}
                x2={bx + boxW}
                y2={by}
                stroke="#ede9fe"
                strokeWidth={0.8}
              />
            </g>
          );
        }
      }
    }

    return boxes;
  };

  // Color mapping based on occupancy
  const getBadgeStyle = (pct: number) => {
    if (pct > 100) return 'bg-rose-600 text-white border-rose-700 animate-pulse';
    if (pct >= 95) return 'bg-rose-100 text-rose-800 border-rose-300';
    if (pct >= 80) return 'bg-amber-100 text-amber-900 border-amber-300';
    if (pct >= 50) return 'bg-blue-100 text-blue-900 border-blue-300';
    if (pct > 0) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const getFillGradient = (pct: number) => {
    if (pct > 100) return 'url(#grad-overload)';
    if (pct >= 95) return 'url(#grad-rose)';
    if (pct >= 80) return 'url(#grad-amber)';
    if (pct >= 50) return 'url(#grad-blue)';
    if (pct > 0) return 'url(#grad-emerald)';
    return 'transparent';
  };

  // Customer Mode: Show clean vehicle status without private backend fleet telemetry
  if (mode === 'customer') {
    return (
      <div className={`p-3 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-blue-600" /> Carrier Assigned
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800">
            {liveCapacity.lorry.lorry_code}
          </span>
        </div>

        {/* Compact Truck SVG */}
        <div className="w-full max-w-[260px] mx-auto">
          <svg viewBox="0 0 280 105" className="w-full h-auto drop-shadow-sm select-none" aria-label="Delivery Truck">
            <defs>
              <clipPath id={`${clipId}-container`}>
                <rect x={containerX} y={containerY} width={containerWidth} height={containerHeight} rx={3} />
              </clipPath>
              <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>

            {/* Container Body */}
            <rect x={containerX} y={containerY} width={containerWidth} height={containerHeight} rx={4} fill="#f8fafc" stroke="#64748b" strokeWidth={1.5} />
            <g clipPath={`url(#${clipId}-container)`}>
              <rect x={containerX} y={containerY} width={currentFillWidth} height={containerHeight} fill="url(#grad-blue)" opacity={0.35} />
              {generateCargoBoxes()}
            </g>

            {/* Cab Section */}
            <path d="M 180 74 L 180 32 L 232 32 L 254 52 L 264 64 L 264 74 Z" fill="#1e293b" stroke="#0f172a" strokeWidth={1.5} />
            <path d="M 230 36 L 250 52 L 230 52 Z" fill="#93c5fd" opacity={0.85} />
            <rect x={200} y={40} width={22} height={20} rx={2} fill="#cbd5e1" opacity={0.9} />
            <circle cx={262} cy={66} r={2.5} fill="#fef08a" />

            {/* Chassis & Wheels */}
            <rect x={14} y={74} width={250} height={6} rx={1.5} fill="#334155" />
            <g>
              <circle cx={62} cy={88} r={12} fill="#0f172a" stroke="#475569" strokeWidth={2} />
              <circle cx={62} cy={88} r={5} fill="#94a3b8" />
              <circle cx={98} cy={88} r={12} fill="#0f172a" stroke="#475569" strokeWidth={2} />
              <circle cx={98} cy={88} r={5} fill="#94a3b8" />
              <circle cx={232} cy={88} r={12} fill="#0f172a" stroke="#475569" strokeWidth={2} />
              <circle cx={232} cy={88} r={5} fill="#94a3b8" />
            </g>
          </svg>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 font-bold text-slate-700">
          <span>{liveCapacity.lorry.model}</span>
          <span className="font-mono text-slate-500">{liveCapacity.lorry.registration_number}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`space-y-2.5 transition-all ${
        isSelected
          ? 'ring-2 ring-blue-600/40 bg-blue-50/40 rounded-3xl p-3.5'
          : ''
      } ${className}`}
    >
      {/* Top Header: Occupancy Badge + Pass/Fail State */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
              projectedFit
                ? getBadgeStyle(projectedFit.projectedVolumePct)
                : getBadgeStyle(Math.max(weightOccupancyPct, volumeOccupancyPct))
            }`}
          >
            {projectedFit ? `${projectedFit.projectedVolumePct}% AFTER ASSIGNMENT` : badgeText}
          </span>

          {hasPlannedPendingPickup && !projectedFit && (
            <span className="text-[9px] font-bold text-slate-500 uppercase px-1.5 py-0.5 bg-slate-100 rounded">
              Planned
            </span>
          )}
        </div>

        {/* Projected Feasibility pill */}
        {projectedFit && (
          <div>
            {projectedFit.isFeasible ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3 h-3" /> FITS VEHICLE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 animate-pulse">
                <AlertTriangle className="w-3 h-3" /> {projectedFit.errorMessage || 'OVERLOAD'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Realistic Side-View Truck SVG Visual */}
      <div className="w-full max-w-[300px] sm:max-w-[320px] mx-auto py-1">
        <svg
          viewBox="0 0 280 105"
          className="w-full h-auto drop-shadow-sm select-none transition-all duration-300"
          aria-label={`Side View Lorry Visual for ${liveCapacity.lorry.lorry_code}`}
        >
          <defs>
            {/* Clipping path for Cargo Container Interior */}
            <clipPath id={`${clipId}-cargo-interior`}>
              <rect x={containerX + 1} y={containerY + 1} width={containerWidth - 2} height={containerHeight - 2} rx={2} />
            </clipPath>

            {/* Status Gradients */}
            <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="grad-rose" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="grad-overload" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            {/* Projected Pattern for new incoming consignment */}
            <pattern id={`${clipId}-projected-stripes`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="4" height="8" fill="#a78bfa" opacity={0.65} />
              <rect x="4" width="4" height="8" fill="#8b5cf6" opacity={0.9} />
            </pattern>
          </defs>

          {/* 1. CARGO CONTAINER FRAME */}
          <rect
            x={containerX}
            y={containerY}
            width={containerWidth}
            height={containerHeight}
            rx={4}
            fill="#f8fafc"
            stroke="#475569"
            strokeWidth={1.8}
          />

          {/* Container Corrugated Ribbing Background */}
          {[36, 56, 76, 96, 116, 136, 156].map((rx) => (
            <line
              key={rx}
              x1={rx}
              y1={containerY + 1}
              x2={rx}
              y2={containerY + containerHeight - 1}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          ))}

          {/* 2. DYNAMIC OCCUPIED CARGO (Clipped to interior) */}
          <g clipPath={`url(#${clipId}-cargo-interior)`}>
            {/* Current Occupied Volume Background */}
            {currentFillWidth > 0 && (
              <rect
                x={containerX}
                y={containerY}
                width={currentFillWidth}
                height={containerHeight}
                fill={getFillGradient(volumeOccupancyPct)}
                opacity={0.3}
              />
            )}

            {/* Projected New Shipment Cargo Background Slice */}
            {projectedFit && newShipmentSliceWidth > 0 && (
              <rect
                x={containerX + currentFillWidth}
                y={containerY}
                width={newShipmentSliceWidth}
                height={containerHeight}
                fill={`url(#${clipId}-projected-stripes)`}
              />
            )}

            {/* Render realistic layered freight package boxes */}
            {generateCargoBoxes()}

            {/* Empty Watermark if 0% loaded */}
            {currentFillPct === 0 && (!projectedFit || projectedFit.projectedVolumePct === 0) && (
              <text
                x={containerX + containerWidth / 2}
                y={containerY + containerHeight / 2 + 3}
                fill="#94a3b8"
                fontSize={9}
                fontFamily="monospace"
                fontWeight="900"
                textAnchor="middle"
                opacity={0.6}
              >
                [ CARGO HOLD EMPTY ]
              </text>
            )}
          </g>

          {/* Container Door Lock Bars & Corner Protectors */}
          <line x1={containerX + 3} y1={containerY} x2={containerX + 3} y2={containerY + containerHeight} stroke="#334155" strokeWidth={1.5} />
          <rect x={containerX + 1} y={containerY + containerHeight * 0.4} width={4} height={10} fill="#64748b" rx={1} />

          {/* 3. TRUCK CABIN */}
          {/* Aero roof deflector */}
          <path d="M 180 32 Q 205 18 232 26 L 232 32 Z" fill="#0f172a" />
          {/* Main Cab Frame */}
          <path
            d="M 180 74 L 180 32 L 232 32 L 254 52 L 264 64 L 264 74 Z"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth={1.8}
          />
          {/* Windshield */}
          <path d="M 230 35 L 251 51 L 230 51 Z" fill="#bae6fd" opacity={0.85} stroke="#38bdf8" strokeWidth={0.6} />
          {/* Driver Side Window */}
          <rect x={198} y={39} width={26} height={20} rx={2} fill="#e2e8f0" opacity={0.9} stroke="#64748b" strokeWidth={0.8} />
          {/* Door Handle */}
          <line x1={202} y1={63} x2={210} y2={63} stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round" />
          {/* Front Headlight Assembly */}
          <polygon points="262,64 265,65 265,71 262,70" fill="#fef08a" stroke="#ca8a04" strokeWidth={0.5} />
          {/* Side Mirror */}
          <line x1={232} y1={42} x2={238} y2={44} stroke="#475569" strokeWidth={1.5} />
          <rect x={237} y={40} width={3} height={9} rx={1} fill="#0f172a" />

          {/* 4. CHASSIS & FUEL TANK */}
          <rect x={12} y={74} width={254} height={6} rx={1.5} fill="#334155" stroke="#1e293b" strokeWidth={1} />
          {/* Fuel Tank */}
          <rect x={132} y={77} width={38} height={10} rx={3} fill="#64748b" stroke="#334155" strokeWidth={1} />
          <line x1={144} y1={77} x2={144} y2={87} stroke="#475569" strokeWidth={1} />
          <line x1={158} y1={77} x2={158} y2={87} stroke="#475569" strokeWidth={1} />

          {/* 5. WHEELS (Rear Dual Tandem + Front Steering) */}
          {/* Rear Wheel 1 */}
          <g>
            <circle cx={52} cy={88} r={13} fill="#0f172a" stroke="#334155" strokeWidth={2} />
            <circle cx={52} cy={88} r={6.5} fill="#64748b" />
            <circle cx={52} cy={88} r={2.5} fill="#e2e8f0" />
          </g>
          {/* Rear Wheel 2 */}
          <g>
            <circle cx={86} cy={88} r={13} fill="#0f172a" stroke="#334155" strokeWidth={2} />
            <circle cx={86} cy={88} r={6.5} fill="#64748b" />
            <circle cx={86} cy={88} r={2.5} fill="#e2e8f0" />
          </g>
          {/* Front Steering Wheel */}
          <g>
            <circle cx={234} cy={88} r={13} fill="#0f172a" stroke="#334155" strokeWidth={2} />
            <circle cx={234} cy={88} r={6.5} fill="#64748b" />
            <circle cx={234} cy={88} r={2.5} fill="#e2e8f0" />
          </g>

          {/* Lorry Code Stamp on Container Rear */}
          <text
            x={containerX + 10}
            y={containerY + 12}
            fill="#475569"
            fontSize={7}
            fontFamily="monospace"
            fontWeight="900"
            letterSpacing="0.5"
          >
            {liveCapacity.lorry.lorry_code}
          </text>
        </svg>
      </div>

      {/* Detailed Separate Weight & Volume Capacity Metrics */}
      {showMetrics && (
        <div className="space-y-2 text-[11px] bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          {/* Weight Metric Bar */}
          <div>
            <div className="flex justify-between items-center font-bold text-slate-800 mb-1">
              <span className="flex items-center gap-1 text-slate-600">
                <Scale className="w-3.5 h-3.5 text-blue-600" />
                <span>Payload Weight</span>
              </span>
              <span className="font-mono text-xs">
                <strong>
                  {projectedFit
                    ? projectedFit.projectedWeightKg.toLocaleString()
                    : currentWeightKg.toLocaleString()}
                </strong>{' '}
                / {maxWeightKg.toLocaleString()} kg (
                <strong
                  className={
                    (projectedFit ? projectedFit.projectedWeightPct : weightOccupancyPct) > 95
                      ? 'text-rose-600'
                      : 'text-slate-900'
                  }
                >
                  {projectedFit ? projectedFit.projectedWeightPct : weightOccupancyPct}%
                </strong>
                )
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex p-0.5 border border-slate-200">
              <div
                className="h-full bg-blue-600 rounded-l-full transition-all duration-300"
                style={{ width: `${Math.min(100, weightOccupancyPct)}%` }}
              />
              {projectedFit && (
                <div
                  className="h-full bg-purple-500 rounded-r-full transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, projectedFit.projectedWeightPct) - weightOccupancyPct
                    )}%`,
                  }}
                />
              )}
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-0.5">
              <span>Occupied: {currentWeightKg.toLocaleString()} kg</span>
              <span className="text-slate-400">
                Free:{' '}
                {projectedFit
                  ? projectedFit.projectedRemainingWeightKg.toLocaleString()
                  : remainingWeightKg.toLocaleString()}{' '}
                kg
              </span>
            </div>
          </div>

          {/* Volume Metric Bar */}
          <div>
            <div className="flex justify-between items-center font-bold text-slate-800 mb-1">
              <span className="flex items-center gap-1 text-slate-600">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Container Volume</span>
              </span>
              <span className="font-mono text-xs">
                <strong>
                  {projectedFit ? projectedFit.projectedVolumeM3 : currentVolumeM3}
                </strong>{' '}
                / {maxVolumeM3} m³ (
                <strong className="text-purple-900">
                  {projectedFit ? projectedFit.projectedVolumePct : volumeOccupancyPct}%
                </strong>
                )
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex p-0.5 border border-slate-200">
              <div
                className="h-full bg-purple-600 rounded-l-full transition-all duration-300"
                style={{ width: `${Math.min(100, volumeOccupancyPct)}%` }}
              />
              {projectedFit && (
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-r-full transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, projectedFit.projectedVolumePct) - volumeOccupancyPct
                    )}%`,
                  }}
                />
              )}
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-0.5">
              <span>Occupied: {currentVolumeM3} m³</span>
              <span className="text-slate-400">
                Free:{' '}
                {projectedFit
                  ? projectedFit.projectedRemainingVolumeM3
                  : remainingVolumeM3}{' '}
                m³
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
