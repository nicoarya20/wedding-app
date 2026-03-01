/* eslint-disable no-undef */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const databaseUrl = process.env.DATABASE_URL;

console.log('🚀 Starting database seed...\n');

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

// Use pg for direct SQL execution
const { Client } = await import('pg');

const client = new Client({
  connectionString: databaseUrl,
});

async function executeSQL() {
  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read SQL file
    const sqlPath = join(__dirname, 'manual-seed.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log('📝 Executing SQL script...');
    console.log('   This may take a few seconds...\n');

    // Execute SQL
    await client.query(sql);

    console.log('✅ SQL executed successfully!\n');

    // Verify data
    console.log('🔍 Verifying data...\n');

    const adminResult = await client.query('SELECT username, role FROM "Admin"');
    console.log('   Admin users:', adminResult.rows.length);
    adminResult.rows.forEach(row => {
      console.log(`   - ${row.username} (${row.role})`);
    });

    const userResult = await client.query('SELECT email, name FROM "User"');
    console.log('\n   Users:', userResult.rows.length);
    userResult.rows.forEach(row => {
      console.log(`   - ${row.name} (${row.email})`);
    });

    const weddingResult = await client.query('SELECT slug, "coupleName" FROM "Wedding"');
    console.log('\n   Weddings:', weddingResult.rows.length);
    weddingResult.rows.forEach(row => {
      console.log(`   - ${row.coupleName} (/${row.slug})`);
    });

    const eventResult = await client.query('SELECT type, location FROM "Event"');
    console.log('\n   Events:', eventResult.rows.length);
    eventResult.rows.forEach(row => {
      console.log(`   - ${row.type} at ${row.location}`);
    });

    console.log('\n✅ Seed completed successfully!\n');
    console.log('🎉 Database is ready to use!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   User: user@example.com / password123\n');

  } catch (error) {
    console.error('❌ Error executing SQL:', error.message);
    if (error.detail) {
      console.error('   Detail:', error.detail);
    }
    if (error.hint) {
      console.error('   Hint:', error.hint);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

executeSQL();
