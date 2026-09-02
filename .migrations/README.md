# Database migrations — read-only schema history

These `.sql` files are the source-of-truth history of the schema applied to
the live Supabase Postgres database. They are **not** a local database, a
JSON store, or anything the app reads at runtime — they exist purely so the
schema can be reproduced from code (a new environment, disaster recovery, a
teammate onboarding) instead of only existing inside the live database.

**Do not edit or delete files in this folder.** Once a migration has been
applied (via `yarn db:migrate`, see `scripts/run-migrations.js`), it is
permanent history — the same way Rails/Django/Prisma/Supabase-CLI migrations
work. If the schema needs to change further, add a **new** numbered file
here (e.g. `003_*.sql`) rather than editing an existing one.

Applying them requires `SUPABASE_DB_URL` in `.env.local` (see `.env.example`)
— a direct Postgres connection string, separate from the `SUPABASE_URL`/
`SUPABASE_ANON_KEY` pair the app uses at runtime, since DDL (`CREATE TABLE`)
can't go through the PostgREST API the app normally talks to.

`SUPABASE_NORMALIZED_SCHEMA.sql` and `SUPABASE_TABLE_STRUCTURE.md` are older
reference documents (a normalized per-table design that was never actually
applied — the live app stores CMS content as a single JSON blob instead, see
`lib/supabase.ts`). Kept here for history, not run by `yarn db:migrate`.
