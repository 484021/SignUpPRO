-- Fix datetime consistency: store start and end as full timestamps
-- This eliminates the confusion between date (timestamp) and end_time (text HH:mm)

-- Step 1: Add new columns for proper datetime storage
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS start_time text, -- HH:mm format for TIME component only
ADD COLUMN IF NOT EXISTS end_datetime timestamptz; -- Full end datetime

-- Step 2: Migrate existing data
-- Extract time from date column into start_time
UPDATE public.events
SET start_time = TO_CHAR(date, 'HH24:MI')
WHERE start_time IS NULL;

-- If end_time exists, combine it with date to create end_datetime
UPDATE public.events
SET end_datetime = (date::date || ' ' || end_time || ':00')::timestamptz
WHERE end_time IS NOT NULL 
  AND end_time ~ '^\d{2}:\d{2}$'
  AND end_datetime IS NULL;

-- Step 3: Add comment for clarity
COMMENT ON COLUMN events.date IS 'Event start datetime (includes date + time)';
COMMENT ON COLUMN events.start_time IS 'Start time in HH:mm format (for display/editing)';
COMMENT ON COLUMN events.end_time IS 'DEPRECATED: Use end_datetime instead. Kept for backward compatibility.';
COMMENT ON COLUMN events.end_datetime IS 'Event end datetime (full timestamp)';
COMMENT ON COLUMN events.timezone IS 'Timezone for the event (e.g., America/New_York)';
