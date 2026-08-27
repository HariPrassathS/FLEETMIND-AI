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
export async function initSupabaseStoreSync(force = false) {
  if (isInitialized && !force) return;
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
        ...supabaseShipments.map((s: any) => {
          const existingLocal = fleetMindStore.getShipmentById(s.id) || fleetMindStore.getShipmentById(s.shipment_code);
          const isLocalDelivered = existingLocal?.status === 'DELIVERED';
          const resolvedStatus = isLocalDelivered ? 'DELIVERED' : (s.status || 'PENDING');

          const mappedShipment: Shipment = {
            id: s.id,
            shipment_code: s.shipment_code,
            customer_id: s.customer_id || existingLocal?.customer_id || 'cust-direct',
            customer_name: s.customer_name || existingLocal?.customer_name || 'Commercial Client',
            customer_email: s.customer_email || existingLocal?.customer_email || '',
            sender_name: s.sender_name || existingLocal?.sender_name || 'Shipper Contact',
            sender_company: s.sender_company || existingLocal?.sender_company,
            sender_phone: s.sender_phone || existingLocal?.sender_phone,
            sender_email: s.sender_email || existingLocal?.sender_email,
            receiver_name: s.receiver_name || existingLocal?.receiver_name || 'Consignee Receiver',
            receiver_company: s.receiver_company || existingLocal?.receiver_company,
            receiver_phone: s.receiver_phone || existingLocal?.receiver_phone,
            receiver_email: s.receiver_email || existingLocal?.receiver_email,
            description: s.description || existingLocal?.description || 'Commercial Freight',
            weight_kg: Number(s.weight_kg || existingLocal?.weight_kg || 100),
            volume_m3: Number(s.volume_m3 || existingLocal?.volume_m3 || 1),
            package_count: Number(s.package_count || existingLocal?.package_count || 1),
            fragile: s.fragile !== undefined ? s.fragile : (existingLocal?.fragile || false),
            category: s.category || existingLocal?.category || 'GENERAL',
            priority: s.priority || existingLocal?.priority || 'MEDIUM',
            special_instructions: s.special_instructions || existingLocal?.special_instructions,
            pickup_address: s.pickup_address || existingLocal?.pickup_address || '',
            pickup_city: s.pickup_city || existingLocal?.pickup_city || '',
            pickup_lat: Number(s.pickup_lat || existingLocal?.pickup_lat || 13.0827),
            pickup_lng: Number(s.pickup_lng || existingLocal?.pickup_lng || 80.2707),
            pickup_time: s.pickup_time || existingLocal?.pickup_time,
            destination_address: s.destination_address || existingLocal?.destination_address || '',
            destination_city: s.destination_city || existingLocal?.destination_city || '',
            destination_lat: Number(s.destination_lat || existingLocal?.destination_lat || 12.9716),
            destination_lng: Number(s.destination_lng || existingLocal?.destination_lng || 77.5946),
            delivery_deadline: s.delivery_deadline || existingLocal?.delivery_deadline || new Date().toISOString(),
            actual_delivery_time: s.actual_delivery_time || existingLocal?.actual_delivery_time,
            status: resolvedStatus,
            assigned_lorry_id: s.assigned_lorry_id || existingLocal?.assigned_lorry_id,
            assigned_lorry_code: s.assigned_lorry_code || existingLocal?.assigned_lorry_code,
            assigned_driver_id: s.assigned_driver_id || existingLocal?.assigned_driver_id,
            assigned_driver_name: s.assigned_driver_name || existingLocal?.assigned_driver_name,
            otp_code: s.otp_code || existingLocal?.otp_code,
            otp_verified_at: s.otp_verified_at || existingLocal?.otp_verified_at,
            signature_path: s.signature_path || existingLocal?.signature_path,
            proof_of_delivery_path: s.proof_of_delivery_path || existingLocal?.proof_of_delivery_path,
            receiver_verified_name: s.receiver_verified_name || existingLocal?.receiver_verified_name,
            delivery_notes: s.delivery_notes || existingLocal?.delivery_notes,
            estimated_cost: Number(s.estimated_cost || existingLocal?.estimated_cost || 0) || undefined,
            created_at: s.created_at || existingLocal?.created_at,
            updated_at: isLocalDelivered && existingLocal ? existingLocal.updated_at : s.updated_at,
          };

          // If local was DELIVERED but remote wasn't, re-push to Supabase so it persists
          if (isLocalDelivered && s.status !== 'DELIVERED') {
            syncShipmentToSupabase(mappedShipment);
          }

          return mappedShipment;
        }),
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
            }, true); // skipRemoteSync = true to prevent echo loop
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
            }, true);
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
            }, true);
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
    // Resolve real lorry UUID
    let lorryId: string | null = null;
    if (shipment.assigned_lorry_id) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(shipment.assigned_lorry_id)) {
        lorryId = shipment.assigned_lorry_id;
      } else {
        const matchingLorry = fleetMindStore.getLorries().find(
          (l) => l.id === shipment.assigned_lorry_id || l.lorry_code === shipment.assigned_lorry_code
        );
        if (matchingLorry && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(matchingLorry.id)) {
          lorryId = matchingLorry.id;
        }
      }
    }

    // Resolve real driver UUID
    let driverId: string | null = null;
    if (shipment.assigned_driver_id) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(shipment.assigned_driver_id)) {
        driverId = shipment.assigned_driver_id;
      } else {
        const matchingDriver = fleetMindStore.getDrivers().find(
          (d) => d.id === shipment.assigned_driver_id || d.name === shipment.assigned_driver_name
        );
        if (matchingDriver && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(matchingDriver.id)) {
          driverId = matchingDriver.id;
        }
      }
    }

    const payload: any = {
      id: ensureUUID(shipment.id),
      shipment_code: shipment.shipment_code,
      customer_id: shipment.customer_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(shipment.customer_id) ? shipment.customer_id : null,
      customer_name: shipment.customer_name || 'Commercial Shipper',
      customer_email: shipment.customer_email || 'customer@fleetmind.ai',
      sender_name: shipment.sender_name || shipment.customer_name || 'Commercial Shipper',
      sender_company: shipment.sender_company || null,
      sender_phone: shipment.sender_phone || '+91 98410 00000',
      sender_email: shipment.sender_email || shipment.customer_email || null,
      pickup_address: shipment.pickup_address || 'Regional Freight Yard',
      pickup_city: shipment.pickup_city || 'Chennai',
      pickup_lat: Number(shipment.pickup_lat || 13.0827),
      pickup_lng: Number(shipment.pickup_lng || 80.2707),
      pickup_time: shipment.pickup_time || null,
      receiver_name: shipment.receiver_name || 'Consignee Receiver',
      receiver_company: shipment.receiver_company || null,
      receiver_phone: shipment.receiver_phone || '+91 98410 11111',
      receiver_email: shipment.receiver_email || null,
      destination_address: shipment.destination_address || 'Consignee Warehouse',
      destination_city: shipment.destination_city || 'Coimbatore',
      destination_lat: Number(shipment.destination_lat || 11.0168),
      destination_lng: Number(shipment.destination_lng || 76.9558),
      delivery_deadline: shipment.delivery_deadline || new Date(Date.now() + 86400000).toISOString(),
      actual_delivery_time: shipment.actual_delivery_time || (shipment.status === 'DELIVERED' ? new Date().toISOString() : null),
      description: shipment.description || 'Commercial Freight',
      category: shipment.category || 'GENERAL',
      weight_kg: Math.max(1, Number(shipment.weight_kg || 100)),
      volume_m3: Math.max(0.1, Number(shipment.volume_m3 || 1)),
      package_count: Math.max(1, Number(shipment.package_count || 1)),
      fragile: Boolean(shipment.fragile),
      priority: shipment.priority || 'MEDIUM',
      special_instructions: shipment.special_instructions || null,
      status: shipment.status || 'PENDING_REVIEW',
      assigned_lorry_id: lorryId,
      assigned_lorry_code: shipment.assigned_lorry_code || null,
      assigned_driver_id: driverId,
      assigned_driver_name: shipment.assigned_driver_name || null,
      otp_code: shipment.otp_code || null,
      otp_verified_at: shipment.otp_verified_at || null,
      signature_path: shipment.signature_path || null,
      proof_of_delivery_path: shipment.proof_of_delivery_path || null,
      receiver_verified_name: shipment.receiver_verified_name || null,
      delivery_notes: shipment.delivery_notes || null,
      updated_at: new Date().toISOString(),
    };

    let { error } = await supabase.from('shipments').upsert(payload, { onConflict: 'shipment_code' });
    
    // Auto-retry without strict foreign key references if reference validation failed
    if (error && (error.message.includes('foreign key') || error.code === '23503')) {
      payload.assigned_lorry_id = null;
      payload.assigned_driver_id = null;
      payload.customer_id = null;
      const retryRes = await supabase.from('shipments').upsert(payload, { onConflict: 'shipment_code' });
      error = retryRes.error;
    }

    if (error) {
      console.warn('[Supabase Sync] Shipments upsert notice:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase Sync] Failed to sync shipment to Supabase:', err);
  }
}

/**
 * Persists an expense logged by driver or dispatcher to Supabase PostgreSQL.
 */
export async function syncExpenseToSupabase(expense: any): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const payload = {
      id: ensureUUID(expense.id),
      trip_id: expense.trip_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(expense.trip_id) ? expense.trip_id : null,
      lorry_id: expense.lorry_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(expense.lorry_id) ? expense.lorry_id : null,
      lorry_code: expense.lorry_code || 'L-01',
      category: expense.category || 'FUEL',
      amount_inr: Math.max(1, Number(expense.amount_inr || 100)),
      date: expense.date || new Date().toISOString(),
      description: expense.description || 'On-road expense',
      receipt_url: expense.receipt_url || null,
    };

    const { error } = await supabase.from('expenses').upsert(payload, { onConflict: 'id' });
    if (error && error.message.includes('foreign key')) {
      payload.trip_id = null;
      payload.lorry_id = null;
      await supabase.from('expenses').upsert(payload, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('[Supabase Sync] Failed to sync expense to Supabase:', err);
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
      user_id: driver.user_id && !driver.user_id.startsWith('cust-') && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(driver.user_id) ? driver.user_id : null,
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
      firebase_uid: user.firebase_uid || `fb_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: user.email,
      full_name: user.full_name || 'User Profile',
      role: user.role || 'CUSTOMER',
      avatar_url: user.avatar_url || null,
      phone: user.phone || null,
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
