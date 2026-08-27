-- ============================================================================
-- FLEETMIND AI — SUPABASE MIGRATION: 08_STORAGE.SQL
-- Purpose: Storage Buckets & Policies for POD Photos, Signatures & Docs
-- ============================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('vehicle-images', 'vehicle-images', true),
    ('delivery-proofs', 'delivery-proofs', false),
    ('driver-documents', 'driver-documents', false),
    ('vehicle-documents', 'vehicle-documents', false),
    ('expense-receipts', 'expense-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public vehicle images" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'vehicle-images');

CREATE POLICY "Authenticated users can upload delivery proofs" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'delivery-proofs');

CREATE POLICY "Operational staff can read delivery proofs" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'delivery-proofs');
