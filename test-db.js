import pg from 'pg';

const testUsers = [
  'postgres',
  'postgres.dnsemwlraycvgsylpken',
  'postgres.huxujyglnkytntjvsfmq'
];

async function test(user) {
  const client = new pg.Client({
    host: '108.128.216.176',
    port: 5432,
    database: 'postgres',
    user: user,
    password: 'SalonSecureBooking2026!',
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log(`Testing user: ${user}...`);
    await client.connect();
    console.log(`Success with user ${user}!`);
    const res = await client.query('SELECT current_database(), current_user');
    console.log('Query result:', res.rows[0]);
    await client.end();
    return true;
  } catch (err) {
    console.error(`Failed user ${user}:`, err.message);
    try { await client.end(); } catch(e) {}
    return false;
  }
}

async function run() {
  for (const user of testUsers) {
    const success = await test(user);
    if (success) break;
  }
}

run();
