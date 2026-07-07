import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We try the direct IP first since the domain pooler DNS might be paused/down in sandbox,
// but fallback to the standard pooler hostname.
const configs = [
  {
    name: 'Direct IP Proxy',
    host: '108.128.216.176',
    port: 5432,
    database: 'postgres',
    user: 'postgres.dnsemwlraycvgsylpken',
    password: 'SalonSecureBooking2026!',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Standard pooler',
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.dnsemwlraycvgsylpken',
    password: 'SalonSecureBooking2026!',
    ssl: { rejectUnauthorized: false }
  }
];

async function runStatements(client, sqlText) {
  const statements = sqlText
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let success = 0;
  let failed = 0;
  for (const stmt of statements) {
    try {
      await client.query(stmt);
      success++;
      console.log(`  ✓ Executed: ${stmt.substring(0, 60).replace(/\n/g, ' ')}...`);
    } catch (e) {
      failed++;
      console.warn(`  ⚠ Error/Skip: ${e.message.substring(0, 100)}`);
    }
  }
  return { success, failed };
}

async function main() {
  let client = null;
  let connected = false;

  for (const config of configs) {
    try {
      console.log(`Trying connection using config: ${config.name}...`);
      client = new pg.Client(config);
      await client.connect();
      connected = true;
      console.log(`✅ Connected successfully using ${config.name}!`);
      break;
    } catch (err) {
      console.error(`❌ Failed connecting via ${config.name}:`, err.message);
      if (client) {
        try { await client.end(); } catch (e) {}
      }
    }
  }

  if (!connected) {
    console.error('\n🔴 Could not connect to the database. If your Supabase instance is paused, please restore it in the Supabase Dashboard.');
    console.log('You can run this migration script again once the database is active: `node run-all-migrations.js`');
    process.exit(1);
  }

  try {
    const migrationFiles = [
      'migrations/001_schema_fixes.sql',
      'migrations/002_reviews.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      console.log(`\nRunning migration file: ${file}...`);
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        continue;
      }
      const sqlText = fs.readFileSync(filePath, 'utf8');
      const { success, failed } = await runStatements(client, sqlText);
      console.log(`Completed ${file}: ${success} succeeded, ${failed} skipped/failed.`);
    }

    console.log('\n🎉 All database migrations processed!');
  } catch (err) {
    console.error('Migration processing failed:', err);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

main();
