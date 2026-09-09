-- KisanConnect — full project schema (Marketplace + Community + Calendar)
-- Safe to run even if Marketplace tables already exist and have data —
-- uses "if not exists" for tables and "drop policy if exists" before each
-- policy, so re-running this never errors and never touches existing rows.

-- ============ MARKETPLACE ============

create table if not exists listings (
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

create table if not exists bids (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  bidder_name text not null,
  amount numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  sender_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table listings enable row level security;
alter table bids enable row level security;
alter table chat_messages enable row level security;

drop policy if exists "public read listings" on listings;
drop policy if exists "public insert listings" on listings;
drop policy if exists "public update listings" on listings;
drop policy if exists "public delete listings" on listings;
create policy "public read listings" on listings for select using (true);
create policy "public insert listings" on listings for insert with check (true);
create policy "public update listings" on listings for update using (true);
create policy "public delete listings" on listings for delete using (true);

drop policy if exists "public read bids" on bids;
drop policy if exists "public insert bids" on bids;
create policy "public read bids" on bids for select using (true);
create policy "public insert bids" on bids for insert with check (true);

drop policy if exists "public read chat" on chat_messages;
drop policy if exists "public insert chat" on chat_messages;
create policy "public read chat" on chat_messages for select using (true);
create policy "public insert chat" on chat_messages for insert with check (true);

-- ============ COMMUNITY FORUM ============

create table if not exists forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  village text,
  tag text not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references forum_posts(id) on delete cascade,
  author_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists forum_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references forum_posts(id) on delete cascade,
  user_name text not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_name)
);

alter table forum_posts enable row level security;
alter table forum_replies enable row level security;
alter table forum_likes enable row level security;

drop policy if exists "public read forum_posts" on forum_posts;
drop policy if exists "public insert forum_posts" on forum_posts;
create policy "public read forum_posts" on forum_posts for select using (true);
create policy "public insert forum_posts" on forum_posts for insert with check (true);

drop policy if exists "public read forum_replies" on forum_replies;
drop policy if exists "public insert forum_replies" on forum_replies;
create policy "public read forum_replies" on forum_replies for select using (true);
create policy "public insert forum_replies" on forum_replies for insert with check (true);

drop policy if exists "public read forum_likes" on forum_likes;
drop policy if exists "public insert forum_likes" on forum_likes;
drop policy if exists "public delete forum_likes" on forum_likes;
create policy "public read forum_likes" on forum_likes for select using (true);
create policy "public insert forum_likes" on forum_likes for insert with check (true);
create policy "public delete forum_likes" on forum_likes for delete using (true);

-- ============ FARMING CALENDAR ============

create table if not exists crop_entries (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  stage text not null,
  planted_on text not null,
  created_at timestamptz not null default now()
);

create table if not exists calendar_tasks (
  id uuid primary key default gen_random_uuid(),
  crop_entry_id uuid not null references crop_entries(id) on delete cascade,
  task text not null,
  due_date text not null,
  status text not null default 'upcoming',
  created_at timestamptz not null default now()
);

alter table crop_entries enable row level security;
alter table calendar_tasks enable row level security;

drop policy if exists "public read crop_entries" on crop_entries;
drop policy if exists "public insert crop_entries" on crop_entries;
create policy "public read crop_entries" on crop_entries for select using (true);
create policy "public insert crop_entries" on crop_entries for insert with check (true);

drop policy if exists "public read calendar_tasks" on calendar_tasks;
drop policy if exists "public insert calendar_tasks" on calendar_tasks;
drop policy if exists "public update calendar_tasks" on calendar_tasks;
create policy "public read calendar_tasks" on calendar_tasks for select using (true);
create policy "public insert calendar_tasks" on calendar_tasks for insert with check (true);
create policy "public update calendar_tasks" on calendar_tasks for update using (true);

-- ============ SEED DATA (Community + Calendar only — one-time) ============
-- Only inserts if these tables are currently empty, so this is safe to
-- run more than once without creating duplicates.

insert into crop_entries (crop, stage, planted_on)
select 'Onion', 'Bulb Formation', '12 Jul 2026'
where not exists (select 1 from crop_entries);

insert into crop_entries (crop, stage, planted_on)
select 'Sugarcane', 'Tillering', '02 Mar 2026'
where not exists (select 1 from crop_entries where crop = 'Sugarcane');

insert into calendar_tasks (crop_entry_id, task, due_date, status)
select id, 'Irrigation (light)', '10 Sep', 'upcoming' from crop_entries where crop = 'Onion'
and not exists (select 1 from calendar_tasks)
union all
select id, 'Apply Potash fertilizer', '12 Sep', 'upcoming' from crop_entries where crop = 'Onion'
and not exists (select 1 from calendar_tasks)
union all
select id, 'Weeding', '15 Sep', 'upcoming' from crop_entries where crop = 'Onion'
and not exists (select 1 from calendar_tasks)
union all
select id, 'Pest inspection', '05 Sep', 'done' from crop_entries where crop = 'Onion'
and not exists (select 1 from calendar_tasks)
union all
select id, 'Nitrogen top dressing', '11 Sep', 'upcoming' from crop_entries where crop = 'Sugarcane'
and not exists (select 1 from calendar_tasks)
union all
select id, 'Earthing up', '20 Sep', 'upcoming' from crop_entries where crop = 'Sugarcane'
and not exists (select 1 from calendar_tasks)
union all
select id, 'Irrigation', '03 Sep', 'done' from crop_entries where crop = 'Sugarcane'
and not exists (select 1 from calendar_tasks);

insert into forum_posts (author_name, village, tag, title)
select 'Anil Deshmukh', 'Baramati', 'Q&A', 'Best fertilizer schedule for onion bulb stage?'
where not exists (select 1 from forum_posts);

insert into forum_posts (author_name, village, tag, title)
select 'Dr. Sunanda Rao', 'Agri Expert', 'Expert Session', 'Live session tomorrow 5 PM: Managing whitefly in cotton'
where not exists (select 1 from forum_posts where author_name = 'Dr. Sunanda Rao');

insert into forum_posts (author_name, village, tag, title)
select 'Prakash Salunkhe', 'Shirwal', 'Success Story', 'Doubled my soybean yield this season — here is what I changed'
where not exists (select 1 from forum_posts where author_name = 'Prakash Salunkhe');

-- ============ GOVT SCHEMES ============

create table if not exists govt_schemes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  short_desc text not null,
  full_desc text not null,
  eligibility text not null,
  benefit text not null,
  deadline text,
  department text not null,
  created_at timestamptz not null default now()
);

create table if not exists scheme_applications (
  id uuid primary key default gen_random_uuid(),
  scheme_id uuid not null references govt_schemes(id) on delete cascade,
  applicant_name text not null,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

alter table govt_schemes enable row level security;
alter table scheme_applications enable row level security;

drop policy if exists "public read govt_schemes" on govt_schemes;
create policy "public read govt_schemes" on govt_schemes for select using (true);

drop policy if exists "public read scheme_applications" on scheme_applications;
drop policy if exists "public insert scheme_applications" on scheme_applications;
create policy "public read scheme_applications" on scheme_applications for select using (true);
create policy "public insert scheme_applications" on scheme_applications for insert with check (true);

insert into govt_schemes (name, category, short_desc, full_desc, eligibility, benefit, deadline, department)
select * from (values
  ('PM-KISAN', 'Subsidy',
   'Direct income support of ₹6,000/year to landholding farmers',
   'Pradhan Mantri Kisan Samman Nidhi provides income support to all landholding farmer families to supplement their financial needs for agriculture inputs and household needs.',
   'All landholding farmer families with cultivable land, subject to exclusion criteria (income tax payers, institutional landholders excluded)',
   '₹6,000 per year in 3 equal installments directly to bank account',
   'Rolling — apply anytime',
   'Ministry of Agriculture & Farmers Welfare'),
  ('Pradhan Mantri Fasal Bima Yojana', 'Insurance',
   'Crop insurance against yield loss due to natural calamities',
   'Comprehensive risk cover for crops against non-preventable natural risks from pre-sowing to post-harvest, at a low uniform premium rate for farmers.',
   'All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers',
   'Premium as low as 2% for Kharif, 1.5% for Rabi crops; balance subsidized by government',
   '15 Dec 2026 (Rabi season)',
   'Ministry of Agriculture & Farmers Welfare'),
  ('Kisan Credit Card (KCC)', 'Loan',
   'Short-term credit for cultivation and allied needs at low interest',
   'KCC provides farmers with timely access to credit for crop production, post-harvest expenses, and farm asset maintenance at concessional interest rates.',
   'All farmers — owner cultivators, tenant farmers, sharecroppers, and SHG members',
   'Credit up to ₹3 lakh at 4% effective interest rate (with timely repayment subsidy)',
   'Rolling — apply anytime',
   'Ministry of Finance / NABARD'),
  ('Soil Health Card Scheme', 'Training',
   'Free soil testing with crop-wise nutrient and fertilizer advice',
   'Soil samples are tested and farmers receive a Soil Health Card with crop-wise recommendations for nutrients and fertilizers required, once every 2 years.',
   'All farmers with agricultural land, no income restriction',
   'Free soil testing and personalized fertilizer recommendations',
   'Ongoing — contact local Krishi Vigyan Kendra',
   'Department of Agriculture, Cooperation & Farmers Welfare'),
  ('PM Kisan Maan Dhan Yojana', 'Insurance',
   'Pension scheme for small and marginal farmers',
   'A voluntary pension scheme providing ₹3,000 monthly pension after the age of 60 to small and marginal farmers, with matching government contribution.',
   'Small and marginal farmers aged 18-40 years with up to 2 hectares of cultivable land',
   '₹3,000/month pension after age 60; matching contribution by government',
   'Rolling — apply anytime',
   'Ministry of Agriculture & Farmers Welfare'
  )
) as v(name, category, short_desc, full_desc, eligibility, benefit, deadline, department)
where not exists (select 1 from govt_schemes);
