CREATE TABLE public.profiles (id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, full_name text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', organisation text NOT NULL DEFAULT '', preferences jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, UPDATE ON public.profiles TO authenticated; GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profile_own_read ON public.profiles FOR SELECT TO authenticated USING (id=auth.uid()); CREATE POLICY profile_own_update ON public.profiles FOR UPDATE TO authenticated USING(id=auth.uid()) WITH CHECK(id=auth.uid());
CREATE FUNCTION public.create_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN INSERT INTO public.profiles(id,full_name) VALUES(NEW.id,coalesce(NEW.raw_user_meta_data->>'full_name','')); RETURN NEW; END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_profile();
CREATE TYPE public.app_role AS ENUM ('admin','content_editor','publisher','commerce_manager','community_manager');
CREATE TABLE public.user_roles(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,role public.app_role NOT NULL,UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_roles ON public.user_roles FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role); $$;
CREATE TABLE public.cms_records(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),kind text NOT NULL,slug text NOT NULL,title text NOT NULL,description text NOT NULL DEFAULT '',payload jsonb NOT NULL DEFAULT '{}',status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),position integer NOT NULL DEFAULT 0,seo_title text NOT NULL DEFAULT '',seo_description text NOT NULL DEFAULT '',updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(kind,slug));
GRANT SELECT ON public.cms_records TO anon; GRANT SELECT,INSERT,UPDATE,DELETE ON public.cms_records TO authenticated; GRANT ALL ON public.cms_records TO service_role;
ALTER TABLE public.cms_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_content ON public.cms_records FOR SELECT TO anon,authenticated USING(status='published');
CREATE POLICY staff_content_read ON public.cms_records FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid()));
CREATE POLICY staff_content_write ON public.cms_records FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.content_versions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),record_id uuid NOT NULL REFERENCES public.cms_records(id),actor uuid,old_record jsonb,new_record jsonb,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.content_versions TO authenticated; GRANT ALL ON public.content_versions TO service_role;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY versions_staff ON public.content_versions FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid()));
CREATE TABLE public.audit_logs(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),actor uuid,action text NOT NULL,entity text NOT NULL,entity_id uuid,details jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.audit_logs TO authenticated; GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_admin ON public.audit_logs FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE FUNCTION public.audit_content() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF TG_OP='UPDATE' THEN NEW.updated_at=now(); INSERT INTO public.content_versions(record_id,actor,old_record,new_record) VALUES(NEW.id,auth.uid(),to_jsonb(OLD),to_jsonb(NEW)); END IF; INSERT INTO public.audit_logs(actor,action,entity,entity_id,details) VALUES(auth.uid(),TG_OP,'cms_records',NEW.id,to_jsonb(NEW)); RETURN NEW; END; $$;
CREATE TRIGGER cms_audit BEFORE INSERT OR UPDATE ON public.cms_records FOR EACH ROW EXECUTE FUNCTION public.audit_content();
CREATE TABLE public.enquiry_submissions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),full_name text NOT NULL,email text NOT NULL,organisation text NOT NULL DEFAULT '',business_area text NOT NULL,enquiry_type text NOT NULL,message text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),status text NOT NULL DEFAULT 'new');
GRANT SELECT,UPDATE ON public.enquiry_submissions TO authenticated; GRANT ALL ON public.enquiry_submissions TO service_role;
ALTER TABLE public.enquiry_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY enquiries_admin ON public.enquiry_submissions FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.programme_applications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,programme text NOT NULL,full_name text NOT NULL,email text NOT NULL,phone text NOT NULL DEFAULT '',location text NOT NULL DEFAULT '',organisation text NOT NULL DEFAULT '',message text NOT NULL DEFAULT '',status text NOT NULL DEFAULT 'pending',referral_code text UNIQUE,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,UPDATE ON public.programme_applications TO authenticated; GRANT ALL ON public.programme_applications TO service_role;
ALTER TABLE public.programme_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_applications ON public.programme_applications FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY applications_admin ON public.programme_applications FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'community_manager')) WITH CHECK(public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'community_manager'));
CREATE TABLE public.orders(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL,items jsonb NOT NULL,total_ngn numeric NOT NULL DEFAULT 0,status text NOT NULL DEFAULT 'pending',payment_reference text UNIQUE,referral_code text,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.orders TO authenticated; GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_own ON public.orders FOR SELECT TO authenticated USING(user_id=auth.uid()); CREATE POLICY orders_staff ON public.orders FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerce_manager'));
CREATE TABLE public.subscriptions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL,product_slug text NOT NULL,frequency text NOT NULL,status text NOT NULL DEFAULT 'pending',created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.subscriptions TO authenticated; GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_own ON public.subscriptions FOR SELECT TO authenticated USING(user_id=auth.uid()); CREATE POLICY subscriptions_staff ON public.subscriptions FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerce_manager'));
CREATE TABLE public.submission_limits(id text PRIMARY KEY,attempts integer NOT NULL DEFAULT 0,window_start timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.submission_limits TO service_role; ALTER TABLE public.submission_limits ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.consume_submission_limit(limit_key text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE n integer; BEGIN INSERT INTO public.submission_limits(id,attempts) VALUES(limit_key,1) ON CONFLICT(id) DO UPDATE SET attempts=CASE WHEN submission_limits.window_start < now()-interval '1 hour' THEN 1 ELSE submission_limits.attempts+1 END,window_start=CASE WHEN submission_limits.window_start < now()-interval '1 hour' THEN now() ELSE submission_limits.window_start END RETURNING attempts INTO n; RETURN n<=10; END; $$;
REVOKE ALL ON FUNCTION public.consume_submission_limit(text) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.consume_submission_limit(text) TO service_role;
INSERT INTO public.cms_records(kind,slug,title,description,payload,status,position) VALUES
('business','foods-agro-allied','Foods & Agro-Allied','Connecting agricultural production with food processing, natural ingredients, consumer products and commercial markets.','{"tagline":"From what we grow to what we create.","category":"Agriculture, Food Processing & Natural Ingredients","capabilities":["Agriculture & Large-Scale Farming","Food Processing & Value Addition","Agro-Allied Activities & Ingredients"],"image":"agro"}','published',1),
('business','poultry','Poultry','Focused on commercial poultry production, farming operations, scale, operational efficiency and commercial food supply.','{"tagline":"Built for production.","category":"Modern Commercial Farming","capabilities":["Commercial poultry production","Quality and operational efficiency","Commercial food supply"]}','published',2),
('business','meat-arena','Meat Arena','Quality meat production and related food activities, bringing products efficiently from production through to market.','{"tagline":"Quality from production to market.","category":"Quality Meat Production","capabilities":["Meat production","Product quality","Commercial markets"]}','published',3),
('business','greenhouse-farms','Greenhouse Farms','Technology-enabled agriculture combining controlled growing environments with modern production techniques.','{"tagline":"Growing with precision.","category":"Precision Agriculture","capabilities":["Controlled growing environments","Modern growing techniques","Precision farming"]}','published',4),
('business','apparel','Apparel / VAS & Quintax','Manufacturing-related activities associated with apparel craftsmanship, precision, product quality and commercial production.','{"tagline":"Made with precision.","category":"Commercial Manufacturing","capabilities":["Apparel manufacturing","Craftsmanship and precision","Commercial production"]}','published',5),
('business','properties','Properties','Real estate interests focused on property, architecture, space, materials, investment and commercial opportunities.','{"tagline":"Space, architecture & investment.","category":"Real Estate & Investment","capabilities":["Property and real estate","Architecture and space","Investment opportunities"]}','published',6),
('product','plain-millet-pap','Plain Millet Pap','Naturally fermented pearl millet with no artificial additives.','{"price_ngn":2800,"size":"1kg pouch","category":"Millet Pap","image":"plain","claims":["Organic","No Preservatives","No Additives"],"ingredients":"Millet","availability":"enquiry"}','published',1),
('product','milky-millet-pap','Milky Millet Pap','Pearl millet with wholesome dairy for a comforting breakfast.','{"price_ngn":3400,"size":"1kg pouch","category":"Millet Pap","image":"milky","claims":["Organic","No Preservatives","No Additives"],"ingredients":"Millet, milk. Contains dairy.","availability":"enquiry"}','published',2),
('product','spicy-millet-pap','Spicy Millet Pap','Millet with ginger, cloves and local spices.','{"price_ngn":3100,"size":"1kg pouch","category":"Millet Pap","image":"spicy","claims":["Organic","No Preservatives","No Additives"],"ingredients":"Millet, ginger, cloves, spices","availability":"enquiry"}','published',3),
('product','date-powder','Date Powder','Whole-fruit sweetness for everyday breakfasts.','{"price_ngn":2500,"size":"500g jar","category":"Natural Sweeteners","image":"date","claims":["Organic","No Preservatives","No Additives"],"ingredients":"Dates","availability":"enquiry"}','published',4),
('product','beans-flour','Beans Flour','Ground black-eyed beans for moi-moi and akara.','{"price_ngn":3600,"size":"1kg pouch","category":"Flours & Tubers","image":"beans","claims":["Organic","No Preservatives","No Additives"],"ingredients":"Black-eyed beans","availability":"enquiry"}','published',5),
('page','home','Creating Value. Improving Lives.','Multiple businesses across food, agriculture, manufacturing, apparel and property. One corporate identity, connected by a commitment to quality and long-term value.','{}','published',1),
('page','group','One group. Multiple businesses. Connected opportunities.','Kelsey Greene Group brings together businesses with distinct operational focus and commercial identity. Our diversified portfolio serves both consumer and business-to-business markets.','{}','published',2),
('campaign','movement','1 Million Breakfast Movement','Nourishing People, Empowering Communities, Feeding a Global Future.','{"target":1000000,"verified_experiences":0,"milestones":[5000,10000,50000,100000,500000,1000000]}','published',1),
('setting','currency','Currency configuration','','{"primary":"ESPEE","ngn_per_espee":null}','published',1),
('navigation','group','The Group','','{"path":"/group"}','published',1),
('navigation','businesses','Our Businesses','','{"path":"/businesses"}','published',2),
('navigation','values','Our Values','','{"path":"/values"}','published',3),
('navigation','movement','1 Million Breakfasts','','{"path":"/movement"}','published',4),
('navigation','partnerships','Partnerships','','{"path":"/partnerships"}','published',5),
('navigation','shop','Shop','','{"path":"/shop"}','published',6);