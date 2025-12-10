-- Remove redirect_url and auto_close_at fields that are no longer needed
ALTER TABLE events DROP COLUMN IF EXISTS redirect_url;
ALTER TABLE events DROP COLUMN IF EXISTS auto_close_at;
