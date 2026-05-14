create extension if not exists "pgcrypto";

create table if not exists public.chips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null,
  text text not null,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chips_mode_check check (mode in ('tecnico', 'criativo', 'analitico', 'casual', 'urgente')),
  constraint chips_usage_count_check check (usage_count >= 0),
  constraint chips_user_mode_text_unique unique (user_id, mode, text)
);

create index if not exists chips_user_mode_usage_idx
  on public.chips (user_id, mode, usage_count desc, updated_at desc);

alter table public.chips enable row level security;

grant select, insert, update on public.chips to authenticated;

create policy "Utilizadores podem ler os próprios chips"
  on public.chips
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Utilizadores podem criar os próprios chips"
  on public.chips
  for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Utilizadores podem actualizar os próprios chips"
  on public.chips
  for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create or replace function public.set_chips_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_chips_updated_at on public.chips;
create trigger set_chips_updated_at
  before update on public.chips
  for each row
  execute function public.set_chips_updated_at();
