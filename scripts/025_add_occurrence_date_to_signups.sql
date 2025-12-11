-- Add occurrence_date column to signups table to track which occurrence a signup belongs to
-- This is needed for waitlist promotion to work correctly with recurring events

ALTER TABLE signups ADD COLUMN IF NOT EXISTS occurrence_date timestamp with time zone;

-- Add index for faster queries on occurrence_date
CREATE INDEX IF NOT EXISTS idx_signups_occurrence_date ON signups(occurrence_date);

-- Backfill occurrence_date for existing signups by copying from their slot's occurrence_date
UPDATE signups 
SET occurrence_date = slots.occurrence_date
FROM slots 
WHERE signups.slot_id = slots.id 
AND signups.occurrence_date IS NULL 
AND slots.occurrence_date IS NOT NULL;

-- For signups with no slot occurrence_date, use the event date
UPDATE signups 
SET occurrence_date = events.date
FROM events 
WHERE signups.event_id = events.id 
AND signups.occurrence_date IS NULL;
