-- Add new fields to events and signups tables

-- Add auto_close_at to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS auto_close_at TIMESTAMP WITH TIME ZONE;

-- Add paid status and notes to signups table
ALTER TABLE signups ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT FALSE;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index for auto-close queries
CREATE INDEX IF NOT EXISTS idx_events_auto_close_at ON events(auto_close_at) WHERE status = 'open';
