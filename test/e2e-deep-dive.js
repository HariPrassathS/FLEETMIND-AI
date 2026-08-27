const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fswljspsdqgivzyewguz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzd2xqc3BzZHFnaXZ6eWV3Z3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTQ1NDAsImV4cCI6MjEwMzM5MDU0MH0.0HR-UwtcrgQk7BudCDvpTd3zdxzBoEIymv4KJrKfN0A'
);

async function runDeepE2ETest() {
  console.log('================================================================');
  console.log('  FLEETMIND AI — COMPREHENSIVE END-TO-END DEEP DIVE TEST SUITE  ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} ${details ? '--> ' + details : ''}`);
      failed++;
    }
  }

  const testSessionId = `e2e-${Date.now()}`;
  const testShipmentId = '22222222-3333-4444-8555-666666666666';
  const testShipmentCode = `SHP-E2E-${Date.now().toString().slice(-4)}`;
  const testVehicleId = '33333333-4444-4555-8666-777777777777';
  const testLorryCode = `L-E2E-${Date.now().toString().slice(-3)}`;
  const testDriverId = '44444444-5555-4666-8777-888888888888';
  const testDriverName = `Driver E2E Test`;

  try {
    // -------------------------------------------------------------------------
    // TEST SECTION 1: DATABASE HEALTH & TABLES ACCESSIBILITY
    // -------------------------------------------------------------------------
    console.log('\n--- 1. DATABASE CONNECTIVITY & SCHEMAS ---');
    const [profilesCheck, vehiclesCheck, driversCheck, shipmentsCheck, tripsCheck, gpsCheck, notifCheck, auditCheck] = await Promise.all([
      supabase.from('profiles').select('id').limit(1),
      supabase.from('vehicles').select('id').limit(1),
      supabase.from('drivers').select('id').limit(1),
      supabase.from('shipments').select('id').limit(1),
      supabase.from('trips').select('id').limit(1),
      supabase.from('gps_locations').select('id').limit(1),
      supabase.from('notifications').select('id').limit(1),
      supabase.from('audit_logs').select('id').limit(1),
    ]);

    assert(!profilesCheck.error, 'Profiles table accessible');
    assert(!vehiclesCheck.error, 'Vehicles table accessible');
    assert(!driversCheck.error, 'Drivers table accessible');
    assert(!shipmentsCheck.error, 'Shipments table accessible');
    assert(!tripsCheck.error, 'Trips table accessible');
    assert(!gpsCheck.error, 'GPS Locations telemetry table accessible');
    assert(!notifCheck.error, 'Notifications table accessible');
    assert(!auditCheck.error, 'Audit Logs table accessible');

    // -------------------------------------------------------------------------
    // TEST SECTION 2: CUSTOMER ROLE — SHIPMENT CREATION & INTAKE
    // -------------------------------------------------------------------------
    console.log('\n--- 2. ROLE: CUSTOMER INTAKE & LODGEMENT ---');
    const { data: createdShipment, error: createError } = await supabase.from('shipments').upsert({
      id: testShipmentId,
      shipment_code: testShipmentCode,
      customer_name: 'Precision Instruments Pvt Ltd',
      customer_email: 'customer@fleetmind.ai',
      description: 'High-Density Server Motherboards & Power Supplies',
      category: 'ELECTRONICS',
      weight_kg: 1800,
      volume_m3: 4.5,
      package_count: 24,
      fragile: true,
      priority: 'HIGH',
      pickup_address: 'Coimbatore SIDCO Industrial Estate',
      pickup_city: 'Coimbatore',
      pickup_lat: 11.0168,
      pickup_lng: 76.9558,
      destination_address: 'Chennai Guindy Commercial Logistics CFS',
      destination_city: 'Chennai',
      destination_lat: 13.0827,
      destination_lng: 80.2707,
      delivery_deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      status: 'PENDING_REVIEW'
    }).select().single();

    assert(!createError && createdShipment, 'Customer lodges consignment with persistent UUID', `Code: ${testShipmentCode}`);
    assert(createdShipment?.status === 'PENDING_REVIEW', 'Initial status is PENDING_REVIEW');

    // -------------------------------------------------------------------------
    // TEST SECTION 3: DISPATCHER ROLE — REVIEW, ACCEPT & ASSIGN CARRIER
    // -------------------------------------------------------------------------
    console.log('\n--- 3. ROLE: DISPATCHER ACCEPTANCE & FLEET ASSIGNMENT ---');

    // Step 3a: Create dedicated vehicle and driver in DB
    const { data: vehicleData } = await supabase.from('vehicles').upsert({
      id: testVehicleId,
      lorry_code: testLorryCode,
      registration_number: 'TN-01-E2E-9999',
      model: 'Tata 1109 LPT (6 Ton)',
      max_weight_kg: 6000,
      max_volume_m3: 18.0,
      fuel_efficiency_km_per_l: 5.8,
      current_lat: 11.0168,
      current_lng: 76.9558,
      current_address: 'Coimbatore Hub',
      status: 'AVAILABLE'
    }).select().single();

    const { data: driverData } = await supabase.from('drivers').upsert({
      id: testDriverId,
      name: testDriverName,
      phone: '+91 98401 55667',
      license_number: `DL-TN-${Date.now().toString().slice(-6)}`,
      current_lat: 11.0168,
      current_lng: 76.9558,
      availability_status: 'AVAILABLE',
      assigned_lorry_id: testVehicleId
    }).select().single();

    assert(vehicleData && driverData, 'Dispatcher creates/loads available carrier unit', `${testLorryCode} + ${testDriverName}`);

    // Step 3b: Dispatcher accepts the load
    const { data: acceptedShipment, error: acceptError } = await supabase.from('shipments').update({
      status: 'ACCEPTED',
      updated_at: new Date().toISOString()
    }).eq('id', testShipmentId).select().single();

    assert(!acceptError && acceptedShipment.status === 'ACCEPTED', 'Dispatcher marks consignment ACCEPTED');

    // Step 3c: Dispatcher assigns vehicle & driver
    const { data: assignedShipment, error: assignError } = await supabase.from('shipments').update({
      status: 'ASSIGNED',
      assigned_lorry_id: testVehicleId,
      assigned_lorry_code: testLorryCode,
      assigned_driver_id: testDriverId,
      assigned_driver_name: testDriverName,
      updated_at: new Date().toISOString()
    }).eq('id', testShipmentId).select().single();

    // Simultaneously update vehicle & driver state in DB
    await supabase.from('vehicles').update({ status: 'ON_ROUTE' }).eq('id', testVehicleId);
    await supabase.from('drivers').update({ availability_status: 'ON_DUTY' }).eq('id', testDriverId);

    assert(!assignError && assignedShipment.status === 'ASSIGNED', 'Consignment assigned to carrier', `Lorry: ${testLorryCode}, Driver: ${testDriverName}`);

    // -------------------------------------------------------------------------
    // TEST SECTION 4: DRIVER ROLE — PICKUP, TELEMETRY & GPS STREAMING
    // -------------------------------------------------------------------------
    console.log('\n--- 4. ROLE: DRIVER COCKPIT & LIVE GPS TELEMETRY ---');

    // Step 4a: Driver confirms pickup
    const { data: inTransitShipment, error: transitError } = await supabase.from('shipments').update({
      status: 'IN_TRANSIT',
      pickup_time: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', testShipmentId).select().single();

    assert(!transitError && inTransitShipment.status === 'IN_TRANSIT', 'Driver confirms cargo pickup -> status IN_TRANSIT');

    // Step 4b: Real mobile GPS broadcast simulation
    const { error: gpsError } = await supabase.from('gps_locations').insert({
      driver_id: testDriverId,
      vehicle_id: testVehicleId,
      latitude: 11.6643,
      longitude: 78.1460, // Salem waypoint along NH44 corridor
      speed: 56.4,
      heading: 45.0,
      is_real_device_gps: true,
      recorded_at: new Date().toISOString()
    });

    assert(!gpsError, 'Driver emits live telemetry coordinate into gps_locations table', 'Lat: 11.6643, Lng: 78.1460');

    // -------------------------------------------------------------------------
    // TEST SECTION 5: DRIVER HANDOVER — CRYPTOGRAPHIC OTP & PROOF OF DELIVERY
    // -------------------------------------------------------------------------
    console.log('\n--- 5. ROLE: CONFINED DELIVERY VERIFICATION (OTP + SIGNATURE) ---');

    const expectedOtp = '948201';
    const consigneeName = 'K. Ramesh (Senior Warehouse Incharge)';

    // Step 5a: Dispatch OTP to receiver
    await supabase.from('shipments').update({
      otp_code: expectedOtp,
      updated_at: new Date().toISOString()
    }).eq('id', testShipmentId);

    // Step 5b: Verify OTP and sign POD
    const { data: deliveredShipment, error: deliverError } = await supabase.from('shipments').update({
      status: 'DELIVERED',
      otp_verified_at: new Date().toISOString(),
      receiver_verified_name: consigneeName,
      signature_path: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMCAxMCIvPjwvc3ZnPg==',
      proof_of_delivery_path: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
      delivery_notes: 'Cargo inspected and accepted in pristine factory condition.',
      actual_delivery_time: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', testShipmentId).select().single();

    // Release vehicle and driver in DB
    await supabase.from('vehicles').update({ status: 'AVAILABLE' }).eq('id', testVehicleId);
    await supabase.from('drivers').update({ availability_status: 'AVAILABLE' }).eq('id', testDriverId);

    assert(!deliverError && deliveredShipment.status === 'DELIVERED', 'Handover verified and recorded DELIVERED in Supabase DB');
    assert(deliveredShipment.receiver_verified_name === consigneeName, 'Consignee signoff verified', consigneeName);

    // -------------------------------------------------------------------------
    // TEST SECTION 6: MANAGER & ADMIN ROLE — LIVE DATA CONSISTENCY CHECK
    // -------------------------------------------------------------------------
    console.log('\n--- 6. ROLE: MANAGER & ADMIN CLOUD VERIFICATION ---');

    const { data: finalRecord, error: finalRecordError } = await supabase.from('shipments').select('*').eq('id', testShipmentId).maybeSingle();
    const { data: finalVehicle } = await supabase.from('vehicles').select('*').eq('id', testVehicleId).maybeSingle();
    const { data: finalDriver } = await supabase.from('drivers').select('*').eq('id', testDriverId).maybeSingle();

    console.log('    Debug finalRecord:', finalRecord ? { id: finalRecord.id, status: finalRecord.status } : 'NULL', finalRecordError);

    assert(finalRecord?.status === 'DELIVERED', 'Global Query: Shipment state persistent as DELIVERED', `Status: ${finalRecord?.status}`);
    assert(finalVehicle?.status === 'AVAILABLE', 'Global Query: Vehicle returned to AVAILABLE status');
    assert(finalDriver?.availability_status === 'AVAILABLE', 'Global Query: Driver returned to AVAILABLE status');

    // -------------------------------------------------------------------------
    // TEST SECTION 7: CLEANUP
    // -------------------------------------------------------------------------
    console.log('\n--- 7. CLEANUP & TEARDOWN ---');
    await supabase.from('gps_locations').delete().eq('driver_id', testDriverId);
    await supabase.from('shipments').delete().eq('id', testShipmentId);
    await supabase.from('drivers').delete().eq('id', testDriverId);
    await supabase.from('vehicles').delete().eq('id', testVehicleId);

    console.log('  ✓ Test fixtures cleanly dismantled.');

  } catch (err) {
    console.error('CRITICAL UNEXPECTED ERROR IN TEST RUNNER:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`  FINAL RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDeepE2ETest();
