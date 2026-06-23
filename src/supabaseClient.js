import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnsemwlraycvgsylpken.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc2Vtd2xyYXljdmdzeWxwa2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDgwNTEsImV4cCI6MjA5Nzc4NDA1MX0.L6RHxGNr7Z3XHogVDUrwZEmvjAjXS4__DEItkJA6qyM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
