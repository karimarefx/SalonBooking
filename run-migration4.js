import pg from 'pg';

const config = {
  host: '108.128.216.176',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dnsemwlraycvgsylpken',
  password: 'SalonSecureBooking2026!',
  ssl: { rejectUnauthorized: false }
};

const statements = [
  `CREATE TABLE IF NOT EXISTS public.salon_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id TEXT REFERENCES public.salons(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,
  `ALTER TABLE public.salon_photos ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "Allow public read access on salon_photos" ON public.salon_photos`,
  `CREATE POLICY "Allow public read access on salon_photos" ON public.salon_photos FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "Allow public insert access on salon_photos" ON public.salon_photos`,
  `CREATE POLICY "Allow public insert access on salon_photos" ON public.salon_photos FOR INSERT WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow public delete access on salon_photos" ON public.salon_photos`,
  `CREATE POLICY "Allow public delete access on salon_photos" ON public.salon_photos FOR DELETE USING (true)`
];

async function run() {
  const client = new pg.Client(config);
  await client.connect();
  console.log('Connected to database!');

  for (const stmt of statements) {
    try {
      await client.query(stmt);
      console.log('OK:', stmt.substring(0, 70).replace(/\n/g, ' '));
    } catch (e) {
      console.warn('SKIP/FAIL:', e.message.substring(0, 100));
    }
  }

  await client.end();
  console.log('\nMigration 4 finished!');
}

run().catch(console.error);
