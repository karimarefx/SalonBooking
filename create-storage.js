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
  // Insert the bucket record
  `INSERT INTO storage.buckets (id, name, public)
   VALUES ('salon-photos', 'salon-photos', true)
   ON CONFLICT (id) DO NOTHING`,
   
  // SELECT policy
  `DROP POLICY IF EXISTS "Allow public read access for salon-photos" ON storage.objects`,
  `CREATE POLICY "Allow public read access for salon-photos"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'salon-photos')`,
   
  // INSERT policy
  `DROP POLICY IF EXISTS "Allow public insert access for salon-photos" ON storage.objects`,
  `CREATE POLICY "Allow public insert access for salon-photos"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'salon-photos')`,
   
  // DELETE policy
  `DROP POLICY IF EXISTS "Allow public delete access for salon-photos" ON storage.objects`,
  `CREATE POLICY "Allow public delete access for salon-photos"
   ON storage.objects FOR DELETE
   USING (bucket_id = 'salon-photos')`
];

async function run() {
  const client = new pg.Client(config);
  await client.connect();
  console.log('Connected to database for storage setup!');

  for (const stmt of statements) {
    try {
      await client.query(stmt);
      console.log('OK:', stmt.substring(0, 75).replace(/\n/g, ' '));
    } catch (e) {
      console.warn('SKIP/FAIL:', e.message.substring(0, 100));
    }
  }

  await client.end();
  console.log('\nStorage setup finished!');
}

run().catch(console.error);
