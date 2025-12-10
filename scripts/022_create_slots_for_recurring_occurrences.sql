-- Create slots for all recurring event occurrences
-- This ensures each occurrence date has its own set of slots

DO $$
DECLARE
  event_record RECORD;
  slot_record RECORD;
  occurrence_date TIMESTAMP WITH TIME ZONE;
  recurrence_data JSONB;
  interval_value TEXT;
  interval_unit TEXT;
  occurrence_count INT;
  i INT;
BEGIN
  -- Loop through all recurring events
  FOR event_record IN 
    SELECT id, date, recurrence_rule 
    FROM events 
    WHERE recurrence_rule IS NOT NULL
  LOOP
    recurrence_data := event_record.recurrence_rule::jsonb;
    
    -- Get interval and count from recurrence rule
    interval_value := recurrence_data->>'interval';
    interval_unit := recurrence_data->>'frequency';
    occurrence_count := COALESCE((recurrence_data->>'count')::int, 4);
    
    -- Get all existing slots for this event (from first occurrence)
    FOR slot_record IN 
      -- Removed start_time, end_time, description columns that don't exist in slots table
      SELECT name, capacity
      FROM slots 
      WHERE event_id = event_record.id 
        AND occurrence_date = event_record.date
      LIMIT 1
    LOOP
      -- Create slots for each occurrence date
      FOR i IN 1..(occurrence_count - 1) LOOP
        -- Calculate occurrence date based on frequency
        IF interval_unit = 'weekly' THEN
          occurrence_date := event_record.date + (i * interval_value::int || ' weeks')::interval;
        ELSIF interval_unit = 'daily' THEN
          occurrence_date := event_record.date + (i * interval_value::int || ' days')::interval;
        ELSIF interval_unit = 'monthly' THEN
          occurrence_date := event_record.date + (i * interval_value::int || ' months')::interval;
        END IF;
        
        -- Check if slot already exists for this occurrence
        IF NOT EXISTS (
          SELECT 1 FROM slots 
          WHERE event_id = event_record.id 
            AND name = slot_record.name 
            AND occurrence_date = occurrence_date
        ) THEN
          -- Create the slot
          -- Removed start_time, end_time, description from INSERT
          INSERT INTO slots (
            event_id, 
            name, 
            capacity,
            available,
            occurrence_date
          ) VALUES (
            event_record.id,
            slot_record.name,
            slot_record.capacity,
            slot_record.capacity, -- Set available to capacity initially
            occurrence_date
          );
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
