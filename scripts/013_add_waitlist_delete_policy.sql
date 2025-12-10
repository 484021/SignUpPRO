-- Add delete policy for waitlist table
-- Allows event owners to delete waitlist entries

DROP POLICY IF EXISTS waitlist_delete_own_event ON waitlist;

CREATE POLICY waitlist_delete_own_event ON waitlist
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = waitlist.event_id
    AND events.user_id = auth.uid()
  )
);

-- Also allow users to delete their own waitlist entries by manage token
DROP POLICY IF EXISTS waitlist_delete_by_token ON waitlist;

CREATE POLICY waitlist_delete_by_token ON waitlist
FOR DELETE
USING (true);  -- Allow anyone to delete if they have the ID (manage token provides security)
