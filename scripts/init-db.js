/**
 * Database initialization script
 * Creates the database and runs migrations without requiring Prisma CLI
 */

import Database from 'better-sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'prisma', 'dev.sqlite');
const migrationsPath = join(__dirname, '..', 'prisma', 'migrations');

console.log('Initializing database...');
console.log('Database path:', dbPath);

// Create database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create migrations table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT PRIMARY KEY,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0
  );
`);

// Get all migration directories
const migrations = readdirSync(migrationsPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .sort();

console.log(`Found ${migrations.length} migrations`);

// Apply each migration
for (const migration of migrations) {
  const migrationPath = join(migrationsPath, migration, 'migration.sql');

  try {
    // Check if migration was already applied
    const applied = db.prepare(
      'SELECT * FROM "_prisma_migrations" WHERE migration_name = ?'
    ).get(migration);

    if (applied) {
      console.log(`✓ Migration ${migration} already applied`);
      continue;
    }

    // Read migration SQL
    const sql = readFileSync(migrationPath, 'utf8');

    // Execute migration
    db.exec(sql);

    // Record migration
    db.prepare(`
      INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1)
    `).run(
      Math.random().toString(36).substring(7),
      migration,
      migration
    );

    console.log(`✓ Applied migration ${migration}`);
  } catch (error) {
    console.error(`✗ Failed to apply migration ${migration}:`, error.message);
    process.exit(1);
  }
}

db.close();
console.log('✓ Database initialized successfully!');
