-- Add clerk_id column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS clerk_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_clerk_id ON events(clerk_id);

-- Update events RLS policies to support both user_id and clerk_id during migration
DROP POLICY IF EXISTS events_select_own ON events;
DROP POLICY IF EXISTS events_insert_own ON events;
DROP POLICY IF EXISTS events_update_own ON events;
DROP POLICY IF EXISTS events_delete_own ON events;

-- New RLS policies that check both user_id and clerk_id
CREATE POLICY events_select_own ON events
  FOR SELECT
  USING (user_id = auth.uid() OR clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY events_insert_own ON events
  FOR INSERT
  WITH CHECK (clerk_id = auth.jwt() ->> 'sub' OR user_id = auth.uid());

CREATE POLICY events_update_own ON events
  FOR UPDATE
  USING (user_id = auth.uid() OR clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY events_delete_own ON events
  FOR DELETE
  USING (user_id = auth.uid() OR clerk_id = auth.jwt() ->> 'sub');
