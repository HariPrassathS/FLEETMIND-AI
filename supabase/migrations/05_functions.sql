-- ============================================================================
-- FLEETMIND AI — SUPABASE MIGRATION: 05_FUNCTIONS.SQL
-- Purpose: Deterministic business logic calculation functions
-- ============================================================================

-- Deterministic Haversine Distance Function in KM
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
    r NUMERIC := 6371.0; -- Earth radius in km
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
    c := 2 * atan2(sqrt(a), sqrt(1 - a));
    RETURN ROUND(r * c * 1.28, 2); -- 1.28 Highway road curvature factor
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Deterministic Trip Cost Calculator Function
CREATE OR REPLACE FUNCTION calculate_deterministic_trip_cost(
    distance_km NUMERIC,
    fuel_efficiency_km_per_l NUMERIC,
    fuel_price_per_l NUMERIC,
    driver_rate_per_km NUMERIC,
    operating_rate_per_km NUMERIC,
    fixed_overhead NUMERIC
) RETURNS JSONB AS $$
DECLARE
    fuel_liters NUMERIC;
    fuel_cost NUMERIC;
    driver_cost NUMERIC;
    operating_cost NUMERIC;
    est_toll NUMERIC;
    total_cost NUMERIC;
BEGIN
    fuel_liters := ROUND(distance_km / GREATEST(fuel_efficiency_km_per_l, 1.0), 2);
    fuel_cost := ROUND(fuel_liters * fuel_price_per_l, 2);
    driver_cost := ROUND(distance_km * driver_rate_per_km, 2);
    operating_cost := ROUND(distance_km * operating_rate_per_km, 2);
    est_toll := ROUND(distance_km * 2.2, 2);
    total_cost := fuel_cost + driver_cost + operating_cost + est_toll + fixed_overhead;

    RETURN jsonb_build_object(
        'distance_km', distance_km,
        'fuel_liters', fuel_liters,
        'fuel_cost_inr', fuel_cost,
        'driver_cost_inr', driver_cost,
        'operating_cost_inr', operating_cost,
        'toll_cost_estimated_inr', est_toll,
        'total_estimated_inr', total_cost
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
