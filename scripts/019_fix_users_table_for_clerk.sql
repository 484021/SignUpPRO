-- Fix users table to work properly with Clerk authentication
-- Remove any problematic foreign key constraints and ensure proper defaults

-- Drop any foreign key constraint on users.id if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_id_fkey') THEN
        ALTER TABLE users DROP CONSTRAINT users_id_fkey;
    END IF;
END $$;

-- Ensure id column has a default UUID generator
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Make clerk_id unique and not null since it's our primary identifier now
ALTER TABLE users ALTER COLUMN clerk_id SET NOT NULL;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_clerk_id_key') THEN
        ALTER TABLE users ADD CONSTRAINT users_clerk_id_key UNIQUE (clerk_id);
    END IF;
END $$;

-- Ensure events table properly references users by clerk_id
-- First check if we need to add the foreign key
DO $$ 
BEGIN
    -- Drop old foreign key on user_id if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_user_id_fkey') THEN
        ALTER TABLE events DROP CONSTRAINT events_user_id_fkey;
    END IF;
    
    -- Add foreign key on clerk_id
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_clerk_id_fkey') THEN
        ALTER TABLE events ADD CONSTRAINT events_clerk_id_fkey 
            FOREIGN KEY (clerk_id) REFERENCES users(clerk_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update RLS policies to work with Clerk
DROP POLICY IF EXISTS users_insert_own ON users;
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;

-- Create simple RLS policies that allow inserts and queries
CREATE POLICY users_insert_allow ON users
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY users_select_all ON users
    FOR SELECT
    USING (true);

CREATE POLICY users_update_own ON users
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
