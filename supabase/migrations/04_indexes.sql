-- ============================================================================
-- FLEETMIND AI — SUPABASE MIGRATION: 04_INDEXES.SQL
-- Purpose: B-Tree & Analytical Indexes for High Performance Queries
-- ============================================================================

-- Shipments indexing
CREATE INDEX IF NOT EXISTS idx_shipments_customer_id ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_priority ON shipments(priority);
CREATE INDEX IF NOT EXISTS idx_shipments_deadline ON shipments(delivery_deadline);
CREATE INDEX IF NOT EXISTS idx_shipments_assigned_lorry ON shipments(assigned_lorry_id);
CREATE INDEX IF NOT EXISTS idx_shipments_assigned_driver ON shipments(assigned_driver_id);

-- Vehicles indexing
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver ON vehicles(driver_id);

-- Drivers indexing
CREATE INDEX IF NOT EXISTS idx_drivers_availability ON drivers(availability_status);
CREATE INDEX IF NOT EXISTS idx_drivers_user ON drivers(user_id);

-- Trips indexing
CREATE INDEX IF NOT EXISTS idx_trips_lorry ON trips(lorry_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

-- GPS Telemetry indexing
CREATE INDEX IF NOT EXISTS idx_gps_driver_recorded ON gps_locations(driver_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_gps_vehicle_recorded ON gps_locations(vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_gps_trip_recorded ON gps_locations(trip_id, recorded_at DESC);

-- Expenses & Fuel indexing
CREATE INDEX IF NOT EXISTS idx_expenses_lorry ON expenses(lorry_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_fuel_lorry_date ON fuel_records(lorry_id, date DESC);

-- Maintenance & Compliance indexing
CREATE INDEX IF NOT EXISTS idx_maintenance_lorry_next ON maintenance_records(lorry_id, next_service_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_docs_expiry ON vehicle_documents(lorry_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_driver_docs_expiry ON driver_documents(driver_id, expiry_date);
