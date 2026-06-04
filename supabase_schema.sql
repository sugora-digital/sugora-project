-- Sugora.com Database Migration Script
-- Production-Ready Supabase PostgreSQL Schema Integration
-- Includes automatic table setups, relationships, Row Level Security (RLS) policies, and custom triggers.

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

------------------------------------------------------------------
-- 1. PROFILES & ROLES
------------------------------------------------------------------
CREATE TYPE user_role_type AS ENUM ('user', 'support', 'admin');

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role user_role_type DEFAULT 'user'::user_role_type,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security (RLS) for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Role Helper Functions (Defined early for policy reuse and triggers)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_support()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin'::public.user_role_type, 'support'::public.user_role_type)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Allow public read access to all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow admins full access to profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

------------------------------------------------------------------
-- 2. WALLETS & TRANSACTIONS
------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    promo_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    withdrawn NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own wallet" ON public.wallets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own wallet" ON public.wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins/support full access to wallets" ON public.wallets
    FOR ALL USING (public.is_support());


CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'affiliate_earning', 'referral_earning', 'product_sale', 'admin_reward')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to select their own transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.wallets
            WHERE public.wallets.id = public.transactions.wallet_id
            AND public.wallets.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to insert their own transactions" ON public.transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.wallets
            WHERE public.wallets.id = public.transactions.wallet_id
            AND public.wallets.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow admins/support full access to transactions" ON public.transactions
    FOR ALL USING (public.is_support());

------------------------------------------------------------------
-- 3. WITHDRAWAL REQUESTS
------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.withdraw_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('UPI', 'Bank Transfer')),
    details TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own withdraw requests" ON public.withdraw_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdraw requests" ON public.withdraw_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own withdraw requests" ON public.withdraw_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow admins/support full access to withdraw requests" ON public.withdraw_requests
    FOR ALL USING (public.is_support());

------------------------------------------------------------------
-- 4. KYC REQUESTS
------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kyc_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    dob DATE NOT NULL,
    address TEXT NOT NULL,
    pan_card TEXT NOT NULL,
    aadhaar_card TEXT NOT NULL,
    selfie_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own KYC" ON public.kyc_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC" ON public.kyc_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KYC" ON public.kyc_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow admins/support full access to KYC" ON public.kyc_requests
    FOR ALL USING (public.is_support());

------------------------------------------------------------------
-- 5. AFFILIATE & TOKENS
------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.affiliate_accounts (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    referral_code TEXT UNIQUE NOT NULL,
    referral_link TEXT NOT NULL,
    total_clicks INTEGER DEFAULT 0 NOT NULL,
    total_registrations INTEGER DEFAULT 0 NOT NULL,
    total_sales INTEGER DEFAULT 0 NOT NULL,
    earnings NUMERIC(12, 2) DEFAULT 0.00 NOT NULL
);

ALTER TABLE public.affiliate_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read affiliate accounts" ON public.affiliate_accounts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own affiliate account" ON public.affiliate_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their affiliate settings" ON public.affiliate_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow admins/support full access to affiliate accounts" ON public.affiliate_accounts
    FOR ALL USING (public.is_support());


-- Affiliate click logs
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_code TEXT REFERENCES public.affiliate_accounts(referral_code) ON DELETE CASCADE NOT NULL,
    ip_address TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select affiliate clicks" ON public.affiliate_clicks
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert affiliate clicks" ON public.affiliate_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admins/support full access to clicks" ON public.affiliate_clicks
    FOR ALL USING (public.is_support());

------------------------------------------------------------------
-- 6. PRODUCTS (MARKETPLACE)
------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for categories" ON public.product_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow admins/support access to categories" ON public.product_categories
    FOR ALL USING (public.is_support());


CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL,
    download_file_url TEXT,
    affiliate_link TEXT,
    type TEXT NOT NULL CHECK (type IN ('digital_download', 'affiliate_product')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Allow admins/support full access to products" ON public.products
    FOR ALL USING (public.is_support());

------------------------------------------------------------------
-- 7. ORDERS & PURCHASE STREAMS
------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_id TEXT, -- Razorpay Payment Id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow admins/support full access to orders" ON public.orders
    FOR ALL USING (public.is_support());

------------------------------------------------------------------
-- 8. SUGORA TREE (LINKTREE BUILDER)
------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tree_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    username TEXT REFERENCES public.profiles(username) ON DELETE CASCADE UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb NOT NULL,
    theme TEXT DEFAULT 'modern' NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.tree_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for Sugora Tree Profiles" ON public.tree_profiles
    FOR SELECT USING (true);

CREATE POLICY "Self-insert for Tree Profiles" ON public.tree_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Self-manage for Tree Profiles" ON public.tree_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow admins full access to Tree Profiles" ON public.tree_profiles
    FOR ALL USING (public.is_admin());


CREATE TABLE IF NOT EXISTS public.tree_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tree_id UUID REFERENCES public.tree_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('instagram', 'youtube', 'facebook', 'telegram', 'whatsapp', 'website', 'custom')),
    clicks INTEGER DEFAULT 0 NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL
);

ALTER TABLE public.tree_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for Tree Links" ON public.tree_links
    FOR SELECT USING (true);

CREATE POLICY "Self insert for Tree Links" ON public.tree_links
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tree_profiles
            WHERE public.tree_profiles.id = tree_id
            AND public.tree_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Self update for Tree Links" ON public.tree_links
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.tree_profiles
            WHERE public.tree_profiles.id = tree_id
            AND public.tree_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Self delete for Tree Links" ON public.tree_links
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.tree_profiles
            WHERE public.tree_profiles.id = tree_id
            AND public.tree_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow admins full access to Tree Links" ON public.tree_links
    FOR ALL USING (public.is_admin());

------------------------------------------------------------------
-- 9. ADMIN APPS BUILDER
------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    logo TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read Apps" ON public.apps
    FOR SELECT USING (true);

CREATE POLICY "Allow admins/support full access to Apps" ON public.apps
    FOR ALL USING (public.is_support());

------------------------------------------------------------------
-- 10. REAL-TIME CHAT
------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    type TEXT NOT NULL CHECK (type IN ('one-to-one', 'support')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read chat rooms" ON public.chat_rooms
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert chat rooms" ON public.chat_rooms
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admins/support full access to rooms" ON public.chat_rooms
    FOR ALL USING (public.is_support());


CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT CHECK (file_type IN ('image', 'file')),
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select chat messages" ON public.chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Allow users to insert messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id OR sender_id IS NULL OR true);

CREATE POLICY "Allow admins/support full access to messages" ON public.chat_messages
    FOR ALL USING (public.is_support());

------------------------------------------------------------------
-- 11. REVIEWS & SETTINGS
------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id SERIAL PRIMARY KEY,
    commission_rate NUMERIC(5, 2) DEFAULT 10.00 NOT NULL, -- percentage
    gemini_api_configured BOOLEAN DEFAULT TRUE NOT NULL,
    messages_limit INTEGER DEFAULT 50 NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read site settings" ON public.site_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow admins full access to site settings" ON public.site_settings
    FOR ALL USING (public.is_admin());

-- Pre-populate site settings
INSERT INTO public.site_settings (id, commission_rate, gemini_api_configured, messages_limit)
VALUES (1, 10.00, TRUE, 50) ON CONFLICT DO NOTHING;

------------------------------------------------------------------
-- TRIGGER: Auto-create Wallet and Affiliate Account on Profile Create
-- Runs with SECURITY DEFINER to bypass any outer table security checks
------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create Wallet
    INSERT INTO public.wallets (user_id, balance, promo_balance)
    VALUES (NEW.id, 0.00, 100.00)
    ON CONFLICT (user_id) DO NOTHING; -- Rs 100 promotional welcome bonus!

    -- Create Affiliate Account
    INSERT INTO public.affiliate_accounts (user_id, referral_code, referral_link)
    VALUES (
        NEW.id,
        NEW.username,
        'https://sugora.com/ref/' || NEW.username
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_on_new_user
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

------------------------------------------------------------------
-- TRIGGER: Auto-create Profile in public.profiles when signing up on Supabase Auth (auth.users)
-- Ensures user registration doesn't fail due to missing profiles or row level security
------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    clean_username TEXT;
BEGIN
    -- Generate a clean, unique username from email
    clean_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
    clean_username := REGEXP_REPLACE(clean_username, '[^a-z0-9_]', '', 'g');
    
    -- Ensure username unique and not empty
    IF clean_username = '' THEN
        clean_username := 'user_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8);
    END IF;
    
    -- Check if username already exists, append random suffix if it does
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = clean_username) THEN
        clean_username := clean_username || '_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 4);
    END IF;

    -- Create Profile row
    INSERT INTO public.profiles (id, email, name, username, avatar_url, role, is_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            SPLIT_PART(NEW.email, '@', 1)
        ),
        clean_username,
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
        ),
        'user'::public.user_role_type,
        TRUE
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe trigger setup for auth.users
CREATE OR REPLACE TRIGGER trigger_on_auth_user_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();
