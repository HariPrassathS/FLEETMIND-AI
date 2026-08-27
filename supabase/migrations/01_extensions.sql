-- ============================================================================
-- FLEETMIND AI — SUPABASE MIGRATION: 01_EXTENSIONS.SQL
-- Purpose: Enable core cryptographic and geospatial extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Spatial PostGIS if supported by host:
-- CREATE EXTENSION IF NOT EXISTS "postgis";
