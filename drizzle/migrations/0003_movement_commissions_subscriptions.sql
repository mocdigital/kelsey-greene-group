CREATE TABLE public.campaign_progress (
  id text PRIMARY KEY,
  verified_experiences bigint NOT NULL DEFAULT 0 CHECK (verified_experiences >= 0),
  goal bigint NOT NULL DEFAULT 1000000 CHECK (goal > 0),
  milestones jsonb NOT NULL DEFAULT '[10000,50000,100000,250000,500000,750000,1000000]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT ON public.campaign_progress TO anon, authenticated;
GRANT ALL ON public.campaign_progress TO service_role;
ALTER TABLE public.campaign_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaign_progress_public_read ON public.campaign_progress FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.campaign_progress (id) VALUES ('movement') ON CONFLICT (id) DO NOTHING;

CREATE TABLE public.campaign_progress_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id text NOT NULL,
  previous_value bigint NOT NULL,
  new_value bigint NOT NULL,
  delta bigint NOT NULL,
  note text NOT NULL DEFAULT '',
  actor uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campaign_progress_log TO authenticated;
GRANT ALL ON public.campaign_progress_log TO service_role;
ALTER TABLE public.campaign_progress_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaign_log_staff ON public.campaign_progress_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'community_manager') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.ambassador_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE,
  order_reference text NOT NULL DEFAULT '',
  referral_code text NOT NULL,
  user_id uuid,
  base_ngn numeric NOT NULL DEFAULT 0,
  percent numeric NOT NULL DEFAULT 0,
  amount_ngn numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payout_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ambassador_commissions TO authenticated;
GRANT ALL ON public.ambassador_commissions TO service_role;
ALTER TABLE public.ambassador_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY commissions_own ON public.ambassador_commissions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY commissions_staff ON public.ambassador_commissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'community_manager') OR public.has_role(auth.uid(),'super_admin'));

ALTER TABLE public.subscriptions ADD COLUMN quantity integer NOT NULL DEFAULT 1;
ALTER TABLE public.subscriptions ADD COLUMN next_delivery_at timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN order_id uuid;
ALTER TABLE public.subscriptions ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();