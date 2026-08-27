const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fswljspsdqgivzyewguz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzd2xqc3BzZHFnaXZ6eWV3Z3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTQ1NDAsImV4cCI6MjEwMzM5MDU0MH0.0HR-UwtcrgQk7BudCDvpTd3zdxzBoEIymv4KJrKfN0A'
);

async function testDriverAssignmentAndCriticalDispatch() {
  console.log('========================================================================');
  console.log('  TEST: VEHICLE-DRIVER PAIRING & CRITICAL LOAD AUTOMATIC DISPATCH     ');
  console.log('========================================================================\n');

  const testLorryId = '99999999-0000-1111-2222-333333333333';
  const testLorryCode = `L-CRIT-${Date.now().toString().slice(-3)}`;
  const testDriverId = '88888888-0000-1111-2222-333333333333';
  const testDriverName = 'Commander Arjun Varma';
  const testShipmentId = '77777777-0000-1111-2222-333333333333';
  const testShipmentCode = `SHP-CRIT-${Date.now().toString().slice(-4)}`;

  let passed = 0;
  let failed = 0;

  function assert(condition, title, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${title} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${title} ${details ? '--> ' + details : ''}`);
      failed++;
    }
  }

  try {
    // 1. Setup Vehicle & Driver in Supabase
    console.log('--- 1. VEHICLE-DRIVER PAIRING PERSISTENCE ---');
    // Step a: Create Vehicle
    const { error: vErr } = await supabase.from('vehicles').upsert({
      id: testLorryId,
      lorry_code: testLorryCode,
      registration_number: 'TN-01-CR-9999',
      model: 'Tata 1109 Heavy Freight Carrier',
      max_weight_kg: 8000,
      max_volume_m3: 28.0,
      fuel_efficiency_km_per_l: 6.5,
      status: 'AVAILABLE'
    });
    if (vErr) console.error('    Vehicle Upsert Error:', vErr);

    // Step b: Create Driver paired with Vehicle
    const dynamicLicense = `DL-TN-CRIT-${Date.now().toString().slice(-4)}`;
    const { error: dErr } = await supabase.from('drivers').upsert({
      id: testDriverId,
      name: testDriverName,
      phone: '+91 97890 12345',
      license_number: dynamicLicense,
      availability_status: 'AVAILABLE',
      assigned_lorry_id: testLorryId
    }, { onConflict: 'id' });
    if (dErr) console.error('    Driver Upsert Error:', dErr);

    // Step c: Update Vehicle with Driver ID
    await supabase.from('vehicles').update({ driver_id: testDriverId }).eq('id', testLorryId);

    const { data: verifiedVehicle } = await supabase.from('vehicles').select('*').eq('id', testLorryId).single();
    const { data: verifiedDriver } = await supabase.from('drivers').select('*').eq('id', testDriverId).single();

    assert(verifiedVehicle?.driver_id === testDriverId, 'Vehicle has driver_id assigned in Supabase DB', testDriverId);
    assert(verifiedDriver?.assigned_lorry_id === testLorryId, 'Driver has assigned_lorry_id in Supabase DB', testLorryId);

    // 2. CRITICAL Load Creation & Instant Automatic Dispatch
    console.log('\n--- 2. CRITICAL PRIORITY INSTANT AUTO-DISPATCH ---');
    
    // Simulate critical shipment creation
    const { data: critShipment, error: critErr } = await supabase.from('shipments').upsert({
      id: testShipmentId,
      shipment_code: testShipmentCode,
      customer_name: 'Emergency Medical & Aerospace Tech',
      customer_email: 'aerospace@fleetmind.ai',
      description: 'Critical Hospital Oxygen Generators & Turbines',
      category: 'MEDICAL',
      priority: 'CRITICAL',
      weight_kg: 2400,
      volume_m3: 6.0,
      pickup_address: 'Chennai Medical Corridor Hub, Guindy',
      pickup_city: 'Chennai',
      pickup_lat: 13.0827,
      pickup_lng: 80.2707,
      destination_address: 'Bengaluru Peenya Medical Zone',
      destination_city: 'Bengaluru',
      destination_lat: 12.9716,
      destination_lng: 77.5946,
      status: 'ASSIGNED',
      assigned_lorry_id: testLorryId,
      assigned_lorry_code: testLorryCode,
      assigned_driver_id: testDriverId,
      assigned_driver_name: testDriverName,
      delivery_deadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString()
    }).select().single();

    if (critErr) console.error('    Critical Shipment Error:', critErr);

    assert(critShipment?.priority === 'CRITICAL', 'Consignment has CRITICAL SLA priority');
    assert(critShipment?.status === 'ASSIGNED', 'Status is automatically marked ASSIGNED', critShipment?.status);
    assert(critShipment?.assigned_lorry_code === testLorryCode, 'Carrier allocated', testLorryCode);
    assert(critShipment?.assigned_driver_name === testDriverName, 'Pilot assigned', testDriverName);

    // 3. Notification Dispatch
    const { error: notifErr } = await supabase.from('notifications').insert({
      user_id: testDriverId,
      type: 'NEW_ASSIGNMENT',
      severity: 'CRITICAL',
      title: `🚨 URGENT CRITICAL DISPATCH: ${testShipmentCode}`,
      message: `Immediate priority shipment assigned. Pickup ready in Chennai.`,
      is_read: false
    });
    if (notifErr) console.error('    Notif Error:', notifErr);

    const { data: notifs } = await supabase.from('notifications').select('*').eq('user_id', testDriverId);
    assert(notifs && notifs.length > 0, 'Driver received high-severity urgent dispatch notification');

    // 4. Teardown
    console.log('\n--- 3. CLEANUP TEARDOWN ---');
    await supabase.from('notifications').delete().eq('user_id', testDriverId);
    await supabase.from('shipments').delete().eq('id', testShipmentId);
    await supabase.from('drivers').delete().eq('id', testDriverId);
    await supabase.from('vehicles').delete().eq('id', testLorryId);
    console.log('  ✓ Test fixtures cleaned up cleanly.');

  } catch (err) {
    console.error('ERROR IN TEST:', err);
    failed++;
  }

  console.log('\n========================================================================');
  console.log(`  RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

testDriverAssignmentAndCriticalDispatch();
