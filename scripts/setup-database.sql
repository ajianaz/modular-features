-- ============================================================================
-- Database Setup Script
-- ============================================================================
-- This script creates the PostgreSQL database and necessary extensions
-- Run this with: psql -U postgres -h localhost -p 5432 -d postgres -f scripts/setup-database.sql
-- ============================================================================

-- Create database if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'modular_monolith') THEN
        CREATE DATABASE modular_monolith
            WITH 
            OWNER = postgres
            ENCODING = 'UTF8'
            LC_COLLATE = 'en_US.UTF-8'
            LC_CTYPE = 'en_US.UTF-8'
            TEMPLATE = template0
            CONNECTION LIMIT = -1;
        
        RAISE NOTICE 'Database "modular_monolith" created successfully';
    ELSE
        RAISE NOTICE 'Database "modular_monolith" already exists';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE modular_monolith TO postgres;

-- Connect to the new database
\c modular_monolith

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- For full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gist";  -- For exclusion constraints
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- For cryptographic functions

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Display success message
SELECT 
    '✅ Database setup completed!' AS status,
    current_database() AS database_name,
    current_user AS current_user;
