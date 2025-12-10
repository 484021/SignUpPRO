-- Add occurrence_date column to slots table to track which occurrence a slot belongs to
ALTER TABLE slots ADD COLUMN IF NOT EXISTS occurrence_date timestamp with time zone;

-- Add index for faster queries on occurrence_date
CREATE INDEX IF NOT EXISTS idx_slots_occurrence_date ON slots(occurrence_date);

-- Update existing slots for non-recurring events to have occurrence_date matching event date
UPDATE slots 
SET occurrence_date = (SELECT date FROM events WHERE events.id = slots.event_id)
WHERE occurrence_date IS NULL 
AND event_id IN (SELECT id FROM events WHERE recurrence_rule IS NULL);
