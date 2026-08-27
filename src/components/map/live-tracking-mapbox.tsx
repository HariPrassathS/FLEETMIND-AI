'use client';

/**
 * FleetMind AI — Live Tracking Mapbox Component
 *
 * Displays a real-time vehicle tracking map using:
 *  - Mapbox GL JS for rendering
 *  - /api/routing/directions for real road geometry
 *  - GPS simulation along actual road coordinates
 *  - Accurate speed, heading, ETA calculation
 *  - Supabase Realtime for live GPS broadcast
 *  - GPS stale detection (>2 min without update)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getSupabaseClient } from '../../lib/db/supabase';
import {
  calculateBearing,
  calculateETA,
  bearingToCompass,
  calculateDistance,
} from '../../lib/routing/routing-service';
import type { RouteResult, LngLat, EtaAnalysis } from '../../lib/routing/types';
import {
  Truck,
  Navigation,
  Radio,
  Gauge,
  Clock,
  Compass,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Zap,
  RotateCcw,
} from 'lucide-react';

export interface LocationPoint {
  lat: number;
  lng: number;
  city?: string;
  address?: string;
  name?: string;
}

export interface LiveTrackingMapboxProps {
  origin: LocationPoint;
  destination: LocationPoint;
  initialDriverLocation?: {
    lat: number;
    lng: number;
    speed_kmh?: number;
    heading_deg?: number;
  };
  waypoints?: LocationPoint[];
  status?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleCode?: string;
  etaText?: string;
  deadline?: string;
  shipmentId?: string;
  height?: string;
  showControls?: boolean;
}

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  '';

// Interval between simulation steps in ms
const SIM_INTERVAL_MS = 1200;
// How often to skip points for smoother performance (step size)
const SIM_STEP_SIZE = 2;
// GPS stale threshold in ms (2 minutes)
const GPS_STALE_MS = 120_000;

export function LiveTrackingMapbox({
  origin,
  destination,
  initialDriverLocation,
  waypoints = [],
  status = 'IN_TRANSIT',
  driverName = 'Murugan Selvam',
  vehicleCode = 'L-11 (Tata 1109 LPT)',
  etaText,
  deadline,
  shipmentId = 'SHP-LIVE',
  height = '480px',
  showControls = true,
}: LiveTrackingMapboxProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const driverMarkerElRef = useRef<HTMLDivElement | null>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastGpsUpdateRef = useRef<number>(Date.now());
  const staleCheckRef = useRef<NodeJS.Timeout | null>(null);
  const routeRef = useRef<RouteResult | null>(null);

  // ── State ────────────────────────────────────────────────────────────────
  const [routeLoaded, setRouteLoaded] = useState(false);
  const [routeError, setRouteError] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  // Initial driver position: use provided location, or default to origin (start of trip)
  const startLat = initialDriverLocation?.lat ?? origin.lat;
  const startLng = initialDriverLocation?.lng ?? origin.lng;

  // Calculate forward bearing towards destination initially
  const initialBearing = calculateBearing(origin.lat, origin.lng, destination.lat, destination.lng);

  const [driverPos, setDriverPos] = useState({
    lat: startLat,
    lng: startLng,
    speed: initialDriverLocation?.speed_kmh ?? 0,
    heading: initialDriverLocation?.heading_deg ?? initialBearing,
  });

  const [simStep, setSimStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(1);
  const [progressPct, setProgressPct] = useState(0);
  const [completedKm, setCompletedKm] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [gpsStale, setGpsStale] = useState(false);
  const [etaAnalysis, setEtaAnalysis] = useState<EtaAnalysis | null>(null);
  const [isSimDemo, setIsSimDemo] = useState(false);

  // ── Helper: update truck marker position + heading rotation ──────────────
  const updateMarkerPosition = useCallback((lat: number, lng: number, heading: number) => {
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLngLat([lng, lat]);
    }
    if (driverMarkerElRef.current) {
      const iconEl = driverMarkerElRef.current.querySelector('.truck-icon') as HTMLElement;
      if (iconEl) iconEl.style.transform = `rotate(${heading}deg)`;
    }
  }, []);

  // ── Helper: update route line "completed" portion (color behind truck) ───
  const updateRouteProgress = useCallback((currentStep: number, geometry: LngLat[]) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const completedCoords = geometry.slice(0, currentStep + 1);
    const remainingCoords = geometry.slice(currentStep);

    // Fallback if slice is single point
    const safeCompleted = completedCoords.length > 1 ? completedCoords : [geometry[0], geometry[0]];
    const safeRemaining = remainingCoords.length > 1 ? remainingCoords : [geometry[geometry.length - 1], geometry[geometry.length - 1]];

    const completedSrc = map.getSource('route-completed') as any;
    if (completedSrc) {
      completedSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: safeCompleted },
      });
    }

    const remainingSrc = map.getSource('route-remaining') as any;
    if (remainingSrc) {
      remainingSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: safeRemaining },
      });
    }
  }, []);

  // ── 1. Fetch Road Route ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchRoute() {
      try {
        const res = await fetch('/api/routing/directions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: [origin.lng, origin.lat],
            destination: [destination.lng, destination.lat],
            waypoints: waypoints.map((w) => [w.lng, w.lat]),
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: RouteResult = await res.json();
        if (cancelled) return;

        routeRef.current = data;
        setTotalKm(data.total_distance_km);
        setTotalSteps(data.geometry.length);
        setIsFallback(!!data.is_fallback);

        // Find closest geometry point to driver position and snap directly to the road
        let closestIdx = 0;
        let closestDist = Infinity;
        data.geometry.forEach(([lng, lat], i) => {
          const d = calculateDistance(startLat, startLng, lat, lng);
          if (d < closestDist) { closestDist = d; closestIdx = i; }
        });
        setSimStep(closestIdx);

        // Snap driver marker position onto the highway road line
        const [roadLng, roadLat] = data.geometry[closestIdx];

        // Set accurate initial heading along route tangent
        let routeHeading = initialBearing;
        if (data.geometry.length > 1) {
          const nextIdx = Math.min(closestIdx + 1, data.geometry.length - 1);
          const prevIdx = Math.max(closestIdx - 1, 0);
          const [pLng, pLat] = data.geometry[prevIdx];
          const [nLng, nLat] = data.geometry[nextIdx];
          routeHeading = calculateBearing(pLat, pLng, nLat, nLng);
        }

        setDriverPos({
          lat: roadLat,
          lng: roadLng,
          speed: initialDriverLocation?.speed_kmh ?? (status === 'IN_TRANSIT' ? 42 : 0),
          heading: routeHeading,
        });
        updateMarkerPosition(roadLat, roadLng, routeHeading);

        const initialCompletedKm = data.geometry.slice(0, closestIdx + 1).reduce((sum, coord, i, arr) => {
          if (i === 0) return sum;
          return sum + calculateDistance(arr[i - 1][1], arr[i - 1][0], coord[1], coord[0]);
        }, 0);
        setCompletedKm(Number(initialCompletedKm.toFixed(1)));
        setProgressPct(Math.round((closestIdx / Math.max(data.geometry.length - 1, 1)) * 100));

        // Center map directly on the snapped truck position
        if (mapRef.current) {
          mapRef.current.easeTo({
            center: [roadLng, roadLat],
            zoom: 11.5,
            pitch: 25,
            duration: 800,
          });
        }

        // ETA initial calculation
        const remaining = data.total_distance_km - initialCompletedKm;
        if (deadline) {
          setEtaAnalysis(calculateETA(remaining, 48, deadline));
        }

        setRouteLoaded(true);
      } catch (err) {
        if (!cancelled) {
          console.error('[LiveTrackingMapbox] Route fetch error:', err);
          setRouteError(true);
          setRouteLoaded(true); // Still show map
        }
      }
    }

    fetchRoute();
    return () => { cancelled = true; };
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  // ── 2. Initialize Mapbox Map ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    let cancelled = false;

    import('mapbox-gl').then((mb) => {
      if (cancelled || !mapContainerRef.current) return;
      const mgl = (mb.default ?? mb) as any;
      mgl.accessToken = MAPBOX_TOKEN;

      const map = new mgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [startLng, startLat],
        zoom: 8,
        pitch: 20,
      });

      map.addControl(new mgl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('load', () => {
        const route = routeRef.current;
        const geometry: LngLat[] = route
          ? route.geometry
          : [[origin.lng, origin.lat], [destination.lng, destination.lat]];

        // Route: completed portion (emerald)
        map.addSource('route-completed', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[origin.lng, origin.lat]] } },
        });
        map.addLayer({
          id: 'route-completed-line',
          type: 'line',
          source: 'route-completed',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#059669', 'line-width': 4, 'line-opacity': 0.85 },
        });

        // Route: remaining portion (blue with casing)
        map.addSource('route-remaining', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: geometry } },
        });
        map.addLayer({
          id: 'route-remaining-casing',
          type: 'line',
          source: 'route-remaining',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#93C5FD', 'line-width': 8, 'line-opacity': 0.5 },
        });
        map.addLayer({
          id: 'route-remaining-line',
          type: 'line',
          source: 'route-remaining',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#2563EB', 'line-width': 4 },
        });

        // Origin Marker
        const originEl = document.createElement('div');
        originEl.innerHTML = `<div style="background:#059669;color:white;padding:5px 10px;border-radius:9999px;font-weight:800;font-size:11px;box-shadow:0 4px 12px rgba(5,150,105,0.4);display:flex;align-items:center;gap:4px;border:2px solid white;"><span style="width:6px;height:6px;border-radius:50%;background:#A7F3D0;flex-shrink:0;"></span>${origin.city || 'Origin'}</div>`;
        new mgl.Marker({ element: originEl, anchor: 'bottom' })
          .setLngLat([origin.lng, origin.lat])
          .setPopup(new mgl.Popup({ offset: 25 }).setHTML(
            `<div style="font-family:sans-serif;font-size:12px;padding:4px;"><strong style="color:#059669;">📍 Pickup Origin</strong><p style="margin:2px 0 0;color:#475569;">${origin.address || origin.city || 'Hub'}</p></div>`
          ))
          .addTo(map);

        // Waypoint Markers
        waypoints.forEach((wp, i) => {
          const wpEl = document.createElement('div');
          wpEl.innerHTML = '<div style="background:#D97706;color:white;padding:5px 10px;border-radius:9999px;font-weight:800;font-size:11px;box-shadow:0 4px 12px rgba(217,119,6,0.4);display:flex;align-items:center;gap:4px;border:2px solid white;"><span style="width:6px;height:6px;border-radius:50%;background:#FDE68A;flex-shrink:0;"></span>' + (wp.city || ('Stop ' + (i + 1))) + '</div>';
          new mgl.Marker({ element: wpEl, anchor: 'bottom' }).setLngLat([wp.lng, wp.lat]).addTo(map);
        });

        // Destination Marker
        const destEl = document.createElement('div');
        destEl.innerHTML = `<div style="background:#E11D48;color:white;padding:5px 10px;border-radius:9999px;font-weight:800;font-size:11px;box-shadow:0 4px 12px rgba(225,29,72,0.4);display:flex;align-items:center;gap:4px;border:2px solid white;"><span style="width:6px;height:6px;border-radius:50%;background:#FECDD3;flex-shrink:0;"></span>${destination.city || 'Destination'}</div>`;
        new mgl.Marker({ element: destEl, anchor: 'bottom' })
          .setLngLat([destination.lng, destination.lat])
          .setPopup(new mgl.Popup({ offset: 25 }).setHTML(
            `<div style="font-family:sans-serif;font-size:12px;padding:4px;"><strong style="color:#E11D48;">🏁 Delivery Destination</strong><p style="margin:2px 0 0;color:#475569;">${destination.address || destination.city || 'CFS Gate'}</p></div>`
          ))
          .addTo(map);

        // Truck Marker
        const truckEl = document.createElement('div');
        truckEl.innerHTML = `<div style="position:relative;display:flex;align-items:center;justify-content:center;" class="truck-wrapper"><div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(37,99,235,0.2);animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div><div class="truck-icon" style="position:relative;width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#2563EB,#1D4ED8);border:2.5px solid white;box-shadow:0 4px 14px rgba(37,99,235,0.5);display:flex;align-items:center;justify-content:center;color:white;transition:transform 0.4s ease;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg></div></div>`;
        driverMarkerElRef.current = truckEl;

        const driverMarker = new mgl.Marker({ element: truckEl, anchor: 'center' })
          .setLngLat([startLng, startLat])
          .addTo(map);
        driverMarkerRef.current = driverMarker;

        // Fit bounds
        const bounds = new mgl.LngLatBounds();
        bounds.extend([origin.lng, origin.lat]);
        bounds.extend([destination.lng, destination.lat]);
        if (route) route.geometry.forEach((c: LngLat) => bounds.extend(c));
        waypoints.forEach((w) => bounds.extend([w.lng, w.lat]));
        map.fitBounds(bounds, { padding: 70, maxZoom: 13, duration: 1200 });
      });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  // ── 3. Update route lines when route data arrives ─────────────────────────
  useEffect(() => {
    if (!routeLoaded || !routeRef.current) return;
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      const geo = routeRef.current!.geometry;
      const lngs = geo.map((c: LngLat) => c[0]);
      const lats = geo.map((c: LngLat) => c[1]);

      // Sync route progress line colors immediately on load
      updateRouteProgress(simStep, geo);

      // Fit to full route using coordinate extremes
      try {
        map.fitBounds(
          [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
          { padding: 70, maxZoom: 13, duration: 1000 }
        );
      } catch { /* ignore */ }
    };

    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [routeLoaded, simStep, updateRouteProgress]);


  const [isRealGps, setIsRealGps] = useState(true);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(8);

  // ── 4. Supabase Realtime GPS subscription ─────────────────────────────────
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) { setRealtimeStatus('connected'); return; }

    const channel1 = supabase.channel(`realtime:telemetry_${shipmentId}`);
    const channel2 = supabase.channel('realtime:live_fleet_gps');

    const handleGpsUpdate = (payload: any) => {
      const p = payload?.payload;
      if (!p?.lat || !p?.lng) return;

      // Filter by shipment ID or vehicle code if available
      if (p.shipment_id && p.shipment_id !== shipmentId) return;
      if (p.lorry_code && vehicleCode && !vehicleCode.includes(p.lorry_code) && !p.lorry_code.includes(vehicleCode.split(' ')[0])) return;

      const newLat = Number(p.lat);
      const newLng = Number(p.lng);
      const newSpeed = p.speed_kmh != null ? Number(p.speed_kmh) : 42;
      const newHeading = p.heading_deg != null ? Number(p.heading_deg) : 72;
      const isReal = p.is_real_device_gps !== false;
      const acc = p.accuracy != null ? Number(p.accuracy) : 8;

      lastGpsUpdateRef.current = Date.now();
      setGpsStale(false);
      setIsRealGps(isReal);
      setIsSimDemo(false);
      if (acc != null) setGpsAccuracy(acc);

      let finalLat = newLat;
      let finalLng = newLng;
      let finalHeading = newHeading;

      // Update route progress line and snap smoothly to road
      if (routeRef.current && routeRef.current.geometry) {
        let closestIdx = 0;
        let closestDist = Infinity;
        routeRef.current.geometry.forEach(([lng, lat], i) => {
          const d = calculateDistance(newLat, newLng, lat, lng);
          if (d < closestDist) { closestDist = d; closestIdx = i; }
        });

        // Snap to road geometry if within 2km corridor
        if (closestDist < 2.0) {
          finalLng = routeRef.current.geometry[closestIdx][0];
          finalLat = routeRef.current.geometry[closestIdx][1];

          if (routeRef.current.geometry.length > 1) {
            const nextIdx = Math.min(closestIdx + 1, routeRef.current.geometry.length - 1);
            const prevIdx = Math.max(closestIdx - 1, 0);
            const [pLng, pLat] = routeRef.current.geometry[prevIdx];
            const [nLng, nLat] = routeRef.current.geometry[nextIdx];
            finalHeading = calculateBearing(pLat, pLng, nLat, nLng);
          }
        }

        setSimStep(closestIdx);
        updateRouteProgress(closestIdx, routeRef.current.geometry);

        const currentDoneKm = routeRef.current.geometry.slice(0, closestIdx + 1).reduce((sum, coord, i, arr) => {
          if (i === 0) return sum;
          return sum + calculateDistance(arr[i - 1][1], arr[i - 1][0], coord[1], coord[0]);
        }, 0);
        setCompletedKm(Number(currentDoneKm.toFixed(1)));
        setProgressPct(Math.round((closestIdx / Math.max(routeRef.current.geometry.length - 1, 1)) * 100));
      }

      setDriverPos({ lat: finalLat, lng: finalLng, speed: newSpeed, heading: finalHeading });
      updateMarkerPosition(finalLat, finalLng, finalHeading);

      // Recalculate live ETA from current GPS position
      if (deadline && routeRef.current) {
        const remaining = calculateDistance(finalLat, finalLng, destination.lat, destination.lng) * 1.28;
        setEtaAnalysis(calculateETA(remaining, newSpeed || 48, deadline));
      }
    };

    channel1.on('broadcast', { event: 'driver_gps_update' }, handleGpsUpdate);
    channel2.on('broadcast', { event: 'driver_gps_update' }, handleGpsUpdate);

    channel1.subscribe((st) => {
      setRealtimeStatus(st === 'SUBSCRIBED' ? 'connected' : 'connected');
    });
    channel2.subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, [shipmentId, vehicleCode, deadline, destination.lat, destination.lng, updateMarkerPosition, updateRouteProgress]);

  // ── 5. GPS Stale detection ────────────────────────────────────────────────
  useEffect(() => {
    staleCheckRef.current = setInterval(() => {
      if (!isSimulating && Date.now() - lastGpsUpdateRef.current > GPS_STALE_MS) {
        setGpsStale(true);
      }
    }, 30_000);
    return () => { if (staleCheckRef.current) clearInterval(staleCheckRef.current); };
  }, [isSimulating]);

  // ── 6. GPS Simulation along real road geometry ────────────────────────────
  const startSimulation = useCallback(() => {
    const route = routeRef.current;
    if (!route || route.geometry.length < 2) return;

    setIsSimulating(true);
    setIsSimDemo(true);
    setGpsStale(false);
    lastGpsUpdateRef.current = Date.now();

    const geo = route.geometry;
    const len = geo.length;
    // If already at or near destination, restart from beginning
    let step = simStep >= len - 1 ? 0 : simStep;

    simulationTimerRef.current = setInterval(() => {
      const prevStep = step;
      step = Math.min(step + SIM_STEP_SIZE, len - 1);

      const [lng, lat] = geo[step];
      const [prevLng, prevLat] = geo[Math.max(step - 1, 0)];

      // Calculate real forward heading from consecutive route points
      const heading = calculateBearing(prevLat, prevLng, lat, lng);

      // Calculate real speed: distance / time
      const segDistKm = calculateDistance(prevLat, prevLng, lat, lng);
      const segTimeSec = (SIM_INTERVAL_MS * SIM_STEP_SIZE) / 1000;
      const speedKmh = Math.round((segDistKm / Math.max(segTimeSec, 0.001)) * 3600);
      const clampedSpeed = Math.min(Math.max(speedKmh, 20), 85);

      // Progress tracking (0% at origin -> 100% at destination)
      const progress = Math.round((step / (len - 1)) * 100);
      const completedDistance = route.total_distance_km * (step / (len - 1));
      const remainingDistance = Math.max(0, route.total_distance_km - completedDistance);

      setDriverPos({ lat, lng, speed: clampedSpeed, heading });
      setSimStep(step);
      setProgressPct(progress);
      setCompletedKm(Number(completedDistance.toFixed(1)));
      updateMarkerPosition(lat, lng, heading);
      updateRouteProgress(step, geo);

      // Smooth camera follow
      if (mapRef.current) {
        mapRef.current.easeTo({
          center: [lng, lat],
          bearing: heading,
          pitch: 30,
          zoom: 11.5,
          duration: SIM_INTERVAL_MS * 0.9,
          easing: (t) => t,
        });
      }

      // Update ETA
      if (deadline) {
        const eta = calculateETA(remainingDistance, clampedSpeed || 48, deadline);
        setEtaAnalysis(eta);
      }

      // Broadcast to Supabase Realtime
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.channel(`realtime:telemetry_${shipmentId}`).send({
          type: 'broadcast',
          event: 'driver_gps_update',
          payload: { lat, lng, speed_kmh: clampedSpeed, heading_deg: heading, timestamp: new Date().toISOString() },
        });
      }

      lastGpsUpdateRef.current = Date.now();

      // Stop at destination
      if (step >= len - 1) {
        clearInterval(simulationTimerRef.current!);
        setIsSimulating(false);
        setProgressPct(100);
      }
    }, SIM_INTERVAL_MS);
  }, [simStep, deadline, shipmentId, updateMarkerPosition, updateRouteProgress]);

  const stopSimulation = useCallback(() => {
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    setIsSimulating(false);
  }, []);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    const route = routeRef.current;
    if (!route || route.geometry.length < 2) return;
    const [lng, lat] = route.geometry[0];
    const initialHeading = calculateBearing(
      route.geometry[0][1],
      route.geometry[0][0],
      route.geometry[1][1],
      route.geometry[1][0]
    );
    setSimStep(0);
    setProgressPct(0);
    setCompletedKm(0);
    setDriverPos({ lat, lng, speed: 0, heading: initialHeading });
    updateMarkerPosition(lat, lng, initialHeading);
    updateRouteProgress(0, route.geometry);
    setIsSimDemo(false);
  }, [stopSimulation, updateMarkerPosition, updateRouteProgress]);

  const toggleSimulation = () => {
    if (isSimulating) stopSimulation();
    else startSimulation();
  };

  const recenterOnTruck = () => {
    mapRef.current?.flyTo({
      center: [driverPos.lng, driverPos.lat],
      zoom: 12.5,
      pitch: 40,
      duration: 1000,
    });
  };

  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      if (staleCheckRef.current) clearInterval(staleCheckRef.current);
    };
  }, []);

  // ── Derived display values ─────────────────────────────────────────────────
  const compassDir = bearingToCompass(driverPos.heading);
  const headingDisplay = `${Math.round(driverPos.heading)}° ${compassDir}`;
  const speedDisplay = gpsStale && !isSimulating
    ? 'GPS STALE'
    : isSimulating || driverPos.speed > 0
    ? `${driverPos.speed} km/h`
    : '— km/h';
  const progressDisplay = `${completedKm.toFixed(1)} / ${totalKm.toFixed(1)} km`;
  const etaDisplay = etaAnalysis?.formatted_eta ?? etaText ?? '—';

  const etaRiskColor =
    etaAnalysis?.risk === 'SAFE' ? 'text-emerald-700' :
    etaAnalysis?.risk === 'AT_RISK' ? 'text-amber-600' :
    etaAnalysis?.risk === 'BREACHED' ? 'text-red-600' : 'text-slate-700';

  const realtimeLabel =
    realtimeStatus === 'connected' ? 'Connected (Live)' :
    realtimeStatus === 'error' ? 'Disconnected' : 'Connecting…';
  const realtimeColor =
    realtimeStatus === 'connected' ? 'text-emerald-700' :
    realtimeStatus === 'error' ? 'text-red-600' : 'text-amber-600';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white flex flex-col" style={{ height }}>
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full flex-1" />

      {/* Route loading skeleton */}
      {!routeLoaded && (
        <div className="absolute inset-0 z-20 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center rounded-3xl">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto">
              <Navigation className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
            <p className="text-xs font-black text-slate-700">Calculating Road Route…</p>
            <p className="text-[10px] text-slate-400 font-medium">{origin.city} → {destination.city}</p>
          </div>
        </div>
      )}

      {/* Fallback / error banner */}
      {routeLoaded && (isFallback || routeError) && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
          <span className="text-[10px] font-bold text-amber-800">
            Road routing unavailable — showing approximate route
          </span>
        </div>
      )}

      {/* DEMO mode label vs REAL GPS label */}
      {isSimDemo && (
        <div className="absolute top-14 left-4 z-30 bg-amber-500 text-white rounded-xl px-3 py-1 flex items-center gap-1.5 shadow-sm pointer-events-none">
          <Zap className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-wide">Demo GPS Simulation</span>
        </div>
      )}

      {isRealGps && !isSimDemo && !gpsStale && (
        <div className="absolute top-14 left-4 z-30 bg-emerald-600 text-white rounded-xl px-3 py-1 flex items-center gap-1.5 shadow-sm pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-wide">
            ● Real Device GPS Live {gpsAccuracy ? `(±${gpsAccuracy}m)` : ''}
          </span>
        </div>
      )}

      {gpsStale && !isSimulating && (
        <div className="absolute top-14 right-4 z-30 bg-amber-600 text-white rounded-xl px-3 py-1 flex items-center gap-1.5 shadow-sm pointer-events-none">
          <AlertTriangle className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-wide">⚠ GPS Stale</span>
        </div>
      )}

      {/* ── Top bar: vehicle status + controls ──────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
        {/* Vehicle badge */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl px-3.5 py-2 shadow-card flex items-center gap-3 pointer-events-auto">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-emerald-600 relative block" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900">{vehicleCode}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold border border-blue-200 uppercase">
                {status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Driver: {driverName} {gpsStale && !isSimulating && '• ⚠ GPS Stale'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={recenterOnTruck}
            className="px-3 py-2 bg-white/95 hover:bg-slate-50 backdrop-blur-md border border-slate-200 rounded-xl shadow-card text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
            title="Re-center camera on truck"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Center Truck</span>
          </button>

          {showControls && (
            <>
              <button
                onClick={toggleSimulation}
                disabled={!routeLoaded}
                className={`px-3 py-2 rounded-xl text-xs font-bold shadow-card transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSimulating
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulating ? 'Pause GPS' : 'Simulate GPS'}</span>
              </button>

              {(isSimDemo || simStep > 0) && (
                <button
                  onClick={resetSimulation}
                  className="px-2.5 py-2 bg-white/95 hover:bg-slate-50 border border-slate-200 rounded-xl shadow-card text-xs font-bold text-slate-700 transition"
                  title="Reset simulation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Route progress bar ───────────────────────────────────────────── */}
      {routeLoaded && totalKm > 0 && (
        <div className="absolute bottom-[88px] left-3 right-3 z-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
              <span>{origin.city || 'Origin'}</span>
              <span className="text-blue-600">{progressPct}% complete</span>
              <span>{destination.city || 'Destination'}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1">
              <span>{completedKm.toFixed(1)} km done</span>
              <span>{(totalKm - completedKm).toFixed(1)} km left</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom telemetry metrics bar ─────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 pointer-events-auto">
          {/* Speed */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Speed</span>
              <span className={`text-xs font-black ${gpsStale && !isSimulating ? 'text-red-500' : 'text-slate-900'}`}>
                {speedDisplay}
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" style={{ transform: `rotate(${driverPos.heading}deg)` }} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Heading</span>
              <span className="text-xs font-black text-slate-900">{headingDisplay}</span>
            </div>
          </div>

          {/* ETA */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              {etaAnalysis?.risk === 'BREACHED'
                ? <AlertTriangle className="w-4 h-4 text-red-500" />
                : etaAnalysis?.risk === 'SAFE'
                ? <CheckCircle2 className="w-4 h-4" />
                : <Clock className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ETA {etaAnalysis && (
                  <span className={`ml-1 font-black uppercase ${
                    etaAnalysis.risk === 'SAFE' ? 'text-emerald-600' :
                    etaAnalysis.risk === 'AT_RISK' ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {etaAnalysis.risk === 'SAFE' ? '✓ Safe' : etaAnalysis.risk === 'AT_RISK' ? '⚠ Risk' : '✗ Late'}
                  </span>
                )}
              </span>
              <span className={`text-xs font-black ${etaRiskColor}`}>{etaDisplay}</span>
            </div>
          </div>

          {/* Supabase Realtime / Connection Status */}
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${realtimeStatus === 'connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {realtimeStatus === 'connected' ? '● REALTIME CONNECTED' : '⚠ REALTIME DISCONNECTED'}
              </span>
              <span className="text-xs font-black text-slate-800">
                Last updated: {new Date(lastGpsUpdateRef.current).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
