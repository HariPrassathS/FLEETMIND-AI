-- ============================================================================
-- FLEETMIND AI — SUPABASE MIGRATION: 02_ENUMS.SQL
-- Purpose: Canonical Enums for deterministic logistics operations
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
