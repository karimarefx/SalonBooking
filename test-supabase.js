import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnsemwlraycvgsylpken.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc2Vtd2xyYXljdmdzeWxwa2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDgwNTEsImV4cCI6MjA5Nzc4NDA1MX0.L6RHxGNr7Z3XHogVDUrwZEmvjAjXS4__DEItkJA6qyM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    console.log('Testing Supabase Client...');
    const { data, error } = await supabase.from('salons').select('*').limit(1);
    if (error) throw error;
    console.log('Successfully connected to Supabase!');
    console.log('Salons data:', data);
  } catch (err) {
    console.error('Failed connection:', err.message);
  }
}

run();
