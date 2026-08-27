const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.fswljspsdqgivzyewguz:Prassath%402007@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

// Full Vehicle Fleet (L-01 to L-09)
const SEED_VEHICLES = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    lorry_code: 'L-01',
    registration_number: 'TN-01-AB-1001',
    model: 'Tata Signa 4825.TK',
    max_weight_kg: 10000,
    max_volume_m3: 35,
    fuel_efficiency_km_per_l: 4.8,
    current_lat: 13.0827,
    current_lng: 80.2707,
    current_address: 'Chennai Freight Gateway Depot',
    status: 'AVAILABLE',
    is_refrigerated: false,
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    lorry_code: 'L-02',
    registration_number: 'TN-38-CD-2002',
    model: 'Ashok Leyland 2820-6x2',
    max_weight_kg: 8500,
    max_volume_m3: 30,
    fuel_efficiency_km_per_l: 5.2,
    current_lat: 11.0168,
    current_lng: 76.9558,
    current_address: 'Coimbatore Industrial Logistics Hub',
    status: 'AVAILABLE',
    is_refrigerated: false,
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    lorry_code: 'L-03',
    registration_number: 'KA-01-EF-3003',
    model: 'Eicher Pro 6035',
    max_weight_kg: 12000,
    max_volume_m3: 40,
    fuel_efficiency_km_per_l: 4.2,
    current_lat: 12.9716,
    current_lng: 77.5946,
    current_address: 'Bengaluru Peenya Central Yard',
    status: 'AVAILABLE',
    is_refrigerated: false,
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    lorry_code: 'L-04',
    registration_number: 'TN-30-GH-4004',
    model: 'BharatBenz 2823R',
    max_weight_kg: 7500,
    max_volume_m3: 25,
    fuel_efficiency_km_per_l: 5.8,
    current_lat: 11.6643,
    current_lng: 78.146,
    current_address: 'Salem Steel Expressway Terminal',
    status: 'AVAILABLE',
    is_refrigerated: false,
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    lorry_code: 'L-05',
    registration_number: 'TN-70-IJ-5005',
    model: 'Tata Ultra T.16',
    max_weight_kg: 5000,
    max_volume_m3: 20,
    fuel_efficiency_km_per_l: 6.5,
    current_lat: 12.8399,
    current_lng: 77.677,
    current_address: 'Hosur SIPCOT Phase-1 Depot',
    status: 'AVAILABLE',
    is_refrigerated: false,
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    lorry_code: 'L-06',
    registration_number: 'TN-47-KL-6006',
    model: 'Mahindra Blazo X 35',
    max_weight_kg: 10000,
    max_volume_m3: 35,
    fuel_efficiency_km_per_l: 4.6,
    current_lat: 10.9601,
    current_lng: 78.0766,
    current_address: 'Karur Textile Freight Corridor',
    status: 'AVAILABLE',
    is_refrigerated: false,
  },
  {
    id: '00000000-0000-4000-8000-000000000007',
    lorry_code: 'L-07',
    registration_number: 'TN-42-MN-7007',
    model: 'Ashok Leyland Boss 1415',
    max_weight_kg: 4500,
    max_volume_m3: 18,
    fuel_efficiency_km_per_l: 7.0,
    current_lat: 11.1085,
    current_lng: 77.3411,
    current_address: 'Tirupur Apparel Logistics Park',
    status: 'AVAILABLE',
    is_refrigerated: false,
  },
  {
    id: '00000000-0000-4000-8000-000000000008',
    lorry_code: 'L-08',
    registration_number: 'TN-59-OP-8008',
    model: 'Eicher Pro 3019 Reefer',
    max_weight_kg: 8000,
    max_volume_m3: 28,
    fuel_efficiency_km_per_l: 5.0,
    current_lat: 9.9252,
    current_lng: 78.1198,
    current_address: 'Madurai Cold Chain Hub',
    status: 'AVAILABLE',
    is_refrigerated: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000009',
    lorry_code: 'L-09',
    registration_number: 'TS-09-QR-9009',
    model: 'Tata Prima 5530.S Heavy Hauler',
    max_weight_kg: 15000,
    max_volume_m3: 50,
    fuel_efficiency_km_per_l: 3.8,
    current_lat: 17.385,
    current_lng: 78.4867,
    current_address: 'Hyderabad Shamshabad Cargo Terminal',
    status: 'AVAILABLE',
    is_refrigerated: false,
  },
];

// Full Professional Drivers
const SEED_DRIVERS = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    name: 'Murugan Selvam',
    phone: '+91 98401 22331',
    license_number: 'TN-01-2015-00912',
    current_lat: 13.0827,
    current_lng: 80.2707,
    availability_status: 'AVAILABLE',
    shift_start: '06:00',
    shift_end: '18:00',
    performance_score: 98,
    total_deliveries: 142,
  },
  {
    id: '00000000-0000-4000-8000-000000000102',
    name: 'Karthik Raja',
    phone: '+91 98402 33442',
    license_number: 'TN-38-2017-00431',
    current_lat: 11.0168,
    current_lng: 76.9558,
    availability_status: 'AVAILABLE',
    shift_start: '06:00',
    shift_end: '18:00',
    performance_score: 95,
    total_deliveries: 98,
  },
  {
    id: '00000000-0000-4000-8000-000000000103',
    name: 'Basavaraj Patil',
    phone: '+91 98403 44553',
    license_number: 'KA-01-2016-00789',
    current_lat: 12.9716,
    current_lng: 77.5946,
    availability_status: 'AVAILABLE',
    shift_start: '08:00',
    shift_end: '20:00',
    performance_score: 92,
    total_deliveries: 115,
  },
  {
    id: '00000000-0000-4000-8000-000000000104',
    name: 'Senthil Nathan',
    phone: '+91 98404 55664',
    license_number: 'TN-30-2018-00562',
    current_lat: 11.6643,
    current_lng: 78.146,
    availability_status: 'AVAILABLE',
    shift_start: '06:00',
    shift_end: '18:00',
    performance_score: 97,
    total_deliveries: 164,
  },
  {
    id: '00000000-0000-4000-8000-000000000105',
    name: 'Anand Kumar',
    phone: '+91 98405 66775',
    license_number: 'TN-70-2019-00214',
    current_lat: 12.8399,
    current_lng: 77.677,
    availability_status: 'AVAILABLE',
    shift_start: '07:00',
    shift_end: '19:00',
    performance_score: 89,
    total_deliveries: 76,
  },
  {
    id: '00000000-0000-4000-8000-000000000106',
    name: 'Palanisamy Gounder',
    phone: '+91 98406 77886',
    license_number: 'TN-47-2014-00891',
    current_lat: 10.9601,
    current_lng: 78.0766,
    availability_status: 'AVAILABLE',
    shift_start: '05:00',
    shift_end: '17:00',
    performance_score: 99,
    total_deliveries: 210,
  },
  {
    id: '00000000-0000-4000-8000-000000000107',
    name: 'Venkatesh Babu',
    phone: '+91 98407 88997',
    license_number: 'TS-09-2016-00345',
    current_lat: 17.385,
    current_lng: 78.4867,
    availability_status: 'AVAILABLE',
    shift_start: '06:00',
    shift_end: '18:00',
    performance_score: 94,
    total_deliveries: 130,
  },
];

// Seed Profiles (All Roles)
const SEED_PROFILES = [
  {
    id: '00000000-0000-4000-8000-000000000201',
    firebase_uid: 'ZPMwgp2Z93dSBX1JPuCyD42WODY2',
    email: 'admin@gmail.com',
    full_name: 'FleetMind Admin',
    role: 'ADMIN',
    phone: '+91 98400 11111',
  },
  {
    id: '00000000-0000-4000-8000-000000000202',
    firebase_uid: 'b3sI7zTK8NfDsJieqhpzR3NTnbC2',
    email: 'dispatcher@gmail.com',
    full_name: 'Command Dispatcher',
    role: 'DISPATCHER',
    phone: '+91 98400 22222',
  },
  {
    id: '00000000-0000-4000-8000-000000000203',
    firebase_uid: 'v3fm6JFgXua3amIRxqKRQfpajiq1',
    email: 'driver1@gmail.com',
    full_name: 'Murugan Driver',
    role: 'DRIVER',
    phone: '+91 98401 22331',
  },
  {
    id: '00000000-0000-4000-8000-000000000204',
    firebase_uid: 'fb_manager_fleetmind_ai',
    email: 'manager@fleetmind.ai',
    full_name: 'Operations Manager',
    role: 'MANAGER',
    phone: '+91 98400 33333',
  },
  {
    id: '00000000-0000-4000-8000-000000000205',
    firebase_uid: 'fb_customer_fleetmind_ai',
    email: 'customer@fleetmind.ai',
    full_name: 'Commercial Shipper Corp',
    role: 'CUSTOMER',
    phone: '+91 98400 44444',
  },
];

async function seed() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL for Full Seeding...');

  // 1. Seed Profiles
  console.log('Seeding Profiles...');
  for (const p of SEED_PROFILES) {
    await client.query(
      `INSERT INTO public.profiles (id, firebase_uid, email, full_name, role, phone, is_active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       ON CONFLICT (email) DO UPDATE SET
         firebase_uid = EXCLUDED.firebase_uid,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         phone = EXCLUDED.phone,
         updated_at = NOW();`,
      [p.id, p.firebase_uid, p.email, p.full_name, p.role, p.phone]
    );
  }

  // 2. Seed Vehicles (L-01 to L-09)
  console.log('Seeding Vehicles L-01 to L-09...');
  for (const v of SEED_VEHICLES) {
    await client.query(
      `INSERT INTO public.vehicles (id, lorry_code, registration_number, model, max_weight_kg, max_volume_m3, fuel_efficiency_km_per_l, current_lat, current_lng, current_address, status, is_refrigerated, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       ON CONFLICT (lorry_code) DO UPDATE SET
         registration_number = EXCLUDED.registration_number,
         model = EXCLUDED.model,
         max_weight_kg = EXCLUDED.max_weight_kg,
         max_volume_m3 = EXCLUDED.max_volume_m3,
         fuel_efficiency_km_per_l = EXCLUDED.fuel_efficiency_km_per_l,
         current_lat = EXCLUDED.current_lat,
         current_lng = EXCLUDED.current_lng,
         current_address = EXCLUDED.current_address,
         status = EXCLUDED.status,
         is_refrigerated = EXCLUDED.is_refrigerated,
         updated_at = NOW();`,
      [
        v.id,
        v.lorry_code,
        v.registration_number,
        v.model,
        v.max_weight_kg,
        v.max_volume_m3,
        v.fuel_efficiency_km_per_l,
        v.current_lat,
        v.current_lng,
        v.current_address,
        v.status,
        v.is_refrigerated,
      ]
    );
  }

  // 3. Seed Drivers
  console.log('Seeding Drivers...');
  for (const d of SEED_DRIVERS) {
    await client.query(
      `INSERT INTO public.drivers (id, name, phone, license_number, current_lat, current_lng, availability_status, shift_start, shift_end, performance_score, total_deliveries, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       ON CONFLICT (license_number) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         current_lat = EXCLUDED.current_lat,
         current_lng = EXCLUDED.current_lng,
         availability_status = EXCLUDED.availability_status,
         performance_score = EXCLUDED.performance_score,
         total_deliveries = EXCLUDED.total_deliveries,
         updated_at = NOW();`,
      [
        d.id,
        d.name,
        d.phone,
        d.license_number,
        d.current_lat,
        d.current_lng,
        d.availability_status,
        d.shift_start,
        d.shift_end,
        d.performance_score,
        d.total_deliveries,
      ]
    );
  }

  console.log('Full Seeding into Supabase PostgreSQL Completed Successfully!');
  await client.end();
}

seed().catch((err) => {
  console.error('Seeding Error:', err);
  client.end();
});
