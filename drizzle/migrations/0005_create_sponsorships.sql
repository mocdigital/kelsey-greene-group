CREATE TABLE public.sponsorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  organisation text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  boxes integer,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ESPEE',
  payment_method text NOT NULL DEFAULT 'espees',
  proof_path text,
  status text NOT NULL DEFAULT 'awaiting_payment',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.sponsorships TO authenticated;
GRANT ALL ON public.sponsorships TO service_role;
ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;
CREATE POLICY sponsorships_staff_read ON public.sponsorships FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'community_manager') OR has_role(auth.uid(),'super_admin'));
CREATE POLICY sponsorships_staff_update ON public.sponsorships FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'community_manager') OR has_role(auth.uid(),'super_admin')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'community_manager') OR has_role(auth.uid(),'super_admin'));