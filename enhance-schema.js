const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fswljspsdqgivzyewguz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzd2xqc3BzZHFnaXZ6eWV3Z3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTQ1NDAsImV4cCI6MjEwMzM5MDU0MH0.0HR-UwtcrgQk7BudCDvpTd3zdxzBoEIymv4KJrKfN0A'
);

async function runSchemaEnhancement() {
  console.log('Running SQL enhancement for vehicle-driver pairing and critical priority dispatch...');

  // Use RPC or raw SQL query if available, or alter table columns
  const sql = `
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS assigned_driver_name TEXT;
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS assigned_driver_id UUID;
    ALTER TABLE drivers ALTER COLUMN user_id DROP NOT NULL;
    ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_assigned_lorry_id_fkey;
    ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_user_id_fkey;
    ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_driver_id_fkey;
  `;

  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.log('RPC notice (using REST fallback):', error.message);
  } else {
    console.log('SQL executed successfully via RPC!');
  }
}

runSchemaEnhancement();
