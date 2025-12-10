-- Add 'waitlisted' as an allowed status value for signups

-- Drop the old constraint
ALTER TABLE signups DROP CONSTRAINT IF EXISTS signups_status_check;

-- Add the new constraint with 'waitlisted' included
ALTER TABLE signups ADD CONSTRAINT signups_status_check 
  CHECK (status IN ('confirmed', 'cancelled', 'waitlisted'));
