-- Enable UUID generation extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create services table (adds it if missing)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_per_session NUMERIC,
    duration_minutes INTEGER NOT NULL,
    target_audience TEXT,
    required_equipment TEXT,
    availability TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    is_featured BOOLEAN DEFAULT false
);

-- Ensure user_id column exists and is linked to auth.users(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='services' AND column_name='user_id'
    ) THEN
        ALTER TABLE services
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add unique constraint (user_id + name), only if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_user_service_name'
    ) THEN
        ALTER TABLE services
        ADD CONSTRAINT unique_user_service_name UNIQUE (user_id, name);
    END IF;
END $$;

-- Indexes to speed up queries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_services_user_id'
    ) THEN
        CREATE INDEX idx_services_user_id ON services(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_services_is_featured'
    ) THEN
        CREATE INDEX idx_services_is_featured ON services(is_featured);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_services_target_audience'
    ) THEN
        CREATE INDEX idx_services_target_audience ON services(target_audience);
    END IF;
END $$;
