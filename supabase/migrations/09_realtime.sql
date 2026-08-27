-- ============================================================================
-- FLEETMIND AI — SUPABASE MIGRATION: 09_REALTIME.SQL
-- Purpose: Enable Supabase Realtime Replication on Operational Tables
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE gps_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE trips;
ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE breakdowns;
ALTER PUBLICATION supabase_realtime ADD TABLE cargo_transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_records;
