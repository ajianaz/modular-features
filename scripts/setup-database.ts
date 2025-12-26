#!/usr/bin/env bun

/**
 * Setup Database Script
 * 
 * This script creates the PostgreSQL database if it doesn't exist
 * and then runs the migrations using docker exec.
 */

import { spawn } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DB_NAME = process.env.POSTGRES_DB || 'modular_monolith';
const DB_USER = process.env.POSTGRES_USER || 'postgres';
const DB_PASSWORD = process.env.POSTGRES_PASSWORD || '';
const DB_HOST = process.env.POSTGRES_HOST || 'localhost';
const DB_PORT = process.env.POSTGRES_PORT || '5432';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Force using dev database, not test
console.log('🔧 Setting up database...');
console.log(`📦 Environment: ${NODE_ENV}`);
console.log(`📦 Database: ${DB_NAME}`);
console.log(`👤 User: ${DB_USER}`);
console.log(`🌐 Host: ${DB_HOST}:${DB_PORT}`);

/**
 * Execute SQL via Docker
 */
function execSqlViaDocker(database: string, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      'exec',
      '-i',
      'modular-monolith-postgres',
      'psql',
      '-U', DB_USER,
      '-d', database,
      '-q'  // Quiet mode
    ];

    console.log(`   [DEBUG] Executing: docker ${args.join(' ')}`);

    const proc = spawn('docker', args);
    
    let stdout = '';
    let stderr = '';

    proc.stdin.write(sql);
    proc.stdin.end();

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      const chunk = data.toString();
      // Filter out NOTICE messages which are not errors
      if (!chunk.includes('NOTICE:')) {
        stderr += chunk;
      }
    });

    proc.on('close', (code) => {
      if (code === 0) {
        if (stdout) console.log(`   [STDOUT] ${stdout.trim()}`);
        resolve();
      } else {
        console.error(`   [STDERR] ${stderr}`);
        console.error(`   [EXIT CODE] ${code}`);
        reject(new Error(stderr || 'Command failed with exit code ' + code));
      }
    });
  });
}

/**
 * Execute SQL via psql (direct connection)
 */
function execSqlViaPsql(database: string, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      '-U', DB_USER,
      '-h', DB_HOST,
      '-p', DB_PORT,
      '-d', database,
      '-q'  // Quiet mode
    ];

    console.log(`   [DEBUG] Executing: psql ${args.join(' ')}`);

    const proc = spawn('psql', args);
    
    let stdout = '';
    let stderr = '';

    proc.stdin.write(sql);
    proc.stdin.end();

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      const chunk = data.toString();
      // Filter out NOTICE messages
      if (!chunk.includes('NOTICE:')) {
        stderr += chunk;
      }
    });

    proc.on('close', (code) => {
      if (code === 0) {
        if (stdout) console.log(`   [STDOUT] ${stdout.trim()}`);
        resolve();
      } else {
        console.error(`   [STDERR] ${stderr}`);
        console.error(`   [EXIT CODE] ${code}`);
        reject(new Error(stderr || 'Command failed with exit code ' + code));
      }
    });
  });
}

// Check if using Docker
const isDocker = process.env.USE_DOCKER !== 'false';

// Force recreate database
const FORCE_RECREATE = process.env.FORCE_DB_RECREATE === 'true';

async function dropDatabase() {
  try {
    console.log('🗑️  Dropping existing database...');

    // First, disconnect all connections
    const disconnectSql = `
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '${DB_NAME}'
  AND pid <> pg_backend_pid();
`;

    const dropSql = `DROP DATABASE IF EXISTS ${DB_NAME};`;

    if (isDocker) {
      await execSqlViaDocker('postgres', disconnectSql);
      await execSqlViaDocker('postgres', dropSql);
      console.log(`✅ Database "${DB_NAME}" dropped successfully (via Docker)`);
    } else {
      await execSqlViaPsql('postgres', disconnectSql);
      await execSqlViaPsql('postgres', dropSql);
      console.log(`✅ Database "${DB_NAME}" dropped successfully`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error dropping database:', error);
    return false;
  }
}

async function createDatabase() {
  try {
    console.log('📦 Creating database...');

    const sql = `DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}') THEN
        CREATE DATABASE ${DB_NAME}
            WITH 
            OWNER = ${DB_USER}
            ENCODING = 'UTF8'
            LC_COLLATE = 'en_US.UTF-8'
            LC_CTYPE = 'en_US.UTF-8'
            TEMPLATE = template0
            CONNECTION LIMIT = -1;
        
        RAISE NOTICE '✅ Database created';
    ELSE
        RAISE NOTICE 'ℹ️  Database already exists';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
`;

    if (isDocker) {
      await execSqlViaDocker('postgres', sql);
      console.log(`✅ Database "${DB_NAME}" created successfully (via Docker)`);
    } else {
      await execSqlViaPsql('postgres', sql);
      console.log(`✅ Database "${DB_NAME}" created successfully`);
    }

    // Verify database was created
    await verifyDatabaseExists();

    return true;
  } catch (error) {
    console.error('❌ Error creating database:', error);
    return false;
  }
}

async function verifyDatabaseExists() {
  try {
    const checkSql = `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}';`;
    
    if (isDocker) {
      await execSqlViaDocker('postgres', checkSql);
    } else {
      await execSqlViaPsql('postgres', checkSql);
    }
    
    console.log(`✅ Verified database "${DB_NAME}" exists`);
  } catch (error) {
    throw new Error(`Database "${DB_NAME}" does not exist after creation`);
  }
}

async function enableExtensions() {
  try {
    console.log('🔌 Enabling extensions...');

    const sql = `-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Display success
SELECT 
    '✅ Extensions enabled successfully' AS status,
    extname AS extension_name,
    extversion AS version
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pg_trgm', 'btree_gist', 'pgcrypto')
ORDER BY extname;
`;

    if (isDocker) {
      await execSqlViaDocker(DB_NAME, sql);
    } else {
      await execSqlViaPsql(DB_NAME, sql);
    }

    console.log('✅ Extensions enabled successfully');
    return true;
  } catch (error) {
    console.error('❌ Error enabling extensions:', error);
    return false;
  }
}

async function runMigrations() {
  try {
    console.log('📝 Generating migrations...');
    
    const generateProc = spawn('bun', ['run', 'db:generate'], {
      cwd: `${process.cwd()}/packages/database`,
      stdio: 'inherit'
    });

    await new Promise<void>((resolve, reject) => {
      generateProc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('db:generate failed'));
      });
    });
    
    console.log('🚀 Running migrations...');
    
    const migrateProc = spawn('bun', ['run', 'db:migrate'], {
      cwd: `${process.cwd()}/packages/database`,
      stdio: 'inherit'
    });

    await new Promise<void>((resolve, reject) => {
      migrateProc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('db:migrate failed'));
      });
    });
    
    console.log('✅ Migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    return false;
  }
}

async function main() {
  // Check if we should force recreate
  if (FORCE_RECREATE) {
    console.log('⚠️  FORCE_DB_RECREATE is true. Dropping existing database...');
    await dropDatabase();
  }

  const dbCreated = await createDatabase();
  
  if (!dbCreated) {
    console.error('❌ Failed to create database. Exiting...');
    process.exit(1);
  }

  const extensionsEnabled = await enableExtensions();
  
  if (!extensionsEnabled) {
    console.warn('⚠️  Failed to enable extensions. Continuing anyway...');
  }

  const migrationsRan = await runMigrations();
  
  if (!migrationsRan) {
    console.error('❌ Failed to run migrations. Exiting...');
    process.exit(1);
  }

  console.log('✅ Database setup completed successfully!');
  console.log(`\n📊 Database info:`);
  console.log(`   Database: ${DB_NAME}`);
  console.log(`   Host: ${DB_HOST}:${DB_PORT}`);
  console.log(`   User: ${DB_USER}`);
  console.log(`\n🔗 Connection string:`);
  console.log(`   postgresql://${DB_USER}:****@${DB_HOST}:${DB_PORT}/${DB_NAME}\n`);
  
  process.exit(0);
}

main();
