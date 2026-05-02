-- Run this entire script in your Supabase SQL Editor

-- 1. Create Departments Table
CREATE TABLE public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Badges Table
CREATE TABLE public.badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL UNIQUE, -- e.g. "Badge-01", "Vocera-A"
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'lost', 'damaged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Badge Logs Table
CREATE TABLE public.badge_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    badge_id UUID REFERENCES public.badges(id) NOT NULL,
    department_id UUID REFERENCES public.departments(id) NOT NULL,
    user_name TEXT NOT NULL,
    time_out TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    time_in TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert some dummy data for testing
INSERT INTO public.departments (name) VALUES 
('Nutrition'), ('Telemetry'), ('Housekeeping'), ('Maintenance'), ('IT Support')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.badges (identifier) VALUES 
('VOC-001'), ('VOC-002'), ('VOC-003'), ('VOC-004'), ('VOC-005')
ON CONFLICT (identifier) DO NOTHING;

-- Disable Row Level Security for initial testing (can be re-enabled later for stricter auth)
ALTER TABLE public.departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_logs DISABLE ROW LEVEL SECURITY;
