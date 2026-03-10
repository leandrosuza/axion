-- BigDataCorp Database Setup Script
-- Run this in your Supabase SQL Editor to set up all required tables

-- 1. Create users table
create table if not exists public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  name text,
  cpf_cnpj text,
  phone text,
  account_type text check (account_type in ('individual', 'business', 'admin')) default 'individual',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- RLS Policies for users
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid() = id);

-- 2. Create subscriptions table
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users not null,
  plan_type text check (plan_type in ('free', 'basic', 'pro', 'enterprise')) default 'free',
  status text check (status in ('active', 'canceled', 'past_due')) default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- RLS Policies for subscriptions
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- 3. Create api_keys table
create table if not exists public.api_keys (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users not null,
  name text not null,
  key_hash text not null,
  key_preview text not null,
  permissions text check (permissions in ('read', 'full')) default 'read',
  is_active boolean default true,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.api_keys enable row level security;

-- RLS Policies for api_keys
create policy "Users can view their own API keys"
  on public.api_keys for select
  using (auth.uid() = user_id);

create policy "Users can create their own API keys"
  on public.api_keys for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own API keys"
  on public.api_keys for update
  using (auth.uid() = user_id);

create policy "Users can delete their own API keys"
  on public.api_keys for delete
  using (auth.uid() = user_id);

-- 4. Create api_usage_logs table
create table if not exists public.api_usage_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users not null,
  api_key_id uuid references public.api_keys not null,
  endpoint text not null,
  method text not null,
  status_code integer not null,
  response_time integer not null,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.api_usage_logs enable row level security;

-- RLS Policies for api_usage_logs
create policy "Users can view their own usage logs"
  on public.api_usage_logs for select
  using (auth.uid() = user_id);

-- 5. Create rate_limits table
create table if not exists public.rate_limits (
  id uuid default uuid_generate_v4() primary key,
  plan_type text unique not null,
  requests_per_minute integer not null,
  requests_per_day integer not null,
  requests_per_month integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default rate limits
insert into public.rate_limits (plan_type, requests_per_minute, requests_per_day, requests_per_month)
values
  ('free', 10, 100, 1000),
  ('basic', 60, 1000, 30000),
  ('pro', 300, 10000, 300000),
  ('enterprise', 999999, 999999, 999999)
on conflict (plan_type) do nothing;

-- Enable RLS
alter table public.rate_limits enable row level security;

-- RLS Policy for rate_limits (public read)
create policy "Anyone can view rate limits"
  on public.rate_limits for select
  to public
  using (true);

-- 6. Create trigger to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, cpf_cnpj, phone, account_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'cpf_cnpj', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'account_type', 'individual')
  );

  insert into public.subscriptions (user_id, plan_type, status)
  values (new.id, 'free', 'active');

  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Success message
select 'Database setup completed successfully!' as message;
