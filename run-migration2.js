import pg from 'pg';

const config = {
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dnsemwlraycvgsylpken',
  password: 'SalonSecureBooking2026!',
  ssl: { rejectUnauthorized: false }
};

const defaultSchedule = JSON.stringify({
  monday:    { enabled: true,  start: "09:00", end: "18:00" },
  tuesday:   { enabled: true,  start: "09:00", end: "18:00" },
  wednesday: { enabled: true,  start: "09:00", end: "18:00" },
  thursday:  { enabled: true,  start: "09:00", end: "18:00" },
  friday:    { enabled: true,  start: "09:00", end: "18:00" },
  saturday:  { enabled: true,  start: "10:00", end: "16:00" },
  sunday:    { enabled: false, start: "09:00", end: "18:00" }
});

const statements = [
  `ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS owner_email TEXT`,
  `ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '${defaultSchedule}'::jsonb`,
  `ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS slot_duration_minutes INTEGER DEFAULT 60`,
  `DROP POLICY IF EXISTS "Allow public update/delete access on bookings" ON public.bookings`,
  `CREATE POLICY "Allow client booking cancellation" ON public.bookings FOR DELETE USING (true)`,
  `CREATE POLICY "Allow booking status update" ON public.bookings FOR UPDATE USING (true)`,
];

async function run() {
  const client = new pg.Client(config);
  await client.connect();
  console.log('Connected!');

  for (const stmt of statements) {
    try {
      await client.query(stmt);
      console.log('OK:', stmt.substring(0, 70).replace(/\n/g, ' '));
    } catch (e) {
      console.warn('SKIP:', e.message.substring(0, 100));
    }
  }

  await client.end();
  console.log('\nMigration finished!');
}

run().catch(console.error);
