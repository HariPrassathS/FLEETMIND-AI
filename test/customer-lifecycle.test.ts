import { describe, it, expect, beforeEach } from 'vitest';
import { fleetMindStore } from '../src/lib/db/store';

describe('Customer Shipper Lifecycle & End-to-End Handover Verification', () => {
  beforeEach(() => {
    fleetMindStore.resetDemoData();
  });

  it('allows a customer to create a shipment with complete sender and receiver info', () => {
    const shipment = fleetMindStore.createShipment({
      customer_id: 'cust-abc',
      customer_name: 'ABC Electronics',
      customer_email: 'customer@fleetmind.ai',
      description: 'Precision Circuit Boards',
      weight_kg: 500,
      volume_m3: 1.8,
      package_count: 14,
      fragile: true,
      category: 'ELECTRONICS',
      priority: 'HIGH',
      delivery_deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      pickup_city: 'Coimbatore',
      pickup_address: 'SIDCO Industrial Estate',
      destination_city: 'Chennai',
      destination_address: 'Guindy Industrial Estate',
      sender_name: 'Rajesh Kumar',
      sender_company: 'ABC Electronics Pvt Ltd',
      sender_phone: '+91 98410 44556',
      receiver_name: 'Rahul Kumar',
      receiver_company: 'XYZ Electronics Distributors',
      receiver_email: 'rahul@xyzelectronics.in',
      receiver_phone: '+91 98401 12345',
      status: 'PENDING_DISPATCH',
    });

    expect(shipment.id).toBeDefined();
    expect(shipment.shipment_code).toMatch(/^(S-|SHP-)/);
    expect(shipment.sender_company).toBe('ABC Electronics Pvt Ltd');
    expect(shipment.receiver_name).toBe('Rahul Kumar');

    const customerShipments = fleetMindStore.getShipmentsByCustomer('customer@fleetmind.ai');
    expect(customerShipments.some((s) => s.id === shipment.id)).toBe(true);
  });

  it('generates cryptographic 6-digit delivery OTP and validates server-side', () => {
    const shipments = fleetMindStore.getShipments();
    const shipmentId = shipments[0].id;

    // Generate OTP
    const otpInfo = fleetMindStore.createDeliveryOtp(shipmentId, 'driver-01');
    expect(otpInfo.otp_code).toHaveLength(6);
    expect(otpInfo.masked_email).toContain('***');

    // Invalid OTP attempt
    const invalidResult = fleetMindStore.verifyDeliveryOtp(shipmentId, '000000');
    expect(invalidResult.success).toBe(false);

    // Valid OTP verification
    const validResult = fleetMindStore.verifyDeliveryOtp(shipmentId, otpInfo.otp_code);
    expect(validResult.success).toBe(true);
  });

  it('completes delivery with digital signature and photo proof', () => {
    const shipments = fleetMindStore.getShipments();
    const shipmentId = shipments[0].id;

    // Complete POD
    const result = fleetMindStore.completeDeliveryProof(shipmentId, {
      receiver_name: 'Rahul Kumar',
      signature_svg: 'data:image/svg+xml;base64,mockSignatureData',
      photo_data_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
      delivery_notes: 'Delivered in pristine condition',
      driver_id: 'driver-01',
    });

    expect(result.success).toBe(true);
    expect(result.shipment?.status).toBe('DELIVERED');
    expect(result.shipment?.receiver_verified_name).toBe('Rahul Kumar');
    expect(result.shipment?.signature_path).toBeDefined();
  });

  it('handles landing page dispatcher application and admin verification', () => {
    const appResult = fleetMindStore.registerPendingDispatcher({
      full_name: 'Karthik Raja',
      email: 'karthik.raja@freightcorridor.in',
      phone: '+91 98400 99887',
      freight_zone: 'South India Corridor',
      fleet_size: '25 - 100 Lorries',
      experience_years: 5,
      notes: 'Operating 40 Tata 1109 lorries across Tamil Nadu and Karnataka',
    });

    expect(appResult.user.role).toBe('DISPATCHER');
    expect(appResult.user.verification_status).toBe('PENDING_ADMIN_VERIFICATION');

    // Admin verifies
    const verifiedUser = fleetMindStore.verifyDispatcherAccount(appResult.user.id, 'admin@fleetmind.ai');
    expect(verifiedUser?.verification_status).toBe('VERIFIED');
    expect(verifiedUser?.is_verified).toBe(true);
  });
});
