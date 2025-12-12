-- COMPREHENSIVE DATABASE SCHEMA IMPROVEMENTS
-- Future-proof the database with proper types, constraints, and indexes

-- ============================================================================
-- 1. EVENTS TABLE - Core improvements
-- ============================================================================

-- Add proper datetime columns (if not exists from 027)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS start_time text;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS end_datetime timestamptz;

-- Add soft delete support (better than hard deletes)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS deleted_by text;

-- Add audit trail
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS updated_by text;

-- Add capacity tracking at event level (removed total_capacity - calculated in view)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS total_signups integer DEFAULT 0;

-- Add event metadata (JSON for extensibility)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add constraints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_total_signups_non_negative') THEN
    ALTER TABLE public.events ADD CONSTRAINT events_total_signups_non_negative CHECK (total_signups >= 0);
  END IF;
END $$;

-- Improve status enum (add draft, cancelled, full)
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_valid_status;
ALTER TABLE public.events
ADD CONSTRAINT events_status_check CHECK (status IN ('draft', 'open', 'closed', 'cancelled', 'full'));

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_slug_active ON public.events(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_clerk_id_active ON public.events(clerk_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON public.events(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. SLOTS TABLE - Improvements
-- ============================================================================

-- Add soft delete
ALTER TABLE public.slots
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add order/priority for slot display
ALTER TABLE public.slots
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Add slot metadata
ALTER TABLE public.slots
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add constraints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'slots_capacity_positive') THEN
    ALTER TABLE public.slots ADD CONSTRAINT slots_capacity_positive CHECK (capacity > 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'slots_available_valid') THEN
    ALTER TABLE public.slots ADD CONSTRAINT slots_available_valid CHECK (available >= 0 AND available <= capacity);
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_slots_event_active ON public.slots(event_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_slots_occurrence ON public.slots(occurrence_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_slots_display_order ON public.slots(event_id, display_order) WHERE deleted_at IS NULL;

-- ============================================================================
-- 3. SIGNUPS TABLE - Improvements
-- ============================================================================

-- Add soft delete
ALTER TABLE public.signups
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add signup source tracking
ALTER TABLE public.signups
ADD COLUMN IF NOT EXISTS signup_source text DEFAULT 'web';

ALTER TABLE public.signups
ADD COLUMN IF NOT EXISTS referrer_url text;

ALTER TABLE public.signups
ADD COLUMN IF NOT EXISTS user_agent text;

-- Add confirmation tracking
ALTER TABLE public.signups
ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

ALTER TABLE public.signups
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz;

-- Add check-in support
ALTER TABLE public.signups
ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

ALTER TABLE public.signups
ADD COLUMN IF NOT EXISTS checked_in_by text;

-- Improve status enum (add no-show)
ALTER TABLE public.signups DROP CONSTRAINT IF EXISTS signups_status_check;
ALTER TABLE public.signups
ADD CONSTRAINT signups_status_check 
CHECK (status IN ('confirmed', 'cancelled', 'waitlisted', 'no-show'));

-- Add constraints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'signups_valid_email') THEN
    ALTER TABLE public.signups ADD CONSTRAINT signups_valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_signups_event_active ON public.signups(event_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_signups_slot_active ON public.signups(slot_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_signups_email ON public.signups(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_signups_status ON public.signups(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_signups_occurrence ON public.signups(occurrence_date) WHERE deleted_at IS NULL;

-- ============================================================================
-- 4. USERS TABLE - Improvements
-- ============================================================================

-- Add subscription/billing tracking
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- Add usage tracking
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS events_created_count integer DEFAULT 0;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS signups_received_count integer DEFAULT 0;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

-- Add user preferences
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{}'::jsonb;

-- Add soft delete
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add constraints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_valid_plan') THEN
    ALTER TABLE public.users ADD CONSTRAINT users_valid_plan CHECK (plan IN ('free', 'pro', 'enterprise'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_valid_subscription_status') THEN
    ALTER TABLE public.users ADD CONSTRAINT users_valid_subscription_status 
    CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'past_due', 'cancelled'));
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan) WHERE deleted_at IS NULL;

-- ============================================================================
-- 5. NEW TABLE: EVENT_ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.event_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  page_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  signup_conversion_rate numeric(5,2),
  peak_viewing_time timestamptz,
  avg_time_on_page integer, -- seconds
  bounce_rate numeric(5,2),
  metadata jsonb DEFAULT '{}'::jsonb,
  date date NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  
  UNIQUE(event_id, date)
);

CREATE INDEX IF NOT EXISTS idx_event_analytics_event ON public.event_analytics(event_id);
CREATE INDEX IF NOT EXISTS idx_event_analytics_date ON public.event_analytics(date);

-- ============================================================================
-- 6. NEW TABLE: ACTIVITY_LOG (Audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  clerk_id text,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL, -- 'event', 'signup', 'slot', etc.
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_clerk ON public.activity_log(clerk_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_event ON public.activity_log(event_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);

-- ============================================================================
-- 7. NEW TABLE: NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'signup', 'reminder', 'cancellation', etc.
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read_at timestamptz,
  delivered_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at);

-- ============================================================================
-- 8. VIEWS - For common queries
-- ============================================================================

-- View: Active events with slot counts
CREATE OR REPLACE VIEW active_events_with_slots AS
SELECT 
  e.*,
  COUNT(DISTINCT s.id) as slot_count,
  SUM(s.capacity) as total_capacity,
  SUM(s.capacity - s.available) as slots_filled
FROM public.events e
LEFT JOIN public.slots s ON s.event_id = e.id AND s.deleted_at IS NULL
WHERE e.deleted_at IS NULL
GROUP BY e.id;

-- View: Event signup statistics
CREATE OR REPLACE VIEW event_signup_stats AS
SELECT 
  e.id as event_id,
  e.title,
  e.slug,
  COUNT(DISTINCT su.id) FILTER (WHERE su.status = 'confirmed') as confirmed_count,
  COUNT(DISTINCT su.id) FILTER (WHERE su.status = 'waitlisted') as waitlisted_count,
  COUNT(DISTINCT su.id) FILTER (WHERE su.status = 'cancelled') as cancelled_count,
  COUNT(DISTINCT su.id) as total_signups,
  MAX(su.created_at) as last_signup_at
FROM public.events e
LEFT JOIN public.signups su ON su.event_id = e.id AND su.deleted_at IS NULL
WHERE e.deleted_at IS NULL
GROUP BY e.id, e.title, e.slug;

-- ============================================================================
-- 9. FUNCTIONS - Business logic
-- ============================================================================

-- Function: Update slot availability when signup is created/cancelled
CREATE OR REPLACE FUNCTION update_slot_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE public.slots 
    SET available = available - 1 
    WHERE id = NEW.slot_id AND available > 0;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
      UPDATE public.slots 
      SET available = available + 1 
      WHERE id = OLD.slot_id;
    ELSIF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      UPDATE public.slots 
      SET available = available - 1 
      WHERE id = NEW.slot_id AND available > 0;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE public.slots 
    SET available = available + 1 
    WHERE id = OLD.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_slot_availability ON public.signups;
CREATE TRIGGER trigger_update_slot_availability
  AFTER INSERT OR UPDATE OR DELETE ON public.signups
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_availability();

-- Function: Auto-update event total_signups
CREATE OR REPLACE FUNCTION update_event_signup_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.events
  SET total_signups = (
    SELECT COUNT(*) 
    FROM public.signups 
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id) 
      AND status = 'confirmed'
      AND deleted_at IS NULL
  )
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_event_signup_count ON public.signups;
CREATE TRIGGER trigger_update_event_signup_count
  AFTER INSERT OR UPDATE OR DELETE ON public.signups
  FOR EACH ROW
  EXECUTE FUNCTION update_event_signup_count();

-- ============================================================================
-- 10. RLS POLICIES - Security updates
-- ============================================================================

-- Update existing policies to respect soft deletes
DROP POLICY IF EXISTS "events_select_public" ON public.events;
CREATE POLICY "events_select_public"
  ON public.events FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "slots_select_public" ON public.slots;
CREATE POLICY "slots_select_public"
  ON public.slots FOR SELECT
  USING (deleted_at IS NULL);

-- Analytics table policies
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_analytics_select_own" ON public.event_analytics;
CREATE POLICY "event_analytics_select_own"
  ON public.event_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_analytics.event_id
      AND (events.user_id = auth.uid() OR events.clerk_id = auth.jwt() ->> 'sub')
    )
  );

-- Activity log policies
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_log_select_own" ON public.activity_log;
CREATE POLICY "activity_log_select_own"
  ON public.activity_log FOR SELECT
  USING (user_id = auth.uid() OR clerk_id = auth.jwt() ->> 'sub');

DROP POLICY IF EXISTS "activity_log_insert_authenticated" ON public.activity_log;
CREATE POLICY "activity_log_insert_authenticated"
  ON public.activity_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Notifications policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- COMMENTS - Documentation
-- ============================================================================

COMMENT ON TABLE public.events IS 'Core events table with soft delete support';
COMMENT ON COLUMN public.events.metadata IS 'Flexible JSON field for custom event data';
COMMENT ON COLUMN public.events.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN public.events.end_datetime IS 'Full end timestamp - preferred over end_time';

COMMENT ON TABLE public.event_analytics IS 'Daily analytics aggregation per event';
COMMENT ON TABLE public.activity_log IS 'Audit trail for all system actions';
COMMENT ON TABLE public.notifications IS 'User notifications and alerts';

COMMENT ON VIEW active_events_with_slots IS 'Active events with aggregated slot statistics';
COMMENT ON VIEW event_signup_stats IS 'Event signup counts by status';
