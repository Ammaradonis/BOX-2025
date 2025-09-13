-- Classes table schema for Supabase/Postgres
-- Safe creation with constraints, references, and indexes

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INT,
    capacity INT,
    type TEXT CHECK (type IN ('group', 'youth', 'competitive', 'private')),
    instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    recurrence_pattern TEXT,
    price NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Ensure important columns exist (non-breaking migrations)
ALTER TABLE classes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS duration_minutes INT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS capacity INT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS price NUMERIC(10,2);
ALTER TABLE classes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now() NOT NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now() NOT NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add unique constraint to prevent duplicate class entries at same start_time with same instructor
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_instructor_class_time'
    ) THEN
        ALTER TABLE classes
        ADD CONSTRAINT unique_instructor_class_time UNIQUE (instructor_id, start_time);
    END IF;
END$$;

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_classes_instructor_id ON classes(instructor_id);
CREATE INDEX IF NOT EXISTS idx_classes_type ON classes(type);
CREATE INDEX IF NOT EXISTS idx_classes_start_time ON classes(start_time);
CREATE INDEX IF NOT EXISTS idx_classes_is_active ON classes(is_active);
