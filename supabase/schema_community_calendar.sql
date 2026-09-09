-- KisanConnect Community Forum + Farming Calendar schema
-- Run this in Supabase Dashboard -> SQL Editor -> New query
-- Safe to run even if these specific tables don't exist yet;
-- does NOT touch listings/bids/chat_messages from the marketplace schema.

drop table if exists forum_likes cascade;
drop table if exists forum_replies cascade;
drop table if exists forum_posts cascade;
drop table if exists calendar_tasks cascade;
drop table if exists crop_entries cascade;

-- Community Forum
create table forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  village text,
  tag text not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references forum_posts(id) on delete cascade,
  author_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table forum_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references forum_posts(id) on delete cascade,
  user_name text not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_name)
);

-- Farming Calendar
create table crop_entries (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  stage text not null,
  planted_on text not null,
  created_at timestamptz not null default now()
);

create table calendar_tasks (
  id uuid primary key default gen_random_uuid(),
  crop_entry_id uuid not null references crop_entries(id) on delete cascade,
  task text not null,
  due_date text not null,
  status text not null default 'upcoming',
  created_at timestamptz not null default now()
);

alter table forum_posts enable row level security;
alter table forum_replies enable row level security;
alter table forum_likes enable row level security;
alter table crop_entries enable row level security;
alter table calendar_tasks enable row level security;

-- Open policies for prototype stage (no real user auth yet).
create policy "public read forum_posts" on forum_posts for select using (true);
create policy "public insert forum_posts" on forum_posts for insert with check (true);

create policy "public read forum_replies" on forum_replies for select using (true);
create policy "public insert forum_replies" on forum_replies for insert with check (true);

create policy "public read forum_likes" on forum_likes for select using (true);
create policy "public insert forum_likes" on forum_likes for insert with check (true);
create policy "public delete forum_likes" on forum_likes for delete using (true);

create policy "public read crop_entries" on crop_entries for select using (true);
create policy "public insert crop_entries" on crop_entries for insert with check (true);

create policy "public read calendar_tasks" on calendar_tasks for select using (true);
create policy "public insert calendar_tasks" on calendar_tasks for insert with check (true);
create policy "public update calendar_tasks" on calendar_tasks for update using (true);

-- Seed starter data matching the app's original mock content
insert into crop_entries (crop, stage, planted_on) values
  ('Onion', 'Bulb Formation', '12 Jul 2026'),
  ('Sugarcane', 'Tillering', '02 Mar 2026');

insert into calendar_tasks (crop_entry_id, task, due_date, status)
select id, 'Irrigation (light)', '10 Sep', 'upcoming' from crop_entries where crop = 'Onion'
union all
select id, 'Apply Potash fertilizer', '12 Sep', 'upcoming' from crop_entries where crop = 'Onion'
union all
select id, 'Weeding', '15 Sep', 'upcoming' from crop_entries where crop = 'Onion'
union all
select id, 'Pest inspection', '05 Sep', 'done' from crop_entries where crop = 'Onion'
union all
select id, 'Nitrogen top dressing', '11 Sep', 'upcoming' from crop_entries where crop = 'Sugarcane'
union all
select id, 'Earthing up', '20 Sep', 'upcoming' from crop_entries where crop = 'Sugarcane'
union all
select id, 'Irrigation', '03 Sep', 'done' from crop_entries where crop = 'Sugarcane';

insert into forum_posts (author_name, village, tag, title) values
  ('Anil Deshmukh', 'Baramati', 'Q&A', 'Best fertilizer schedule for onion bulb stage?'),
  ('Dr. Sunanda Rao', 'Agri Expert', 'Expert Session', 'Live session tomorrow 5 PM: Managing whitefly in cotton'),
  ('Prakash Salunkhe', 'Shirwal', 'Success Story', 'Doubled my soybean yield this season — here is what I changed');
