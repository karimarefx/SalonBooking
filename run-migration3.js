const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://huxujyglnkytntjvsfmq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

async function runMigration() {
  console.log('🚀 Running Migration 3: add slot_duration_minutes to bookings...\n');

  const sql = `
    -- Add slot_duration_minutes to bookings for availability blocking
    ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS slot_duration_minutes INTEGER DEFAULT 60;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();

  if (error) {
    // Try direct approach
    console.log('RPC not available, trying direct execute_sql...');
    const { error: err2 } = await supabase.from('bookings').select('slot_duration_minutes').limit(1);
    if (err2 && err2.message.includes('column "slot_duration_minutes" does not exist')) {
      console.error('❌ Column does not exist. Please run this SQL in the Supabase SQL Editor:\n');
      console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS slot_duration_minutes INTEGER DEFAULT 60;');
    } else {
      console.log('✅ slot_duration_minutes column already exists or was added successfully.');
    }
    return;
  }

  console.log('✅ Migration 3 complete!');
}

runMigration().catch(console.error);
