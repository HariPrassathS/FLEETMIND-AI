-- ============================================================================
-- FLEETMIND AI — COMPLETE UNIFIED SUPABASE SCHEMA (ALL-IN-ONE)
-- Description: Complete production schema containing all extensions, enums,
--              tables, indexes, deterministic functions, triggers, RLS policies,
--              storage buckets, Realtime publications, and seed data.
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SECTION 2: CANONICAL ENUMS & CUSTOM TYPES
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CUSTOMER', 'DISPATCHER', 'DRIVER', 'MANAGER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lorry_status AS ENUM ('AVAILABLE', 'ON_ROUTE', 'LOADING', 'UNAVAILABLE', 'MAINTENANCE', 'OFFLINE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE driver_status AS ENUM ('AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'RESTING', 'UNAVAILABLE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shipment_status AS ENUM (
        'DRAFT',
        'PENDING_REVIEW',
        'PENDING_DISPATCH',
        'PENDING',
        'ACCEPTED',
        'ASSIGNMENT_PENDING',
        'ASSIGNED',
        
        'PICKUP_SCHEDULED',
        'EN_ROUTE_TO_PICKUP',
        'ARRIVED_PICKUP',
        'PICKED_UP',
        'IN_TRANSIT',
        'ARRIVED_DESTINATION',
        'ARRIVED',
        'OUT_FOR_DELIVERY',
        'DELIVERY_VERIFICATION',
        'DELIVERED',
        'DELAYED',
        'REROUTED',
        'CANCELLED',
        'REJECTED',
        'FAILED_DELIVERY',
        'REQUIRES_REOPTIMIZATION',
        'UNASSIGNED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shipment_priority AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shipment_category AS ENUM (
        'GENERAL',
        'PERISHABLE',
        'HAZARDOUS',
        'FRAGILE',
        'TEXTILE',
        'ELECTRONICS',
        'AUTOMOTIVE',
        'AGRICULTURE',
        'FOOD',
        'INDUSTRIAL',
        'DOCUMENTS',
        'MEDICAL',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('PLANNED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'INTERRUPTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE maintenance_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('VALID', 'EXPIRING_SOON', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE breakdown_status AS ENUM ('REPORTED', 'UNDER_REVIEW', 'ASSISTANCE', 'RESOLVED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- SECTION 3: CORE TABLES
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

-- 11. Operating Expenses (FASTag Toll, Parking, Driver Allowances)
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

-- 14. Immutable Audit Logs
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

-- ============================================================================
-- SECTION 4: HIGH PERFORMANCE B-TREE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_shipments_customer_id ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_priority ON shipments(priority);
CREATE INDEX IF NOT EXISTS idx_shipments_deadline ON shipments(delivery_deadline);
CREATE INDEX IF NOT EXISTS idx_shipments_assigned_lorry ON shipments(assigned_lorry_id);
CREATE INDEX IF NOT EXISTS idx_shipments_assigned_driver ON shipments(assigned_driver_id);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver ON vehicles(driver_id);

CREATE INDEX IF NOT EXISTS idx_drivers_availability ON drivers(availability_status);
CREATE INDEX IF NOT EXISTS idx_drivers_user ON drivers(user_id);

CREATE INDEX IF NOT EXISTS idx_trips_lorry ON trips(lorry_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

CREATE INDEX IF NOT EXISTS idx_gps_driver_recorded ON gps_locations(driver_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_gps_vehicle_recorded ON gps_locations(vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_gps_trip_recorded ON gps_locations(trip_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_lorry ON expenses(lorry_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_fuel_lorry_date ON fuel_records(lorry_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_maintenance_lorry_next ON maintenance_records(lorry_id, next_service_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_docs_expiry ON vehicle_documents(lorry_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_driver_docs_expiry ON driver_documents(driver_id, expiry_date);

-- ============================================================================
-- SECTION 5: FUNCTIONS & AUTOMATED TRIGGERS
-- ============================================================================

-- Distance calculation in KM
CREATE OR REPLACE FUNCTION calculate_haversine_distance(
    lat1 NUMERIC,
    lon1 NUMERIC,
    lat2 NUMERIC,
    lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    dlat NUMERIC;
    dlon NUMERIC;
    a NUMERIC;
    c NUMERIC;
    r NUMERIC := 6371.0;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
    c := 2 * atan2(sqrt(a), sqrt(1 - a));
    RETURN ROUND(r * c * 1.28, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Timestamp update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON vehicles;
CREATE TRIGGER trg_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_drivers_updated_at ON drivers;
CREATE TRIGGER trg_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_shipments_updated_at ON shipments;
CREATE TRIGGER trg_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_trips_updated_at ON trips;
CREATE TRIGGER trg_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 6: ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "Public profiles are viewable by authenticated users" ON profiles
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid()::text = firebase_uid);

-- Shipments policies
DROP POLICY IF EXISTS "Customer can view own shipments" ON shipments;
CREATE POLICY "Customer can view own shipments" ON shipments
    FOR SELECT TO authenticated
    USING (
        customer_id IN (SELECT id FROM profiles WHERE firebase_uid = auth.uid()::text)
        OR EXISTS (SELECT 1 FROM profiles WHERE firebase_uid = auth.uid()::text AND role IN ('DISPATCHER', 'MANAGER', 'ADMIN'))
    );

DROP POLICY IF EXISTS "Customer can insert shipments" ON shipments;
CREATE POLICY "Customer can insert shipments" ON shipments
    FOR INSERT TO authenticated
    WITH CHECK (
        customer_id IN (SELECT id FROM profiles WHERE firebase_uid = auth.uid()::text)
        OR EXISTS (SELECT 1 FROM profiles WHERE firebase_uid = auth.uid()::text AND role IN ('DISPATCHER', 'ADMIN'))
    );

DROP POLICY IF EXISTS "Dispatchers and Admins can update shipments" ON shipments;
CREATE POLICY "Dispatchers and Admins can update shipments" ON shipments
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE firebase_uid = auth.uid()::text AND role IN ('DISPATCHER', 'DRIVER', 'ADMIN')));

-- GPS Telemetry policies
DROP POLICY IF EXISTS "Drivers can insert GPS location" ON gps_locations;
CREATE POLICY "Drivers can insert GPS location" ON gps_locations
    FOR INSERT TO authenticated
    WITH CHECK (
        driver_id IN (SELECT id FROM drivers WHERE user_id IN (SELECT id FROM profiles WHERE firebase_uid = auth.uid()::text))
        OR EXISTS (SELECT 1 FROM profiles WHERE firebase_uid = auth.uid()::text AND role IN ('DRIVER', 'DISPATCHER', 'ADMIN'))
    );

DROP POLICY IF EXISTS "GPS locations are viewable by operational staff" ON gps_locations;
CREATE POLICY "GPS locations are viewable by operational staff" ON gps_locations
    FOR SELECT TO authenticated USING (true);

-- Vehicles & Drivers policies
DROP POLICY IF EXISTS "Vehicles viewable by authenticated users" ON vehicles;
CREATE POLICY "Vehicles viewable by authenticated users" ON vehicles
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Drivers viewable by authenticated users" ON drivers;
CREATE POLICY "Drivers viewable by authenticated users" ON drivers
    FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- SECTION 7: STORAGE BUCKETS & POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('vehicle-images', 'vehicle-images', true),
    ('delivery-proofs', 'delivery-proofs', false),
    ('driver-documents', 'driver-documents', false),
    ('vehicle-documents', 'vehicle-documents', false),
    ('expense-receipts', 'expense-receipts', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public vehicle images" ON storage.objects;
CREATE POLICY "Public vehicle images" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Authenticated users can upload delivery proofs" ON storage.objects;
CREATE POLICY "Authenticated users can upload delivery proofs" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'delivery-proofs');

DROP POLICY IF EXISTS "Operational staff can read delivery proofs" ON storage.objects;
CREATE POLICY "Operational staff can read delivery proofs" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'delivery-proofs');

-- ============================================================================
-- SECTION 8: SUPABASE REALTIME REPLICATION SETUP
-- ============================================================================
DO $$
BEGIN
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE gps_locations; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE shipments; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE trips; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE vehicles; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drivers; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE breakdowns; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE cargo_transfers; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_records; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ============================================================================
-- SECTION 9: INITIAL PRODUCTION CONFIGURATION
-- ============================================================================

-- Default system settings
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

-- Canonical System Administrator Profile
INSERT INTO profiles (
    firebase_uid,
    email,
    full_name,
    role,
    is_active,
    is_verified
) VALUES (
    'Mv2VcEbnG9dtzFxxS6twdO2DKGG3',
    'admin@fleetmind.ai',
    'System Administrator',
    'ADMIN',
    true,
    true
) ON CONFLICT (firebase_uid) DO UPDATE 
SET role = 'ADMIN', is_active = true, is_verified = true;

-- Canonical Executive Manager Profile
INSERT INTO profiles (
    firebase_uid,
    email,
    full_name,
    role,
    is_active,
    is_verified
) VALUES (
    'xCQEV4tTJUMaavZaK2qxxMUCJ922',
    'manager@fleetmind.ai',
    'Executive Manager',
    'MANAGER',
    true,
    true
) ON CONFLICT (firebase_uid) DO UPDATE 
SET role = 'MANAGER', is_active = true, is_verified = true;



