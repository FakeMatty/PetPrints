-- Run this once in your Supabase project's SQL editor:
--   https://supabase.com/dashboard/project/vcrfnxwwscspbgvxgjvm/sql/new
-- Creates the tables, the public pet-art storage bucket, and upload policies
-- so the app can persist generated images using the public (anon) key.

-- Tables (brief section 8)
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  original_url text,
  raster_url text,
  flat_vector_url text,
  status text default 'finalised',
  created_at timestamptz default now()
);

create table if not exists public.configs (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid references public.generations(id) on delete cascade,
  bg_pattern text,
  bg_colour text,
  name_text text,
  name_font text,
  composed_svg_url text,
  print_url text,
  created_at timestamptz default now()
);

alter table public.generations enable row level security;
alter table public.configs enable row level security;

-- Public, read-only storage bucket for the generated artwork
insert into storage.buckets (id, name, public)
values ('pet-art', 'pet-art', true)
on conflict (id) do nothing;

-- Allow uploads + reads with the public (anon) key. Demo-grade; tighten before
-- production (e.g. uploads only via the server with the service-role key).
drop policy if exists "pet_art_anon_insert" on storage.objects;
create policy "pet_art_anon_insert" on storage.objects
  for insert to anon with check (bucket_id = 'pet-art');

drop policy if exists "pet_art_public_read" on storage.objects;
create policy "pet_art_public_read" on storage.objects
  for select to public using (bucket_id = 'pet-art');

drop policy if exists "generations_anon_insert" on public.generations;
create policy "generations_anon_insert" on public.generations
  for insert to anon with check (true);

drop policy if exists "configs_anon_insert" on public.configs;
create policy "configs_anon_insert" on public.configs
  for insert to anon with check (true);
