-- ====================================================
-- NUTRIAI PostgreSQL Database Schema & Security Policies
-- Tailored for Supabase DB & Production Ready
-- ====================================================

-- 1. Profiles Table (Links directly to Supabase Auth UUIDs)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    gender VARCHAR(10),
    age INT,
    height FLOAT, -- in cm
    current_weight FLOAT, -- in kg
    target_weight FLOAT, -- in kg
    activity_level VARCHAR(30), -- sedentary, light, moderate, active, extreme
    workout_frequency VARCHAR(30),
    fitness_experience VARCHAR(30),
    diet_preference VARCHAR(30), -- vegetarian, eggetarian, non_vegetarian, vegan
    allergies TEXT[],
    meals_per_day INT DEFAULT 4,
    timeline VARCHAR(30),
    challenge TEXT,
    dream_physique TEXT,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Calculated Targets / Goals Table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_calories INT NOT NULL,
    target_protein INT NOT NULL, -- in grams
    target_carbs INT NOT NULL,   -- in grams
    target_fat INT NOT NULL,     -- in grams
    bmr FLOAT NOT NULL,
    tdee FLOAT NOT NULL,
    water_target_ml INT DEFAULT 3000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Global Food Inventory Catalog (Pre-seeded with high-quality Indian Foods)
CREATE TABLE public.foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    serving_size TEXT DEFAULT '100g',
    calories INT NOT NULL,
    protein FLOAT NOT NULL,
    carbs FLOAT NOT NULL,
    fat FLOAT NOT NULL,
    is_admin_approved BOOLEAN DEFAULT TRUE,
    category VARCHAR(20) DEFAULT 'Generic', -- Breakfast, Lunch/Dinner, Snacks, Dairy, Breads
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Daily Logged Meals Table
CREATE TABLE public.meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    food_name TEXT NOT NULL,
    meal_type VARCHAR(20) NOT NULL, -- Breakfast, Lunch, Dinner, Snack
    calories INT NOT NULL,
    protein FLOAT NOT NULL,
    carbs FLOAT NOT NULL,
    fat FLOAT NOT NULL,
    servings FLOAT DEFAULT 1.0,
    logged_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Body Weight Progress Logging Table
CREATE TABLE public.weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    weight FLOAT NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_date_weight UNIQUE (user_id, logged_date)
);

-- 6. Hydration Water Logs Table
CREATE TABLE public.water_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount_ml INT NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Chatbot History logs Table
CREATE TABLE public.chatbot_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(10) NOT NULL, -- 'user' or 'assistant'
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
-- Row Level Security (RLS) Policies
-- Protects users data from unauthorized queries
-- ====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_history ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Table Policies
CREATE POLICY "Users can view own profile data" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can modify own profile data" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create own initial profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Goals Table Policies
CREATE POLICY "Users can select own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id);

-- 3. Food Table Policies (Public viewable, Admin manageable)
CREATE POLICY "Foods are viewable by all platform members" ON public.foods
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify food catalog" ON public.foods
    FOR ALL USING (
        -- Secure admin authorization check using role column
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Meals Table Policies
CREATE POLICY "Users can manage own meals" ON public.meals
    FOR ALL USING (auth.uid() = user_id);

-- 5. Weight Logs Table Policies
CREATE POLICY "Users can manage own weight data" ON public.weight_logs
    FOR ALL USING (auth.uid() = user_id);

-- 6. Water Logs Table Policies
CREATE POLICY "Users can manage own water data" ON public.water_logs
    FOR ALL USING (auth.uid() = user_id);

-- 7. Chatbot History Policies
CREATE POLICY "Users can manage own chat logs" ON public.chatbot_history
    FOR ALL USING (auth.uid() = user_id);

-- ====================================================
-- Database Triggers & Performance Indexes
-- ====================================================

-- Index tables for rapid query compilation
CREATE INDEX idx_meals_user_date ON public.meals(user_id, logged_date);
CREATE INDEX idx_weight_user_date ON public.weight_logs(user_id, logged_date);
CREATE INDEX idx_water_user_date ON public.water_logs(user_id, logged_date);

-- Trigger to automatically update updated_at on Profile modifications
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Preseed database with high-quality Indian Foods
INSERT INTO public.foods (name, serving_size, calories, protein, carbs, fat, category) VALUES
('Whole Wheat Roti (No Butter)', '1 Roti', 85, 3, 18, 0.5, 'Breads'),
('Basmati Rice (Cooked)', '1 Katori (150g)', 195, 4.3, 44, 0.4, 'Lunch/Dinner'),
('Paneer Tikka Masala', '1 bowl (150g)', 280, 14, 12, 20, 'Lunch/Dinner'),
('Dal Tadka (Arhar/Toor)', '1 bowl (150g)', 150, 7, 22, 4, 'Lunch/Dinner'),
('Chicken Curry (Indian Style)', '1 bowl (150g)', 240, 26, 6, 12, 'Lunch/Dinner'),
('Egg Bhurji (2 Eggs)', '1 plate', 195, 13, 4, 14, 'Breakfast'),
('Poha (With Peanuts)', '1 plate (150g)', 240, 5, 40, 6.5, 'Breakfast'),
('Whey Protein Isolate', '1 Scoop (30g)', 120, 25, 1.5, 1, 'Snacks');
