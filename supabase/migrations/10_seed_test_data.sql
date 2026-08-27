-- ============================================================================
-- FLEETMIND AI — SUPABASE MIGRATION: 10_SEED_TEST_DATA.SQL
-- Purpose: Realistic South India Corridor Seed Data for Production Verification
-- ============================================================================

-- 1. Insert Default System Settings
INSERT INTO system_settings (
    fuel_price_per_liter,
    driver_base_rate_per_km,
    operating_cost_per_km,
    fixed_dispatch_cost_per_lorry,
    auto_dispatch_high_priority,
    route_deviation_threshold_km,
    average_speed_km_per_h
) VALUES (
    96.50,
    6.00,
    3.20,
    800.00,
    false,
    1.50,
    48
) ON CONFLICT DO NOTHING;

-- 2. Insert Core Commercial Lorries
INSERT INTO vehicles (
    lorry_code,
    registration_number,
    model,
    image_url,
    max_weight_kg,
    max_volume_m3,
    fuel_efficiency_km_per_l,
    current_lat,
    current_lng,
    current_address,
    status
) VALUES 
    ('L-11', 'TN-01-AB-4501', 'Tata 1109 LPT (6 Ton)', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600', 6000, 22.0, 5.0, 13.0450, 80.2010, 'Guindy Industrial Estate, Chennai', 'AVAILABLE'),
    ('L-18', 'TN-02-CD-8818', 'Eicher Pro 2059 (Eco-Max 6 Ton)', 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=600', 6200, 24.0, 10.4, 13.0850, 80.1250, 'Ambattur Industrial Estate, Chennai', 'AVAILABLE'),
    ('L-07', 'TN-09-EF-1907', 'BharatBenz 1217R (8 Ton)', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600', 8500, 32.0, 6.2, 12.9810, 80.1800, 'Pallavaram Transport Hub, Chennai', 'AVAILABLE'),
    ('L-04', 'KA-01-GH-3304', 'Tata Ace Gold (1.2 Ton)', 'https://images.unsplash.com/photo-1586191582056-a67b5e40a029?w=600', 1200, 5.5, 14.5, 12.9350, 77.6240, 'Koramangala Logistics Hub, Bengaluru', 'AVAILABLE')
ON CONFLICT (lorry_code) DO NOTHING;

-- 3. Insert Commercial Drivers
INSERT INTO drivers (
    name,
    phone,
    license_number,
    current_lat,
    current_lng,
    availability_status,
    shift_start,
    shift_end,
    performance_score
) VALUES 
    ('Murugan Selvam', '+91 98401 22334', 'TN01-2012004921', 13.0450, 80.2010, 'AVAILABLE', '06:00', '18:00', 98),
    ('Rajesh Kumar', '+91 98402 33445', 'TN02-2015008819', 13.0850, 80.1250, 'AVAILABLE', '06:00', '18:00', 96),
    ('Karthik Raja', '+91 98403 44556', 'TN09-2016009912', 12.9810, 80.1800, 'AVAILABLE', '07:00', '19:00', 94),
    ('Suresh Gowda', '+91 98801 55667', 'KA01-2018003304', 12.9350, 77.6240, 'AVAILABLE', '06:00', '18:00', 97)
ON CONFLICT (license_number) DO NOTHING;
