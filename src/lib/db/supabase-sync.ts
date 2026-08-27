import { getSupabaseClient } from './supabase';
import { fleetMindStore } from './store';
import { Shipment, Lorry, Driver, Trip, NotificationItem } from '../optimization/types';
import { UserProfile } from '../../types/database';

// Helper to ensure valid UUID format for PostgreSQL UUID columns
export function ensureUUID(id?: string): string {
  if (!id) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return '00000000-0000-4000-8000-' + Math.random().toString(16).substring(2, 14).padEnd(12, '0');
  }

  // Check if already valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;

  // Deterministically convert any custom ID to a valid pseudo-UUID
  const hex = Array.from(id)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
    .padEnd(32, '0')
    .slice(0, 32);

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

let isInitialized = false;

/**
 * Initializes bidirectional synchronization between Supabase PostgreSQL and the local state store.
 * Supabase is the AUTHORITATIVE SINGLE SOURCE OF TRUTH.
 */
export async function initSupabaseStoreSync() {
  if (isInitialized) return;
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('[Supabase Sync] Supabase client not configured. Running in offline/local mode.');
    return;
  }

  isInitialized = true;

  try {
    // 1. Initial Load: Fetch ALL records from Supabase tables
    const [profilesRes, vehiclesRes, driversRes, shipmentsRes, tripsRes, notifsRes] = await Promise.allSettled([
      supabase.from('profiles').select('*'),
      supabase.from('vehicles').select('*'),
      supabase.from('drivers').select('*'),
      supabase.from('shipments').select('*').order('created_at', { ascending: false }),
      supabase.from('trips').select('*').order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    // --- PROFILES ---
    if (profilesRes.status === 'fulfilled' && profilesRes.value.data && profilesRes.value.data.length > 0) {
      const supabaseProfiles = profilesRes.value.data;
      const supabaseEmails = new Set(supabaseProfiles.map((p: any) => p.email));
      const supabaseUids = new Set(supabaseProfiles.map((p: any) => p.firebase_uid).filter(Boolean));

      const localOnlyUsers = fleetMindStore.getUsers().filter(
        (u) => !supabaseEmails.has(u.email) && !supabaseUids.has(u.firebase_uid)
      );

      fleetMindStore.replaceUsers([
        ...supabaseProfiles.map((p: any) => ({
          id: p.id,
          firebase_uid: p.firebase_uid,
          email: p.email,
          full_name: p.full_name,
          role: p.role,
          phone: p.phone,
          avatar_url: p.avatar_url,
          is_active: p.is_active,
          company_name: p.company_name,
          created_at: p.created_at,
        })),
        ...localOnlyUsers,
      ]);

      for (const u of localOnlyUsers) {
        syncProfileToSupabase(u);
      }
    } else if (profilesRes.status === 'fulfilled' && profilesRes.value.data) {
      const localUsers = fleetMindStore.getUsers();
      for (const u of localUsers) {
        syncProfileToSupabase(u);
      }
    }

    // --- VEHICLES ---
    if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value.data && vehiclesRes.value.data.length > 0) {
      const supabaseVehicles = vehiclesRes.value.data;
      const supabaseLorryCodes = new Set(supabaseVehicles.map((v: any) => v.lorry_code));
      const supabaseVehicleIds = new Set(supabaseVehicles.map((v: any) => v.id));

      const localOnlyLorries = fleetMindStore.getLorries().filter(
        (l) => !supabaseLorryCodes.has(l.lorry_code) && !supabaseVehicleIds.has(l.id)
      );

      fleetMindStore.replaceLorries([
        ...supabaseVehicles.map((v: any) => ({
          id: v.id,
          lorry_code: v.lorry_code,
          registration_number: v.registration_number,
          model: v.model,
          max_weight_kg: Number(v.max_weight_kg),
          max_volume_m3: Number(v.max_volume_m3),
          fuel_efficiency_km_per_l: Number(v.fuel_efficiency_km_per_l),
          current_lat: Number(v.current_lat || 13.0827),
          current_lng: Number(v.current_lng || 80.2707),
          current_address: v.current_address || 'Regional Freight Depot',
          status: v.status || 'AVAILABLE',
          is_refrigerated: v.is_refrigerated || false,
          driver_id: v.driver_id || undefined,
          assigned_driver_name: v.assigned_driver_name || undefined,
          created_at: v.created_at,
          updated_at: v.updated_at,
        })),
        ...localOnlyLorries,
      ]);

      for (const l of localOnlyLorries) {
        syncVehicleToSupabase(l);
      }
    } else if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value.data) {
      const localLorries = fleetMindStore.getLorries();
      for (const l of localLorries) {
        syncVehicleToSupabase(l);
      }
    }

    // --- DRIVERS ---
    if (driversRes.status === 'fulfilled' && driversRes.value.data && driversRes.value.data.length > 0) {
      const supabaseDrivers = driversRes.value.data;
      const supabaseDriverIds = new Set(supabaseDrivers.map((d: any) => d.id));

      const localOnlyDrivers = fleetMindStore.getDrivers().filter(
        (d) => !supabaseDriverIds.has(d.id)
      );

      fleetMindStore.replaceDrivers([
        ...supabaseDrivers.map((d: any) => ({
          id: d.id,
          name: d.name,
          phone: d.phone || '+91 00000 00000',
          email: d.email,
          license_number: d.license_number || 'PENDING',
          current_lat: Number(d.current_lat || 13.0827),
          current_lng: Number(d.current_lng || 80.2707),
          availability_status: d.availability_status || 'AVAILABLE',
          shift_start: d.shift_start || '06:00',
          shift_end: d.shift_end || '18:00',
          performance_score: d.performance_score || 95,
          total_deliveries: d.total_deliveries || 0,
          assigned_lorry_id: d.assigned_lorry_id || undefined,
          created_at: d.created_at,
          updated_at: d.updated_at,
        })),
        ...localOnlyDrivers,
      ]);

      for (const d of localOnlyDrivers) {
        syncDriverToSupabase(d);
      }
    } else if (driversRes.status === 'fulfilled' && driversRes.value.data) {
      const localDrivers = fleetMindStore.getDrivers();
      for (const d of localDrivers) {
        syncDriverToSupabase(d);
      }
    }

    // --- SHIPMENTS ---
    if (shipmentsRes.status === 'fulfilled' && shipmentsRes.value.data && shipmentsRes.value.data.length > 0) {
      const supabaseShipments = shipmentsRes.value.data;
      const supabaseShipmentCodes = new Set(supabaseShipments.map((s: any) => s.shipment_code));
      const supabaseShipmentIds = new Set(supabaseShipments.map((s: any) => s.id));

      const localOnlyShipments = fleetMindStore.getShipments().filter(
        (s) => !supabaseShipmentCodes.has(s.shipment_code) && !supabaseShipmentIds.has(s.id)
      );

      fleetMindStore.replaceShipments([
        ...supabaseShipments.map((s: any) => ({
          id: s.id,
          shipment_code: s.shipment_code,
          customer_id: s.customer_id || 'cust-direct',
          customer_name: s.customer_name || 'Commercial Client',
          customer_email: s.customer_email || '',
          sender_name: s.sender_name,
          sender_company: s.sender_company,
          sender_phone: s.sender_phone,
          sender_email: s.sender_email,
          receiver_name: s.receiver_name,
          receiver_company: s.receiver_company,
          receiver_phone: s.receiver_phone,
          receiver_email: s.receiver_email,
          description: s.description || 'Commercial Freight',
          weight_kg: Number(s.weight_kg),
          volume_m3: Number(s.volume_m3 || 1),
          package_count: Number(s.package_count || 1),
          fragile: s.fragile || false,
          category: s.category || 'GENERAL',
          priority: s.priority || 'MEDIUM',
          special_instructions: s.special_instructions,
          pickup_address: s.pickup_address || '',
          pickup_city: s.pickup_city || '',
          pickup_lat: Number(s.pickup_lat || 13.0827),
          pickup_lng: Number(s.pickup_lng || 80.2707),
          pickup_time: s.pickup_time,
          destination_address: s.destination_address || '',
          destination_city: s.destination_city || '',
          destination_lat: Number(s.destination_lat || 12.9716),
          destination_lng: Number(s.destination_lng || 77.5946),
          delivery_deadline: s.delivery_deadline,
          status: s.status || 'PENDING',
          assigned_lorry_id: s.assigned_lorry_id,
          assigned_lorry_code: s.assigned_lorry_code,
          assigned_driver_id: s.assigned_driver_id,
          assigned_driver_name: s.assigned_driver_name,
          otp_code: s.otp_code,
          otp_verified_at: s.otp_verified_at,
          signature_path: s.signature_path,
          proof_of_delivery_path: s.proof_of_delivery_path,
          receiver_verified_name: s.receiver_verified_name,
          delivery_notes: s.delivery_notes,
          created_at: s.created_at,
          updated_at: s.updated_at,
        })),
        ...localOnlyShipments,
      ]);

      for (const s of localOnlyShipments) {
        syncShipmentToSupabase(s as Shipment);
      }
    } else if (shipmentsRes.status === 'fulfilled' && shipmentsRes.value.data) {
      const localShipments = fleetMindStore.getShipments();
      for (const s of localShipments) {
        syncShipmentToSupabase(s);
      }
    }

    // Save authoritative truth to local storage for fast initial render
    fleetMindStore.saveToLocalStorage();

    // 2. Realtime WebSocket Subscription across all tables
    supabase
      .channel('fleetmind-unified-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const s = payload.new as any;
          const existing = fleetMindStore.getShipmentById(s.id) || fleetMindStore.getShipmentById(s.shipment_code);
          if (!existing) {
            fleetMindStore.createShipment({
              id: s.id,
              shipment_code: s.shipment_code,
              customer_id: s.customer_id,
              customer_name: s.customer_name,
              customer_email: s.customer_email,
              description: s.description,
              weight_kg: Number(s.weight_kg),
              volume_m3: Number(s.volume_m3),
              category: s.category,
              priority: s.priority,
              pickup_address: s.pickup_address,
              pickup_city: s.pickup_city,
              pickup_lat: Number(s.pickup_lat),
              pickup_lng: Number(s.pickup_lng),
              destination_address: s.destination_address,
              destination_city: s.destination_city,
              destination_lat: Number(s.destination_lat),
              destination_lng: Number(s.destination_lng),
              delivery_deadline: s.delivery_deadline,
              status: s.status,
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          const s = payload.new as any;
          const existing = fleetMindStore.getShipmentById(s.id) || fleetMindStore.getShipmentById(s.shipment_code);
          if (existing) {
            existing.status = s.status;
            if (s.assigned_lorry_id) existing.assigned_lorry_id = s.assigned_lorry_id;
            if (s.assigned_lorry_code) existing.assigned_lorry_code = s.assigned_lorry_code;
            if (s.assigned_driver_id) existing.assigned_driver_id = s.assigned_driver_id;
            if (s.assigned_driver_name) existing.assigned_driver_name = s.assigned_driver_name;
            if (s.otp_code) existing.otp_code = s.otp_code;
            if (s.otp_verified_at) existing.otp_verified_at = s.otp_verified_at;
            if (s.signature_path) existing.signature_path = s.signature_path;
            if (s.proof_of_delivery_path) existing.proof_of_delivery_path = s.proof_of_delivery_path;
            if (s.receiver_verified_name) existing.receiver_verified_name = s.receiver_verified_name;
            if (s.delivery_notes) existing.delivery_notes = s.delivery_notes;
            existing.updated_at = s.updated_at || new Date().toISOString();
            fleetMindStore.saveToLocalStorage();
            fleetMindStore.notify('SHIPMENT_UPDATED', existing);
          }
        } else if (payload.eventType === 'DELETE') {
          const old = payload.old as any;
          if (old?.id) {
            fleetMindStore.deleteShipment(old.id);
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const v = payload.new as any;
          const existing = fleetMindStore.getLorryById(v.id) || fleetMindStore.getLorryById(v.lorry_code);
          if (!existing) {
            fleetMindStore.createLorry({
              id: v.id,
              lorry_code: v.lorry_code,
              registration_number: v.registration_number,
              model: v.model,
              max_weight_kg: Number(v.max_weight_kg),
              max_volume_m3: Number(v.max_volume_m3),
              fuel_efficiency_km_per_l: Number(v.fuel_efficiency_km_per_l),
              status: v.status,
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          const v = payload.new as any;
          const existing = fleetMindStore.getLorryById(v.id) || fleetMindStore.getLorryById(v.lorry_code);
          if (existing) {
            existing.status = v.status;
            existing.current_lat = Number(v.current_lat || existing.current_lat);
            existing.current_lng = Number(v.current_lng || existing.current_lng);
            existing.current_address = v.current_address || existing.current_address;
            existing.driver_id = v.driver_id;
            existing.assigned_driver_name = v.assigned_driver_name;
            fleetMindStore.saveToLocalStorage();
            fleetMindStore.notify('LORRY_UPDATED', existing);
          }
        } else if (payload.eventType === 'DELETE') {
          const old = payload.old as any;
          if (old?.id) fleetMindStore.deleteLorry(old.id);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const d = payload.new as any;
          const existing = fleetMindStore.getDriverById(d.id);
          if (!existing) {
            fleetMindStore.createDriver({
              id: d.id,
              name: d.name,
              phone: d.phone,
              license_number: d.license_number,
              availability_status: d.availability_status,
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          const d = payload.new as any;
          const existing = fleetMindStore.getDriverById(d.id);
          if (existing) {
            existing.availability_status = d.availability_status;
            existing.current_lat = Number(d.current_lat || existing.current_lat);
            existing.current_lng = Number(d.current_lng || existing.current_lng);
            existing.assigned_lorry_id = d.assigned_lorry_id;
            existing.performance_score = d.performance_score;
            existing.total_deliveries = d.total_deliveries;
            fleetMindStore.saveToLocalStorage();
            fleetMindStore.notify('DRIVER_UPDATED', existing);
          }
        } else if (payload.eventType === 'DELETE') {
          const old = payload.old as any;
          if (old?.id) fleetMindStore.deleteDriver(old.id);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const p = payload.new as any;
          const existing = fleetMindStore.getUserByEmail(p.email) || fleetMindStore.getUserByUid(p.firebase_uid);
          if (existing) {
            existing.role = p.role;
            existing.is_active = p.is_active;
            existing.full_name = p.full_name || existing.full_name;
            fleetMindStore.saveToLocalStorage();
            fleetMindStore.notify('USER_UPDATED', existing);
          } else {
            fleetMindStore.createUser({
              id: p.id,
              firebase_uid: p.firebase_uid,
              email: p.email,
              full_name: p.full_name,
              role: p.role,
              is_active: p.is_active,
            });
          }
        } else if (payload.eventType === 'DELETE') {
          const old = payload.old as any;
          if (old?.id || old?.email) fleetMindStore.deleteUser(old.id || old.email);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const n = payload.new as any;
          fleetMindStore.createNotification({
            user_id: n.user_id || n.user_email,
            type: n.type,
            title: n.title,
            message: n.message,
            severity: n.severity,
            action_url: n.entity_id ? `/customer/shipments/${n.entity_id}` : undefined,
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gps_locations' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const g = payload.new as any;
          fleetMindStore.updateDriverGPSLocation({
            driver_id: g.driver_id,
            latitude: Number(g.latitude),
            longitude: Number(g.longitude),
            speed: Number(g.speed || 0),
            heading: Number(g.heading || 0),
          });
        }
      })
      .subscribe((status) => {
        console.log(`[Supabase Realtime] Channel status: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Multi-device live synchronization connected.');
        }
      });

  } catch (err) {
    console.warn('[Supabase Sync] Hydration/Subscription non-blocking warning:', err);
  }
}

/**
 * Persists a shipment to Supabase PostgreSQL.
 */
export async function syncShipmentToSupabase(shipment: Shipment): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const payload = {
      id: ensureUUID(shipment.id),
      shipment_code: shipment.shipment_code,
      customer_id: ensureUUID(shipment.customer_id),
      customer_name: shipment.customer_name || 'Commercial Shipper',
      customer_email: shipment.customer_email || 'customer@fleetmind.ai',
      sender_name: shipment.sender_name || shipment.customer_name || 'Sender',
      sender_company: shipment.sender_company || 'Freight Client Co.',
      sender_phone: shipment.sender_phone || '+91 98400 11223',
      sender_email: shipment.sender_email || shipment.customer_email,
      pickup_address: shipment.pickup_address || 'Chennai Central Freight Hub',
      pickup_city: shipment.pickup_city || 'Chennai',
      pickup_lat: shipment.pickup_lat || 13.0827,
      pickup_lng: shipment.pickup_lng || 80.2707,
      pickup_time: shipment.pickup_time || null,
      receiver_name: shipment.receiver_name || 'Consignee Recipient',
      receiver_company: shipment.receiver_company || 'Industrial Receivers Ltd',
      receiver_phone: shipment.receiver_phone || '+91 98401 22334',
      receiver_email: shipment.receiver_email,
      destination_address: shipment.destination_address || 'Bengaluru Logistics Park',
      destination_city: shipment.destination_city || 'Bengaluru',
      destination_lat: shipment.destination_lat || 12.9716,
      destination_lng: shipment.destination_lng || 77.5946,
      delivery_deadline: shipment.delivery_deadline || new Date(Date.now() + 86400000).toISOString(),
      description: shipment.description || 'Commercial Freight Cargo',
      category: shipment.category || 'GENERAL',
      weight_kg: Number(shipment.weight_kg),
      volume_m3: Number(shipment.volume_m3),
      package_count: Number(shipment.package_count || 1),
      fragile: Boolean(shipment.fragile),
      priority: shipment.priority || 'MEDIUM',
      special_instructions: shipment.special_instructions || null,
      status: shipment.status || 'PENDING_REVIEW',
      assigned_lorry_id: shipment.assigned_lorry_id ? ensureUUID(shipment.assigned_lorry_id) : null,
      assigned_lorry_code: shipment.assigned_lorry_code || null,
      assigned_driver_id: shipment.assigned_driver_id ? ensureUUID(shipment.assigned_driver_id) : null,
      assigned_driver_name: shipment.assigned_driver_name || null,
      otp_code: shipment.otp_code || null,
      otp_verified_at: shipment.otp_verified_at || null,
      signature_path: shipment.signature_path || null,
      proof_of_delivery_path: shipment.proof_of_delivery_path || null,
      receiver_verified_name: shipment.receiver_verified_name || null,
      delivery_notes: shipment.delivery_notes || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('shipments').upsert(payload, { onConflict: 'shipment_code' });
    if (error) {
      console.warn('[Supabase Sync] Shipments upsert notice:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase Sync] Failed to sync shipment to Supabase:', err);
  }
}

/**
 * Persists a vehicle/lorry to Supabase PostgreSQL.
 */
export async function syncVehicleToSupabase(lorry: Lorry): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const payload = {
      id: ensureUUID(lorry.id),
      lorry_code: lorry.lorry_code,
      registration_number: lorry.registration_number,
      model: lorry.model,
      max_weight_kg: Number(lorry.max_weight_kg),
      max_volume_m3: Number(lorry.max_volume_m3),
      fuel_efficiency_km_per_l: Number(lorry.fuel_efficiency_km_per_l),
      current_lat: Number(lorry.current_lat || 13.0827),
      current_lng: Number(lorry.current_lng || 80.2707),
      current_address: lorry.current_address || 'Regional Freight Depot',
      status: lorry.status || 'AVAILABLE',
      is_refrigerated: Boolean(lorry.is_refrigerated),
      driver_id: lorry.driver_id ? ensureUUID(lorry.driver_id) : null,
      assigned_driver_name: lorry.assigned_driver_name || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('vehicles').upsert(payload, { onConflict: 'lorry_code' });
    if (error) {
      console.warn('[Supabase Sync] Vehicles upsert notice:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase Sync] Failed to sync vehicle to Supabase:', err);
  }
}

/**
 * Persists a driver to Supabase PostgreSQL.
 */
export async function syncDriverToSupabase(driver: Driver): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const payload = {
      id: ensureUUID(driver.id),
      name: driver.name,
      phone: driver.phone,
      license_number: driver.license_number,
      current_lat: Number(driver.current_lat || 13.0827),
      current_lng: Number(driver.current_lng || 80.2707),
      availability_status: driver.availability_status || 'AVAILABLE',
      shift_start: driver.shift_start || '06:00',
      shift_end: driver.shift_end || '18:00',
      assigned_lorry_id: driver.assigned_lorry_id ? ensureUUID(driver.assigned_lorry_id) : null,
      performance_score: driver.performance_score || 95,
      total_deliveries: driver.total_deliveries || 0,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('drivers').upsert(payload, { onConflict: 'license_number' });
    if (error) {
      console.warn('[Supabase Sync] Drivers upsert notice:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase Sync] Failed to sync driver to Supabase:', err);
  }
}

/**
 * Persists a user profile to Supabase PostgreSQL.
 */
export async function syncProfileToSupabase(user: UserProfile): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const payload = {
      id: ensureUUID(user.id),
      firebase_uid: user.firebase_uid,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
      phone: user.phone,
      is_active: user.is_active !== undefined ? user.is_active : true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'email' });
    if (error) {
      console.warn('[Supabase Sync] Profiles upsert notice:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase Sync] Failed to sync profile to Supabase:', err);
  }
}

/**
 * Inserts live GPS telemetry to Supabase.
 */
export async function syncGpsTelemetryToSupabase(telemetry: {
  driver_id: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('gps_locations').insert({
      driver_id: ensureUUID(telemetry.driver_id),
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      speed: telemetry.speed || 0,
      heading: telemetry.heading || 0,
      recorded_at: new Date().toISOString(),
    });
  } catch (err) {
    // Non-blocking telemetry
  }
}

/**
 * Persists a notification to Supabase PostgreSQL.
 */
export async function syncNotificationToSupabase(notif: NotificationItem): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const userId = (notif as any).user_id || (notif as any).recipient_role || 'ALL';
    await supabase.from('notifications').insert({
      id: ensureUUID(notif.id),
      user_id: userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      severity: notif.severity || 'LOW',
      is_read: Boolean(notif.is_read),
      entity_type: notif.entity_type,
      entity_id: notif.entity_id,
      created_at: notif.timestamp || new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Supabase Sync] Notification sync notice:', err);
  }
}

/**
 * Deletes a shipment from Supabase PostgreSQL.
 */
export async function deleteShipmentFromSupabase(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase.from('shipments').delete().or(`id.eq.${id},id.eq.${ensureUUID(id)},shipment_code.eq.${id}`);
  } catch (err) {
    console.warn('[Supabase Sync] Shipment delete notice:', err);
  }
}

/**
 * Deletes a vehicle from Supabase PostgreSQL.
 */
export async function deleteVehicleFromSupabase(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase.from('vehicles').delete().or(`id.eq.${id},id.eq.${ensureUUID(id)},lorry_code.eq.${id}`);
  } catch (err) {
    console.warn('[Supabase Sync] Vehicle delete notice:', err);
  }
}

/**
 * Deletes a driver from Supabase PostgreSQL.
 */
export async function deleteDriverFromSupabase(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase.from('drivers').delete().or(`id.eq.${id},id.eq.${ensureUUID(id)}`);
  } catch (err) {
    console.warn('[Supabase Sync] Driver delete notice:', err);
  }
}

/**
 * Deletes a user profile from Supabase PostgreSQL.
 */
export async function deleteProfileFromSupabase(idOrEmail: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase.from('profiles').delete().or(`id.eq.${idOrEmail},id.eq.${ensureUUID(idOrEmail)},email.eq.${idOrEmail}`);
  } catch (err) {
    console.warn('[Supabase Sync] Profile delete notice:', err);
  }
}
