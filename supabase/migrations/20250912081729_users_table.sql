-- Users profile table synced with Supabase Auth

CREATE TABLE IF NOT EXISTS users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    phone_number TEXT,
    role TEXT CHECK (role IN ('member', 'trainer', 'staff', 'admin')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    profile_picture_url TEXT,
    address TEXT,
    date_of_birth DATE,
    emergency_contact TEXT
);

-- Ensure email uniqueness safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_profile_email_key'
    ) THEN
        ALTER TABLE users_profile ADD CONSTRAINT users_profile_email_key UNIQUE (email);
    END IF;
END $$;

-- Indexes for performance (safe create)
CREATE INDEX IF NOT EXISTS idx_users_profile_role ON users_profile(role);
CREATE INDEX IF NOT EXISTS idx_users_profile_email ON users_profile(email);
CREATE INDEX IF NOT EXISTS idx_users_profile_is_active ON users_profile(is_active);
