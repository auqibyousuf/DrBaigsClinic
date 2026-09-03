/**
 * Applies this project's SQL schema files to Supabase via code — no manual
 * pasting into the Supabase SQL editor required.
 *
 * Usage:
 *   yarn db:migrate
 *
 * Requires SUPABASE_DB_URL in .env.local — a direct Postgres connection
 * string, not the SUPABASE_URL/SUPABASE_ANON_KEY pair used elsewhere in the
 * app (those go through PostgREST, which can't run DDL like CREATE TABLE).
 * Get it from: Supabase Dashboard -> Project Settings -> Database ->
 * Connection string -> URI (use the "Session pooler" or direct connection,
 * with your database password filled in).
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Migrations live in .migrations/ — a dedicated, read-only schema-history
// folder (see .migrations/README.md) — not loose in the project root.
const MIGRATIONS_DIR = '.migrations';
const MIGRATIONS = [
  '001_appointments_schema.sql',
  '002_patients_schema.sql',
  '003_doctor_schedules.sql',
  '004_prescriptions_digital_rx.sql',
  '005_patients_profile_fields.sql',
  '006_invoices.sql',
  '007_invoices_storage.sql',
  '008_appointments_finished_status.sql',
  '009_prescriptions_history_records.sql',
  '010_medical_history_structured.sql',
];

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    console.error(
      '\nSUPABASE_DB_URL is not set.\n\n' +
        'Add it to .env.local — get it from:\n' +
        '  Supabase Dashboard -> Project Settings -> Database -> Connection string -> URI\n' +
        '(fill in your database password, then paste the full string as SUPABASE_DB_URL).\n'
    );
    process.exit(1);
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Supabase Postgres.');

  try {
    for (const file of MIGRATIONS) {
      const filePath = path.join(__dirname, '..', MIGRATIONS_DIR, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`Skipping ${file} — file not found.`);
        continue;
      }
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`Applying ${file} ...`);
      await client.query(sql);
      console.log(`  done.`);
    }
    console.log('\nAll migrations applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
