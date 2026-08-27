const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.fswljspsdqgivzyewguz:Prassath%402007@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected!');

    const sql = `
      -- Disable RLS on all operational tables
      ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.vehicles DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.drivers DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.shipments DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.trips DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.routes DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.maintenance_logs DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.expenses DISABLE ROW LEVEL SECURITY;

      -- Grant full permissions to anon, authenticated, postgres, and service_role
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;
      GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, postgres, service_role;

      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, postgres, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, postgres, service_role;

      -- Enable realtime publication on all tables for instant WebSocket multi-device sync
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
          CREATE PUBLICATION supabase_realtime;
        END IF;
      END $$;

      ALTER PUBLICATION supabase_realtime SET TABLE public.profiles, public.vehicles, public.drivers, public.shipments, public.trips, public.notifications;
    `;

    console.log('Executing RLS & Realtime configuration...');
    await client.query(sql);
    console.log('Successfully configured Supabase PostgreSQL permissions & Realtime replication!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await client.end();
  }
}

main();
