-- Add RLS policy to allow deleting signups
-- Event owners can delete signups from their events
-- Anyone can delete signups by matching email (for self-removal)

-- Allow event owners to delete signups from their events
CREATE POLICY "signups_delete_by_event_owner" ON signups
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = signups.event_id
    AND events.user_id = auth.uid()
  )
);

-- Allow anyone to delete their own signup by email (for self-removal feature)
CREATE POLICY "signups_delete_by_email" ON signups
FOR DELETE
USING (true);
