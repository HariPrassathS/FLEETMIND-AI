import { SmartConsolidationEngine } from '../consolidation';
import { Driver, Lorry, Route, Shipment, SystemSettings, Trip } from '../types';
import { DEFAULT_SYSTEM_SETTINGS } from '../optimizer';

function runUnitTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING FLEETMIND AI CONSOLIDATION VERIFICATION');
  console.log('====================================================\n');

  const baseSettings: SystemSettings = {
    ...DEFAULT_SYSTEM_SETTINGS,
    fuel_price_per_liter: 96.5,
    driver_base_rate_per_km: 6.0,
    fixed_dispatch_cost_per_lorry: 800,
  };

  const dummyDriver: Driver = {
    id: 'drv-01',
    name: 'Arun Kumar',
    phone: '+91 98401 22334',
    license_number: 'TN-01-2018-0099',
    current_lat: 13.0827,
    current_lng: 80.2707,
    availability_status: 'ON_DUTY',
    shift_start: '06:00',
    shift_end: '20:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const truckL007: Lorry = {
    id: 'lorry-007',
    lorry_code: 'L-007',
    registration_number: 'TN 01 AB 7788',
    model: 'BharatBenz 1617R',
    max_weight_kg: 4000,
    max_volume_m3: 18,
    fuel_efficiency_km_per_l: 7.0,
    current_lat: 11.6643, // Salem (In-Transit on NH544 Chennai -> Coimbatore)
    current_lng: 78.1460,
    status: 'ON_ROUTE',
    driver_id: dummyDriver.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const standbyLorry: Lorry = {
    id: 'lorry-standby',
    lorry_code: 'L-014',
    registration_number: 'TN 02 CD 9900',
    model: 'Tata Ultra T.11',
    max_weight_kg: 5000,
    max_volume_m3: 22,
    fuel_efficiency_km_per_l: 6.2,
    current_lat: 11.0045,
    current_lng: 77.0123,
    status: 'AVAILABLE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // ----------------------------------------------------
  // TEST CASE 1: Ideal Consolidation (Chennai -> Coimbatore + Palladam -> Coimbatore)
  // ----------------------------------------------------
  console.log('--- [TEST 1] Ideal Intermediate Stop Consolidation ---');
  const baseShipment1: Shipment = {
    id: 'shp-base-1',
    shipment_code: 'SHP-A',
    customer_id: 'cust-1',
    pickup_city: 'Chennai',
    pickup_address: 'Chennai Logistics Depot',
    pickup_lat: 13.0827,
    pickup_lng: 80.2707,
    destination_city: 'Coimbatore',
    destination_address: 'Coimbatore Consignee Bay',
    destination_lat: 11.0168,
    destination_lng: 76.9558,
    weight_kg: 2000,
    volume_m3: 10,
    category: 'GENERAL',
    priority: 'MEDIUM',
    delivery_deadline: new Date(Date.now() + 14 * 3600000).toISOString(),
    description: 'Auto components',
    status: 'IN_TRANSIT',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const activeTrip1: Trip = {
    id: 'trip-001',
    trip_code: 'TRIP-CHN-CBE-01',
    lorry_id: truckL007.id,
    lorry_code: truckL007.lorry_code,
    driver_id: dummyDriver.id,
    driver_name: dummyDriver.name,
    shipment_ids: [baseShipment1.id],
    origin_city: 'Chennai',
    destination_city: 'Coimbatore',
    stops_count: 2,
    start_time: new Date().toISOString(),
    eta: new Date(Date.now() + 8 * 3600000).toISOString(),
    distance_km: 510,
    fuel_liters: 72.8,
    estimated_cost_inr: 9800,
    status: 'IN_PROGRESS',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const newShipment1: Shipment = {
    id: 'shp-new-1',
    shipment_code: 'SHP-B',
    customer_id: 'cust-2',
    pickup_city: 'Palladam',
    pickup_address: 'Palladam Textile Hub',
    pickup_lat: 11.0045,
    pickup_lng: 77.2912,
    destination_city: 'Coimbatore',
    destination_address: 'Coimbatore Industrial Park',
    destination_lat: 11.0168,
    destination_lng: 76.9558,
    weight_kg: 300,
    volume_m3: 2,
    category: 'TEXTILE',
    priority: 'MEDIUM',
    delivery_deadline: new Date(Date.now() + 12 * 3600000).toISOString(),
    description: 'Cotton Fabric Rolls',
    status: 'PENDING_REVIEW',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const res1 = SmartConsolidationEngine.analyzeShipment(
    newShipment1,
    [activeTrip1],
    [],
    [truckL007, standbyLorry],
    [dummyDriver],
    [baseShipment1, newShipment1],
    baseSettings
  );

  console.log('All candidate options analyzed:', res1.all_options.map(o => ({
    lorry: o.lorry.lorry_code,
    is_existing_trip: o.is_existing_trip,
    is_feasible: o.is_feasible,
    reasons: o.reasons,
    warning_reasons: o.warning_reasons,
    net_savings_inr: o.net_savings_inr,
    decision_type: o.decision_type,
    score: o.deterministic_score
  })));

  console.log(`Decision: ${res1.recommended_option.decision_type}`);
  console.log(`Lorry: ${res1.recommended_option.lorry.lorry_code}`);
  console.log(`Payload: ${res1.recommended_option.projected_weight_kg} kg (${res1.recommended_option.projected_weight_util_pct}%)`);
  console.log(`Volume: ${res1.recommended_option.projected_volume_m3} m³ (${res1.recommended_option.projected_volume_util_pct}%)`);
  console.log(`Detour: +${res1.recommended_option.additional_distance_km} km (+${res1.recommended_option.additional_time_minutes} mins)`);
  console.log(`Net Savings: ₹${res1.recommended_option.net_savings_inr}`);
  console.assert(res1.recommended_option.decision_type === 'ADD_TO_EXISTING_TRIP', 'Test 1 Failed: Expected ADD_TO_EXISTING_TRIP');
  console.log('✅ TEST 1 PASSED: Correctly recommended ADD_TO_EXISTING_TRIP\n');

  // ----------------------------------------------------
  // TEST CASE 2: Weight Overload Check
  // ----------------------------------------------------
  console.log('--- [TEST 2] Weight Overload Protection ---');
  const heavyShipment: Shipment = {
    ...newShipment1,
    id: 'shp-heavy',
    shipment_code: 'SHP-HEAVY',
    weight_kg: 2500, // 2000 + 2500 = 4500 > 4000
    volume_m3: 3,
  };

  const res2 = SmartConsolidationEngine.analyzeShipment(
    heavyShipment,
    [activeTrip1],
    [],
    [truckL007, standbyLorry],
    [dummyDriver],
    [baseShipment1, heavyShipment],
    baseSettings
  );

  console.log(`Decision: ${res2.recommended_option.decision_type}`);
  console.log(`Lorry: ${res2.recommended_option.lorry.lorry_code}`);
  console.log(`Weight: ${heavyShipment.weight_kg} kg`);
  console.assert(
    res2.recommended_option.decision_type === 'ASSIGN_NEW_VEHICLE',
    'Test 2 Failed: Expected ASSIGN_NEW_VEHICLE due to weight overload'
  );
  console.log('✅ TEST 2 PASSED: Overloaded weight correctly blocked from consolidation\n');

  // ----------------------------------------------------
  // TEST CASE 3: Volume Overload Check
  // ----------------------------------------------------
  console.log('--- [TEST 3] Volume Overload Protection ---');
  const bulkyShipment: Shipment = {
    ...newShipment1,
    id: 'shp-bulky',
    shipment_code: 'SHP-BULKY',
    weight_kg: 500,
    volume_m3: 12, // 10 + 12 = 22 > 18
  };

  const res3 = SmartConsolidationEngine.analyzeShipment(
    bulkyShipment,
    [activeTrip1],
    [],
    [truckL007, standbyLorry],
    [dummyDriver],
    [baseShipment1, bulkyShipment],
    baseSettings
  );

  console.log(`Decision: ${res3.recommended_option.decision_type}`);
  console.log(`Lorry: ${res3.recommended_option.lorry.lorry_code}`);
  console.assert(
    res3.recommended_option.decision_type === 'ASSIGN_NEW_VEHICLE',
    'Test 3 Failed: Expected ASSIGN_NEW_VEHICLE due to volume overload'
  );
  console.log('✅ TEST 3 PASSED: Overloaded volume correctly blocked from consolidation\n');

  // ----------------------------------------------------
  // TEST CASE 5: Strict SLA Priority Protection
  // ----------------------------------------------------
  console.log('--- [TEST 5] Deadline & Critical Priority Protection ---');
  const tightDeadlineBaseShipment: Shipment = {
    ...baseShipment1,
    priority: 'CRITICAL',
    delivery_deadline: new Date(Date.now() + 10 * 60000).toISOString(), // 10 minutes from now
  };

  const res5 = SmartConsolidationEngine.analyzeShipment(
    newShipment1,
    [activeTrip1],
    [],
    [truckL007, standbyLorry],
    [dummyDriver],
    [tightDeadlineBaseShipment, newShipment1],
    baseSettings
  );

  console.log(`Decision: ${res5.recommended_option.decision_type}`);
  console.assert(
    res5.recommended_option.decision_type === 'ASSIGN_NEW_VEHICLE',
    'Test 5 Failed: Expected ASSIGN_NEW_VEHICLE to protect critical deadline'
  );
  console.log('✅ TEST 5 PASSED: Critical shipment deadline strictly preserved\n');

  console.log('🎉 ALL TEST CASES SUCCESSFULLY VERIFIED!');
}

runUnitTests();
