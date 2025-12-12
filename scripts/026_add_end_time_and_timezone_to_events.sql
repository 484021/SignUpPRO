-- Add end_time and timezone columns to events table if they don't exist
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS end_time text,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS show_signups boolean DEFAULT true;

-- Add clerk_id column if it doesn't exist (for Clerk integration)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS clerk_id text;

-- Create an index on clerk_id for faster queries
CREATE INDEX IF NOT EXISTS idx_events_clerk_id ON public.events(clerk_id);
