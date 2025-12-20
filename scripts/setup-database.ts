#!/usr/bin/env bun

/**
 * Setup Database Script
 * 
 * This script creates the PostgreSQL database if it doesn't exist
 * and then runs the migrations.
 */

import { Client } from 'pg';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

const DB_NAME = process.env.POSTGRES_DB || 'modular_monolith';
const DB_USER = process.env.POSTGRES_USER || 'postgres';
const DB_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres123';
const DB_HOST = process.env.POSTGRES_HOST || 'localhost';
const DB_PORT = process.env.POSTGRES_PORT || '5432';

console.log('🔧 Setting up database...');
console.log(`📦 Database: ${DB_NAME}`);
console.log(`👤 User: ${DB_USER}`);
console.log(`🌐 Host: ${DB_HOST}:${DB_PORT}`);

async function createDatabase() {
  const client = new Client({
    host: DB_HOST,
    port: parseInt(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'postgres', // Connect to default database
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [DB_NAME]
    );

    if (result.rows.length === 0) {
      // Create database
      await client.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`✅ Database "${DB_NAME}" created successfully`);
    } else {
      console.log(`ℹ️  Database "${DB_NAME}" already exists`);
    }

    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Error creating database:', error);
    await client.end();
    return false;
  }
}

async function runMigrations() {
  try {
    console.log('🔄 Running migrations...');
    execSync('bun run db:generate', {
      cwd: path.join(process.cwd(), 'packages/database'),
      stdio: 'inherit'
    });
    
    execSync('bun run db:migrate', {
      cwd: path.join(process.cwd(), 'packages/database'),
      stdio: 'inherit'
    });
    
    console.log('✅ Migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    return false;
  }
}

async function main() {
  const dbCreated = await createDatabase();
  
  if (!dbCreated) {
    console.error('❌ Failed to create database. Exiting...');
    process.exit(1);
  }

  const migrationsRan = await runMigrations();
  
  if (!migrationsRan) {
    console.error('❌ Failed to run migrations. Exiting...');
    process.exit(1);
  }

  console.log('✅ Database setup completed successfully!');
  process.exit(0);
}

main();
