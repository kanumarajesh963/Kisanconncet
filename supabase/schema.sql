-- KisanConnect Marketplace schema
-- Run this in Supabase Dashboard -> SQL Editor -> New query
-- This resets any partial previous attempt, then creates everything fresh.

drop table if exists chat_messages cascade;
drop table if exists bids cascade;
drop table if exists listings cascade;

create table listings (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  quantity text not null,
  price_per_kg numeric not null,
  seller_name text not null,
  village text,
  map_link text,
  photos text[] default '{}',
  highest_bid numeric,
  bid_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table bids (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  bidder_name text not null,
  amount numeric not null,
  created_at timestamptz not null default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  sender_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table listings enable row level security;
alter table bids enable row level security;
alter table chat_messages enable row level security;

-- Open policies for prototype stage (no real user auth yet).
-- Anyone with the publishable key can read/write. Tighten this once
-- real login/auth is wired up.
create policy "public read listings" on listings for select using (true);
create policy "public insert listings" on listings for insert with check (true);
create policy "public update listings" on listings for update using (true);
create policy "public delete listings" on listings for delete using (true);

create policy "public read bids" on bids for select using (true);
create policy "public insert bids" on bids for insert with check (true);

create policy "public read chat" on chat_messages for select using (true);
create policy "public insert chat" on chat_messages for insert with check (true);
