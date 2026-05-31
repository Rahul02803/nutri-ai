-- ====================================================
-- ZENLOG SUPABASE POSTGRESQL DATABASE SCHEMA
-- ====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS PROFILE TABLE
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  age integer,
  gender text,
  height numeric,
  current_weight numeric,
  activity_level text,
  goal text,
  target_weight numeric,
  diet_preference text,
  steps_goal integer default 8000,
  target_calories integer default 2000,
  target_protein integer default 140,
  target_carbs integer default 210,
  target_fat integer default 65,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for users
alter table public.users enable row level security;
create policy "Users can read own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

-- 2. MEALS LOGS
create table if not exists public.meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  image_url text,
  meal_type text not null, -- Breakfast, Lunch, Dinner, Snack
  calories integer not null,
  protein integer not null,
  carbs integer not null,
  fat integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.meals enable row level security;
create policy "Users own meals operations" on public.meals for all using (auth.uid() = user_id);

-- 3. FOOD ITEMS IN MEAL
create table if not exists public.food_items (
  id uuid default uuid_generate_v4() primary key,
  meal_id uuid references public.meals(id) on delete cascade not null,
  food_name text not null,
  quantity_grams numeric not null,
  calories integer not null,
  protein integer not null,
  carbs integer not null,
  fat integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.food_items enable row level security;
create policy "Users own food items operations" on public.food_items for all using (
  exists (select 1 from public.meals where meals.id = food_items.meal_id and meals.user_id = auth.uid())
);

-- 4. WEIGHT LOGS
create table if not exists public.weight_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  weight numeric not null,
  body_fat numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.weight_logs enable row level security;
create policy "Users own weight logs operations" on public.weight_logs for all using (auth.uid() = user_id);

-- 5. DAILY PROGRESS AGGREGATOR
create table if not exists public.daily_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  calories_consumed integer default 0 not null,
  protein_consumed integer default 0 not null,
  carbs_consumed integer default 0 not null,
  fat_consumed integer default 0 not null,
  logged_date date default current_date not null,
  constraint unique_user_logged_date unique(user_id, logged_date)
);

alter table public.daily_progress enable row level security;
create policy "Users own daily progress operations" on public.daily_progress for all using (auth.uid() = user_id);

-- ====================================================
-- FOOD CORRECTION & MACHINE LEARNING TABLES
-- ====================================================

-- 6. FOOD PREDICTIONS
create table if not exists public.food_predictions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  meal_id uuid references public.meals(id) on delete cascade,
  predicted_food text not null,
  predicted_weight numeric not null,
  predicted_calories integer not null,
  confidence numeric not null, -- Gemini confidence (e.g. 0.82)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.food_predictions enable row level security;
create policy "Users own food predictions operations" on public.food_predictions for all using (auth.uid() = user_id);

-- 7. FOOD CORRECTIONS
create table if not exists public.food_corrections (
  id uuid default uuid_generate_v4() primary key,
  prediction_id uuid references public.food_predictions(id) on delete cascade not null,
  corrected_food text not null,
  corrected_weight numeric not null,
  corrected_calories integer not null,
  corrected_protein integer not null,
  corrected_carbs integer not null,
  corrected_fat integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.food_corrections enable row level security;
create policy "Users own food corrections operations" on public.food_corrections for all using (
  exists (select 1 from public.food_predictions where food_predictions.id = food_corrections.prediction_id and food_predictions.user_id = auth.uid())
);

-- ====================================================
-- REUSABLE MEAL TEMPLATES TABLES
-- ====================================================

-- 8. MEAL TEMPLATES
create table if not exists public.meal_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  template_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.meal_templates enable row level security;
create policy "Users own meal templates operations" on public.meal_templates for all using (auth.uid() = user_id);

-- 9. TEMPLATE FOODS
create table if not exists public.template_foods (
  id uuid default uuid_generate_v4() primary key,
  template_id uuid references public.meal_templates(id) on delete cascade not null,
  food_name text not null,
  quantity_grams numeric not null,
  calories integer not null,
  protein integer not null,
  carbs integer not null,
  fat integer not null
);

alter table public.template_foods enable row level security;
create policy "Users own template foods operations" on public.template_foods for all using (
  exists (select 1 from public.meal_templates where meal_templates.id = template_foods.template_id and meal_templates.user_id = auth.uid())
);

-- ====================================================
-- UNIQUE INDEXES FOR OPTIMIZED PERFORMANCE
-- ====================================================
create index if not exists meals_user_id_idx on public.meals(user_id);
create index if not exists weight_logs_user_id_idx on public.weight_logs(user_id);
create index if not exists predictions_confidence_idx on public.food_predictions(confidence);

-- ====================================================
-- INDIAN FOOD DATABASE TABLES
-- ====================================================

-- 10. INDIAN FOODS LIST
create table if not exists public.indian_foods (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  serving_size text not null default '100g',
  calories integer not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  fiber numeric not null default 0,
  iron numeric not null default 0,
  calcium numeric not null default 0,
  vitamin_d numeric not null default 0,
  vitamin_b12 numeric not null default 0,
  category text not null, -- North Indian, South Indian, Street Food, Fast Food, Restaurant Meals, Vegetarian, Non Vegetarian
  is_verified boolean not null default false,
  popularity_score integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.indian_foods enable row level security;
-- Admin-only write, all read
create policy "Everyone can read indian foods" on public.indian_foods for select using (true);
create policy "Admin operations on indian foods" on public.indian_foods for all using (true);

create index if not exists indian_foods_name_fuzzy_idx on public.indian_foods (name);
create index if not exists indian_foods_category_idx on public.indian_foods (category);

