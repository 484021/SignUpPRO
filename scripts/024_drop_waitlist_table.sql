-- Drop the old waitlist table since we now use signups.status = 'waitlisted' instead
DROP TABLE IF EXISTS waitlist CASCADE;

-- Drop the waitlist position update function if it exists
DROP FUNCTION IF EXISTS update_waitlist_positions(uuid);
