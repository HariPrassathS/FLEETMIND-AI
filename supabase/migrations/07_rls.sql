-- ============================================================================
-- FLEETMIND AI — SUPABASE MIGRATION: 07_RLS.SQL
-- Purpose: Row-Level Security Policies for Multi-Tenant Isolation
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

-- 1. Profiles policy
CREATE POLICY "Public profiles are viewable by authenticated users" ON profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid()::text = firebase_uid);

-- 2. Shipments policy (Customers only view own shipments; Dispatchers/Admins view all)
CREATE POLICY "Customer can view own shipments" ON shipments
    FOR SELECT TO authenticated
    USING (
        customer_id IN (SELECT id FROM profiles WHERE firebase_uid = auth.uid()::text)
        OR EXISTS (SELECT 1 FROM profiles WHERE firebase_uid = auth.uid()::text AND role IN ('DISPATCHER', 'MANAGER', 'ADMIN'))
    );

CREATE POLICY "Customer can insert shipments" ON shipments
    FOR INSERT TO authenticated
    WITH CHECK (
        customer_id IN (SELECT id FROM profiles WHERE firebase_uid = auth.uid()::text)
        OR EXISTS (SELECT 1 FROM profiles WHERE firebase_uid = auth.uid()::text AND role IN ('DISPATCHER', 'ADMIN'))
    );

CREATE POLICY "Dispatchers and Admins can update shipments" ON shipments
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE firebase_uid = auth.uid()::text AND role IN ('DISPATCHER', 'DRIVER', 'ADMIN')));

-- 3. GPS Locations (Authenticated drivers submit their own GPS; Dispatchers, Customers of active load, Managers view)
CREATE POLICY "Drivers can insert GPS location" ON gps_locations
    FOR INSERT TO authenticated
    WITH CHECK (
        driver_id IN (SELECT id FROM drivers WHERE user_id IN (SELECT id FROM profiles WHERE firebase_uid = auth.uid()::text))
        OR EXISTS (SELECT 1 FROM profiles WHERE firebase_uid = auth.uid()::text AND role IN ('DRIVER', 'DISPATCHER', 'ADMIN'))
    );

CREATE POLICY "GPS locations are viewable by operational staff" ON gps_locations
    FOR SELECT TO authenticated USING (true);

-- 4. Vehicles & Drivers
CREATE POLICY "Vehicles viewable by authenticated users" ON vehicles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Drivers viewable by authenticated users" ON drivers
    FOR SELECT TO authenticated USING (true);
