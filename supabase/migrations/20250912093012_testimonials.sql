-- Testimonials table schema for Supabase/Postgres
-- Ensures smooth execution in Supabase SQL Editor without dropping existing data

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    date_submitted TIMESTAMPTZ DEFAULT now() NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    source TEXT,
    image_url TEXT,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add missing columns if they don’t exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='id') THEN
        ALTER TABLE testimonials ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='user_id') THEN
        ALTER TABLE testimonials ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='content') THEN
        ALTER TABLE testimonials ADD COLUMN content TEXT NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='rating') THEN
        ALTER TABLE testimonials ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='date_submitted') THEN
        ALTER TABLE testimonials ADD COLUMN date_submitted TIMESTAMPTZ DEFAULT now() NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='is_approved') THEN
        ALTER TABLE testimonials ADD COLUMN is_approved BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='source') THEN
        ALTER TABLE testimonials ADD COLUMN source TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='image_url') THEN
        ALTER TABLE testimonials ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='title') THEN
        ALTER TABLE testimonials ADD COLUMN title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='created_at') THEN
        ALTER TABLE testimonials ADD COLUMN created_at TIMESTAMPTZ DEFAULT now() NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='updated_at') THEN
        ALTER TABLE testimonials ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now() NOT NULL;
    END IF;
END $$;

-- Indexes to speed up queries
CREATE INDEX IF NOT EXISTS idx_testimonials_date_submitted ON testimonials(date_submitted);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_approved ON testimonials(is_approved);
