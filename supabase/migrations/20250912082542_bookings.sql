-- Create the bookings table only if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    booking_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'attended')),
    payment_status TEXT CHECK (payment_status IN ('paid', 'unpaid', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    confirmation_code TEXT UNIQUE
);

-- Add missing columns safely (if table already exists)
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS booking_date DATE NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS booking_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS payment_status TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS confirmation_code TEXT;

-- Add the unique constraint only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_class_time'
    ) THEN
        ALTER TABLE bookings
        ADD CONSTRAINT unique_user_class_time UNIQUE (user_id, class_id, booking_time);
    END IF;
END$$;

-- Create indexes safely
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
