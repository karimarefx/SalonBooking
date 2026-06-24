import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dnsemwlraycvgsylpken',
  password: 'SalonSecureBooking2026!',
  ssl: { rejectUnauthorized: false }
};

async function run() {
  const client = new pg.Client(config);
  try {
    await client.connect();
    console.log('Connected to Supabase database!');

    const migrationSql = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf8');
    
    // Split by semicolons and run each statement
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let success = 0;
    let failed = 0;
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        success++;
        console.log(`✓ Executed: ${stmt.substring(0, 60).replace(/\n/g,' ')}...`);
      } catch (e) {
        failed++;
        console.warn(`⚠ Skipped (may already exist): ${e.message.substring(0,100)}`);
      }
    }
    console.log(`\nMigration complete: ${success} succeeded, ${failed} skipped.`);
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
