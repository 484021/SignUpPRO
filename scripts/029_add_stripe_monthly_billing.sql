-- Add Stripe subscription fields for monthly billing
-- This enables organizer monetization via Stripe monthly subscriptions

-- Add Stripe customer and subscription tracking
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Update plan constraints to include 'monthly'
-- Drop all existing plan constraints
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_plan_check;

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_valid_plan;

-- Add new constraint with monthly support
ALTER TABLE public.users
ADD CONSTRAINT users_plan_check CHECK (plan IN ('free', 'monthly', 'pro', 'enterprise'));

-- Create indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription ON public.users(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- Update existing 'pro' users to 'monthly' for consistency (optional - uncomment if needed)
-- UPDATE public.users SET plan = 'monthly' WHERE plan = 'pro';

COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.users.stripe_subscription_id IS 'Stripe subscription ID for active monthly plan';
