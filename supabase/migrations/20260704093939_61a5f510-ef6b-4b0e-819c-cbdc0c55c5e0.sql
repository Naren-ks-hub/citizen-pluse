
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'citizen');
CREATE TYPE public.complaint_status AS ENUM ('pending', 'in_progress', 'resolved', 'rejected');
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.complaint_category AS ENUM (
  'roads','water_supply','garbage','street_lights','drainage',
  'electricity','public_transport','sanitation','parks','others'
);

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles readable by owner" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Admin can view all roles too
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ COMPLAINTS ============
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category public.complaint_category NOT NULL,
  description TEXT NOT NULL,
  area TEXT NOT NULL,
  ward TEXT,
  landmark TEXT,
  image_url TEXT,
  priority public.complaint_priority NOT NULL DEFAULT 'medium',
  status public.complaint_status NOT NULL DEFAULT 'pending',
  admin_remark TEXT,
  assigned_officer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own complaints" ON public.complaints
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all complaints" ON public.complaints
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own complaints" ON public.complaints
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update any complaint" ON public.complaints
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete any complaint" ON public.complaints
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_complaints_user ON public.complaints(user_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_created ON public.complaints(created_at DESC);

-- ============ UPDATED_AT TRIGGER ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER complaints_set_updated_at BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ AUTO PROFILE + ROLE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
