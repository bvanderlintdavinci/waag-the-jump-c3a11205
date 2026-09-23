ALTER TABLE public.visitor_snapshots ADD COLUMN IF NOT EXISTS payment_intent_id text, ADD COLUMN IF NOT EXISTS revoked_at timestamptz, ADD COLUMN IF NOT EXISTS withdrawal_waiver_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_visitor_snapshots_pi ON public.visitor_snapshots(payment_intent_id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS anonymous_visits boolean NOT NULL DEFAULT false;
DELETE FROM public.visitor_snapshots s WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = s.user_id);
ALTER TABLE public.visitor_snapshots DROP CONSTRAINT IF EXISTS visitor_snapshots_user_id_fkey;
ALTER TABLE public.visitor_snapshots ADD CONSTRAINT visitor_snapshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
DROP TABLE IF EXISTS public.visit_unlocks;