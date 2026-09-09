-- Optional: seed sample Marketplace listings for demo purposes
-- Run this in Supabase SQL Editor if you want non-empty listings on first load

insert into listings (crop, quantity, price_per_kg, seller_name, village, highest_bid, bid_count) values
  ('Onion', '2500 kg', 21, 'Vikas Jadhav', 'Shirwal', 22.5, 4),
  ('Tomato', '900 kg', 14, 'Sunita More', 'Nira', 14.5, 2),
  ('Soybean', '4000 kg', 45, 'Ramesh Patil', 'Shirwal', 46.8, 7);
