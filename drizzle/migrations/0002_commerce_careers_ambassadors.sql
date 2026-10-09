ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS reference text,
  ADD COLUMN IF NOT EXISTS access_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS delivery_zone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS delivery_fee_ngn numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal_ngn numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_ngn numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'bank_transfer',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'received',
  ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS orders_reference_key ON public.orders(reference);
CREATE INDEX IF NOT EXISTS orders_referral_code_idx ON public.orders(referral_code);

CREATE TABLE public.promo_codes(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  percent_off numeric NOT NULL DEFAULT 0,
  amount_off_ngn numeric NOT NULL DEFAULT 0,
  min_subtotal_ngn numeric NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY promo_staff ON public.promo_codes FOR ALL TO authenticated
 USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerce_manager'))
 WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerce_manager'));

CREATE TABLE public.referral_visits(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text NOT NULL,
  path text NOT NULL DEFAULT '/',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX referral_visits_code_idx ON public.referral_visits(referral_code);
GRANT SELECT ON public.referral_visits TO authenticated;
GRANT ALL ON public.referral_visits TO service_role;
ALTER TABLE public.referral_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY referral_visits_staff ON public.referral_visits FOR SELECT TO authenticated
 USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'community_manager'));

CREATE TABLE public.ambassador_payouts(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  referral_code text NOT NULL,
  period_label text NOT NULL DEFAULT '',
  amount_ngn numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ambassador_payouts TO authenticated;
GRANT ALL ON public.ambassador_payouts TO service_role;
ALTER TABLE public.ambassador_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY payouts_own ON public.ambassador_payouts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY payouts_staff ON public.ambassador_payouts FOR ALL TO authenticated
 USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'community_manager'))
 WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'community_manager'));

CREATE TABLE public.job_applications(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_slug text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  portfolio_url text NOT NULL DEFAULT '',
  experience text NOT NULL DEFAULT '',
  cover_letter text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY job_applications_staff ON public.job_applications FOR ALL TO authenticated
 USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'community_manager'))
 WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'community_manager'));

-- Bootstrap super administrator (existing account now, or on first sign-up)
CREATE OR REPLACE FUNCTION public.grant_bootstrap_super_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF lower(NEW.email) = 'mocdigital77@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id,'super_admin'),(NEW.id,'admin') ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_auth_user_bootstrap_admin ON auth.users;
CREATE TRIGGER on_auth_user_bootstrap_admin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.grant_bootstrap_super_admin();
INSERT INTO public.user_roles(user_id, role)
SELECT u.id, r.role::public.app_role FROM auth.users u CROSS JOIN (VALUES ('super_admin'),('admin')) AS r(role)
WHERE lower(u.email) = 'mocdigital77@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Illustrative commerce defaults, editable in the CMS
INSERT INTO public.promo_codes(code, description, percent_off, min_subtotal_ngn) VALUES ('WELCOME10','Illustrative launch code: 10% off the bag subtotal',10,0) ON CONFLICT (code) DO NOTHING;

INSERT INTO public.cms_records(kind,slug,title,description,status,position,payload) VALUES
('setting','delivery','Delivery zones','Delivery zones and fees used at checkout.','published',2,'{"illustrative":true,"zones":[{"id":"lagos-mainland","label":"Lagos Mainland","fee_ngn":2500,"eta":"1–2 working days"},{"id":"lagos-island","label":"Lagos Island","fee_ngn":3500,"eta":"1–2 working days"},{"id":"national","label":"National / Other States","fee_ngn":6000,"eta":"3–7 working days"}],"free_over_ngn":0}'),
('setting','commerce','Commerce settings','Payment instructions and ambassador commission.','published',3,'{"illustrative":true,"bank_name":"To be confirmed","account_name":"Kelsey Greene Group","account_number":"To be confirmed","commission_percent":5,"attribution_days":30,"card_mode":"staging"}'),
('site','shell','Site shell','Announcement banner, menu highlights and footer links.','published',0,'{"announcement":{"active":true,"text":"Join the 1 Million Breakfast Movement — discover the breakfast range.","label":"Shop now","path":"/shop"},"menu_highlights":[{"title":"Discovery Box","description":"Five breakfast products in one box.","path":"/discovery-box"},{"title":"Global African Breakfast Day","description":"Host or join a celebration.","path":"/breakfast-day"},{"title":"Careers","description":"Build with the Group.","path":"/careers"}],"footer_columns":[{"heading":"THE GROUP","links":[{"label":"About the group","path":"/group"},{"label":"Our values","path":"/values"},{"label":"Careers","path":"/careers"},{"label":"Partnerships","path":"/partnerships"},{"label":"Contact & enquiries","path":"/enquiry"}]},{"heading":"SHOP","links":[{"label":"Marketplace","path":"/shop"},{"label":"Discovery & bundles","path":"/discovery-box"},{"label":"Find our products","path":"/stores"},{"label":"Shipping & delivery","path":"/shipping"},{"label":"Returns & refunds","path":"/returns"}]},{"heading":"CONNECT & DISCOVER","links":[{"label":"1 Million Breakfast Movement","path":"/movement"},{"label":"Global African Breakfast Day","path":"/breakfast-day"},{"label":"Recipes","path":"/recipes"},{"label":"Stories","path":"/stories"},{"label":"Ambassadors","path":"/ambassador"}]}]}'),
('product','family-box','Family Box','A larger breakfast selection for households.','published',30,'{"illustrative":true,"listing_type":"bundle","business_slug":"foods-agro-allied","category":"Bundles","image":"marketplace-discovery-box","size":"10 packs","price_espee":450,"contents":["2 × Plain Millet Pap","2 × Milky Millet Pap","2 × Spicy Millet Pap","2 × Date Powder","2 × Beans Flour"]}'),
('product','monthly-box','Monthly Box','A month of breakfasts, packed once.','published',31,'{"illustrative":true,"listing_type":"bundle","business_slug":"foods-agro-allied","category":"Bundles","image":"marketplace-discovery-box","size":"20 packs","price_espee":880,"contents":["4 × Plain Millet Pap","4 × Milky Millet Pap","4 × Spicy Millet Pap","4 × Date Powder","4 × Beans Flour"]}'),
('product','business-box','Business Box','Bulk breakfast supply for offices, schools and retailers.','published',32,'{"illustrative":true,"listing_type":"bundle","business_slug":"foods-agro-allied","category":"Bundles","image":"marketplace-discovery-box","size":"50 packs","price_espee":2100,"contents":["10 × Plain Millet Pap","10 × Milky Millet Pap","10 × Spicy Millet Pap","10 × Date Powder","10 × Beans Flour"]}'),
('recipe','spiced-millet-pap-bowl','Spiced millet pap bowl','A warming breakfast bowl built on Spicy Millet Pap.','published',1,'{"illustrative":true,"image":"spicy","prep_time":"5 min","cook_time":"10 min","servings":"2","body":"A simple, warming way to start the day.","ingredients":["4 tbsp Spicy Millet Pap","500ml water","Milk to taste","Honey or Date Powder to sweeten"],"steps":["Mix the pap with a little cold water into a smooth paste.","Bring the remaining water to the boil.","Pour the boiling water over the paste, stirring continuously until it thickens.","Finish with milk and sweeten to taste."]}'),
('recipe','date-sweetened-pap','Date-sweetened milky pap','Creamy Milky Millet Pap naturally sweetened with Date Powder.','published',2,'{"illustrative":true,"image":"milky","prep_time":"5 min","cook_time":"8 min","servings":"2","body":"A naturally sweet breakfast for the whole family.","ingredients":["4 tbsp Milky Millet Pap","2 tsp Date Powder","500ml water"],"steps":["Make a smooth paste with the pap and cold water.","Add boiling water while stirring until thick.","Stir in Date Powder and serve warm."]}'),
('recipe','beans-flour-pancakes','Beans flour breakfast pancakes','Savoury pancakes made with Beans Flour.','published',3,'{"illustrative":true,"image":"beans","prep_time":"10 min","cook_time":"15 min","servings":"4","body":"A protein-rich savoury start to the day.","ingredients":["1 cup Beans Flour","1 cup water","1 small onion, chopped","1 pepper, chopped","Salt to taste","Oil for frying"],"steps":["Whisk the flour and water into a smooth batter.","Fold in onion, pepper and salt.","Fry spoonfuls in a lightly oiled pan for 2–3 minutes per side.","Serve hot."]}'),
('story','pap-at-grandmas','Pap at grandma''s table','What did you eat growing up? A sample community story.','published',1,'{"illustrative":true,"image":"breakfast","series":"What Did You Eat Growing Up?","author":"Community contributor","location":"Lagos","body":"Every Saturday morning began the same way: the sound of a pot, the smell of warm pap, and a table that always had room for one more.\nThis is a sample story shared to illustrate the series. Real community stories will be published after approval."}'),
('story','school-morning-breakfasts','School-morning breakfasts','What did you eat growing up? A sample community story.','published',2,'{"illustrative":true,"image":"plain","series":"What Did You Eat Growing Up?","author":"Community contributor","location":"Accra","body":"Before school, breakfast had to be quick, filling and warm.\nThis is a sample story shared to illustrate the series. Real community stories will be published after approval."}'),
('story','sunday-akara-and-pap','Sunday akara and pap','What did you eat growing up? A sample community story.','published',3,'{"illustrative":true,"image":"beans","series":"What Did You Eat Growing Up?","author":"Community contributor","location":"Ibadan","body":"Sundays meant akara from the corner and pap made at home.\nThis is a sample story shared to illustrate the series. Real community stories will be published after approval."}'),
('location','sample-ikeja-retail','Sample Ikeja retail partner','Illustrative retail location.','published',1,'{"illustrative":true,"type":"retail","state":"Lagos","city":"Ikeja","territory":"Lagos Mainland","address":"Address to be confirmed, Ikeja, Lagos","hours":"Mon–Sat, 8am–7pm","phone":"To be confirmed"}'),
('location','sample-lekki-retail','Sample Lekki retail partner','Illustrative retail location.','published',2,'{"illustrative":true,"type":"retail","state":"Lagos","city":"Lekki","territory":"Lagos Island","address":"Address to be confirmed, Lekki, Lagos","hours":"Mon–Sun, 9am–8pm","phone":"To be confirmed"}'),
('location','sample-lagos-distributor','Sample Lagos distributor','Illustrative distribution partner.','published',3,'{"illustrative":true,"type":"distributor","state":"Lagos","city":"Surulere","territory":"Lagos Mainland","address":"Address to be confirmed, Surulere, Lagos","hours":"Mon–Fri, 8am–5pm","phone":"To be confirmed"}'),
('location','sample-abuja-retail','Sample Abuja retail partner','Illustrative retail location.','published',4,'{"illustrative":true,"type":"retail","state":"FCT","city":"Abuja","territory":"North Central","address":"Address to be confirmed, Wuse, Abuja","hours":"Mon–Sat, 8am–7pm","phone":"To be confirmed"}'),
('location','sample-ibadan-distributor','Sample Ibadan distributor','Illustrative distribution partner.','published',5,'{"illustrative":true,"type":"distributor","state":"Oyo","city":"Ibadan","territory":"South West","address":"Address to be confirmed, Ibadan, Oyo","hours":"Mon–Fri, 8am–5pm","phone":"To be confirmed"}'),
('job','marketing-executive-foods','Marketing Executive','Kelsey Greene Foods & Agro-Allied','published',1,'{"illustrative":true,"division":"Foods & Agro-Allied","location":"Lagos","type":"Full-time","summary":"Support the launch of the breakfast range and the 1 Million Breakfast Movement.","responsibilities":["Plan and execute product campaigns","Coordinate retail and community activations","Report on campaign performance"],"requirements":["2+ years in FMCG or food marketing","Strong written and spoken communication","Experience with digital channels"]}'),
('job','farm-operations-supervisor','Farm Operations Supervisor','Kelsey Greene Poultry Farms','published',2,'{"illustrative":true,"division":"Poultry Farms","location":"Ogun State","type":"Full-time","summary":"Oversee day-to-day poultry farm operations and team scheduling.","responsibilities":["Manage daily production routines","Maintain biosecurity standards","Lead and schedule farm staff"],"requirements":["Relevant agriculture qualification","3+ years farm operations experience","Leadership experience"]}'),
('job','greenhouse-technician','Greenhouse Technician','Kelsey Greene Greenhouse Farms','published',3,'{"illustrative":true,"division":"Greenhouse Farms","location":"Lagos","type":"Full-time","summary":"Maintain greenhouse systems and crop quality.","responsibilities":["Monitor irrigation and climate systems","Support planting and harvest","Record crop data"],"requirements":["Horticulture or agriculture background","Attention to detail","Willingness to work on site"]}'),
('job','property-sales-associate','Property Sales Associate','Kelsey Greene Properties','published',4,'{"illustrative":true,"division":"Properties","location":"Lagos","type":"Full-time","summary":"Guide enquirers through property opportunities.","responsibilities":["Respond to property enquiries","Arrange viewings","Maintain client records"],"requirements":["Sales or real estate experience","Excellent interpersonal skills","Valid driver''s licence preferred"]}'),
('event','breakfast-day-lagos','Breakfast Day celebration — Lagos','A community breakfast celebration. Date to be confirmed.','published',1,'{"illustrative":true,"date":"To be confirmed","city":"Lagos","format":"Community breakfast","highlight":"Products, recipes and stories shared around one table."}'),
('event','breakfast-day-schools','School breakfast mornings','Partner schools host breakfast mornings. Dates to be confirmed.','published',2,'{"illustrative":true,"date":"To be confirmed","city":"Participating schools","format":"School activation","highlight":"Introducing African breakfast traditions to young people."}'),
('event','breakfast-day-online','Global online breakfast table','Share your breakfast online wherever you are.','published',3,'{"illustrative":true,"date":"To be confirmed","city":"Online","format":"Digital campaign","highlight":"Diaspora communities join the table from around the world."}')
ON CONFLICT DO NOTHING;
UPDATE public.cms_records SET payload = payload || '{"listing_type":"bundle","contents":["1 × Plain Millet Pap","1 × Milky Millet Pap","1 × Spicy Millet Pap","1 × Date Powder","1 × Beans Flour"]}'::jsonb WHERE kind='product' AND slug='discovery-box';