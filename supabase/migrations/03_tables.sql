-- ============================================================================
-- FLEETMIND AI — SUPABASE MIGRATION: 03_TABLES.SQL
-- Purpose: Core Database Schema Tables & Relations
-- ============================================================================

-- 1. Profiles & Roles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Commercial Vehicles (Lorries)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lorry_code TEXT UNIQUE NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    model TEXT NOT NULL,
    image_url TEXT,
    max_weight_kg NUMERIC(10, 2) NOT NULL CHECK (max_weight_kg > 0),
    max_volume_m3 NUMERIC(10, 2) NOT NULL CHECK (max_volume_m3 > 0),
    fuel_efficiency_km_per_l NUMERIC(5, 2) NOT NULL CHECK (fuel_efficiency_km_per_l > 0),
    current_lat NUMERIC(10, 6) NOT NULL DEFAULT 13.0827,
    current_lng NUMERIC(10, 6) NOT NULL DEFAULT 80.2707,
    current_address TEXT,
    status lorry_status NOT NULL DEFAULT 'AVAILABLE',
    driver_id UUID,
    is_refrigerated BOOLEAN NOT NULL DEFAULT false,
    engine_status TEXT DEFAULT 'UNKNOWN',
    engine_source TEXT DEFAULT 'MANUAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Commercial Drivers
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    current_lat NUMERIC(10, 6) NOT NULL DEFAULT 13.0827,
    current_lng NUMERIC(10, 6) NOT NULL DEFAULT 80.2707,
    availability_status driver_status NOT NULL DEFAULT 'AVAILABLE',
    shift_start TIME NOT NULL DEFAULT '06:00',
    shift_end TIME NOT NULL DEFAULT '18:00',
    assigned_lorry_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    performance_score INTEGER DEFAULT 95,
    total_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Customer Shipments (Consignments)
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_code TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_email TEXT,
    
    -- Sender Details
    sender_name TEXT NOT NULL,
    sender_company TEXT,
    sender_phone TEXT,
    sender_email TEXT,
    pickup_address TEXT NOT NULL,
    pickup_city TEXT NOT NULL,
    pickup_lat NUMERIC(10, 6) NOT NULL,
    pickup_lng NUMERIC(10, 6) NOT NULL,
    pickup_time TIMESTAMPTZ,

    -- Receiver Details
    receiver_name TEXT NOT NULL,
    receiver_company TEXT,
    receiver_phone TEXT NOT NULL,
    receiver_email TEXT,
    destination_address TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    destination_lat NUMERIC(10, 6) NOT NULL,
    destination_lng NUMERIC(10, 6) NOT NULL,
    delivery_deadline TIMESTAMPTZ NOT NULL,
    actual_delivery_time TIMESTAMPTZ,

    -- Cargo Specs
    description TEXT NOT NULL,
    category shipment_category NOT NULL DEFAULT 'GENERAL',
    weight_kg NUMERIC(10, 2) NOT NULL CHECK (weight_kg > 0),
    volume_m3 NUMERIC(10, 2) NOT NULL CHECK (volume_m3 > 0),
    package_count INTEGER DEFAULT 1,
    fragile BOOLEAN DEFAULT false,
    priority shipment_priority NOT NULL DEFAULT 'MEDIUM',
    special_instructions TEXT,

    -- Lifecycle & Assignment
    status shipment_status NOT NULL DEFAULT 'PENDING_REVIEW',
    assigned_lorry_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    assigned_lorry_code TEXT,
    assigned_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    assigned_driver_name TEXT,
    
    -- POD / Verification
    otp_code TEXT,
    otp_verified_at TIMESTAMPTZ,
    signature_path TEXT,
    proof_of_delivery_path TEXT,
    receiver_verified_name TEXT,
    delivery_notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Multi-Stop Trips
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_code TEXT UNIQUE NOT NULL,
    lorry_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT,
    lorry_code TEXT NOT NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE RESTRICT,
    driver_name TEXT NOT NULL,
    shipment_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    origin_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    stops_count INTEGER NOT NULL DEFAULT 2,
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    eta TIMESTAMPTZ NOT NULL,
    actual_completion_time TIMESTAMPTZ,
    distance_km NUMERIC(10, 2) NOT NULL DEFAULT 0,
    fuel_liters NUMERIC(10, 2) NOT NULL DEFAULT 0,
    estimated_cost_inr NUMERIC(12, 2) NOT NULL DEFAULT 0,
    actual_cost_inr NUMERIC(12, 2),
    status trip_status NOT NULL DEFAULT 'PLANNED',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. GPS Location Telemetry Logs
CREATE TABLE IF NOT EXISTS gps_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    accuracy NUMERIC(8, 2),
    speed NUMERIC(8, 2),
    heading NUMERIC(8, 2),
    is_real_device_gps BOOLEAN NOT NULL DEFAULT true,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Vehicle Breakdowns & Recovery
CREATE TABLE IF NOT EXISTS breakdowns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    breakdown_code TEXT UNIQUE NOT NULL,
    lorry_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    lorry_code TEXT NOT NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    driver_name TEXT NOT NULL,
    location_address TEXT NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    problem_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'CRITICAL',
    status breakdown_status NOT NULL DEFAULT 'REPORTED',
    affected_shipment_ids JSONB DEFAULT '[]'::jsonb,
    replacement_lorry_id UUID REFERENCES vehicles(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Cargo Transfers (Physical Transfer Verification)
CREATE TABLE IF NOT EXISTS cargo_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    breakdown_id UUID REFERENCES breakdowns(id) ON DELETE CASCADE,
    old_lorry_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT,
    old_lorry_code TEXT NOT NULL,
    new_lorry_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT,
    new_lorry_code TEXT NOT NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE RESTRICT,
    driver_name TEXT NOT NULL,
    shipment_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_cargo_weight_kg NUMERIC(10, 2) NOT NULL,
    transfer_location_address TEXT NOT NULL,
    transfer_lat NUMERIC(10, 6) NOT NULL,
    transfer_lng NUMERIC(10, 6) NOT NULL,
    status TEXT NOT NULL DEFAULT 'TRANSFERRED',
    transferred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Maintenance Records
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lorry_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    lorry_code TEXT NOT NULL,
    service_type TEXT NOT NULL,
    last_service_date DATE NOT NULL,
    next_service_date DATE NOT NULL,
    odometer_km INTEGER NOT NULL,
    maintenance_cost_inr NUMERIC(10, 2) NOT NULL DEFAULT 0,
    vendor_workshop TEXT NOT NULL,
    notes TEXT,
    status maintenance_status NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Fuel Telemetry Records
CREATE TABLE IF NOT EXISTS fuel_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lorry_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    lorry_code TEXT NOT NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    driver_name TEXT,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    fuel_quantity_liters NUMERIC(8, 2) NOT NULL CHECK (fuel_quantity_liters > 0),
    fuel_price_per_liter NUMERIC(8, 2) NOT NULL CHECK (fuel_price_per_liter > 0),
    total_cost_inr NUMERIC(10, 2) NOT NULL,
    odometer_km INTEGER NOT NULL,
    distance_km NUMERIC(8, 2) NOT NULL,
    efficiency_km_per_l NUMERIC(5, 2) NOT NULL,
    fuel_station TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Operating Expenses (FASTag Toll, Parking, Allowances)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    lorry_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    lorry_code TEXT,
    category TEXT NOT NULL,
    amount_inr NUMERIC(10, 2) NOT NULL CHECK (amount_inr > 0),
    estimated_amount_inr NUMERIC(10, 2),
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    description TEXT NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Statutory Compliance Documents (Vehicle & Driver)
CREATE TABLE IF NOT EXISTS vehicle_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lorry_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    lorry_code TEXT NOT NULL,
    document_type TEXT NOT NULL,
    document_number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status document_status NOT NULL DEFAULT 'VALID',
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    driver_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    document_number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status document_status NOT NULL DEFAULT 'VALID',
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fuel_price_per_liter NUMERIC(8, 2) NOT NULL DEFAULT 96.50,
    driver_base_rate_per_km NUMERIC(8, 2) NOT NULL DEFAULT 6.00,
    operating_cost_per_km NUMERIC(8, 2) NOT NULL DEFAULT 3.20,
    fixed_dispatch_cost_per_lorry NUMERIC(8, 2) NOT NULL DEFAULT 800.00,
    auto_dispatch_high_priority BOOLEAN NOT NULL DEFAULT false,
    route_deviation_threshold_km NUMERIC(6, 2) NOT NULL DEFAULT 1.50,
    average_speed_km_per_h INTEGER NOT NULL DEFAULT 48,
    loading_time_minutes INTEGER NOT NULL DEFAULT 30,
    service_time_per_stop_mins INTEGER NOT NULL DEFAULT 20,
    road_distance_factor NUMERIC(4, 2) NOT NULL DEFAULT 1.28,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    user_role user_role NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    before_data JSONB,
    after_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
