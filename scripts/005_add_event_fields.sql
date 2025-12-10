-- Add show_signups field to events table to control public visibility of signups
-- Add redirect_url field for post-signup redirects

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS show_signups BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS redirect_url TEXT;

COMMENT ON COLUMN events.show_signups IS 'Whether to show signup list publicly';
COMMENT ON COLUMN events.redirect_url IS 'URL to redirect to after successful signup';
