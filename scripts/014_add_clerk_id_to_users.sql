-- Add clerk_id column to users table for Clerk authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Update users table RLS policies to use clerk_id
DROP POLICY IF EXISTS users_insert_own ON users;
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;

-- New RLS policies for Clerk
CREATE POLICY users_insert_own ON users
  FOR INSERT
  WITH CHECK (true); -- Allow inserts from any authenticated user

CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (clerk_id = auth.jwt() ->> 'sub' OR id = auth.uid());

CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (clerk_id = auth.jwt() ->> 'sub' OR id = auth.uid());
