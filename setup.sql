-- =============================================
-- EVC Movie Streaming - Supabase SQL Setup
-- =============================================
-- Run this SQL in Supabase SQL Editor:
-- https://xhoiouzraqoyvevbxefj.supabase.co/project/default/sql/new

-- 1. Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  year INT NOT NULL,
  category TEXT[] NOT NULL DEFAULT '{}',
  poster_url TEXT,
  backdrop_url TEXT,
  imdb_rating NUMERIC(3,1),
  rt_score TEXT,
  trailer_url TEXT,
  subtitle TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read access
CREATE POLICY "Allow public read" ON movies
  FOR SELECT USING (true);

-- 4. Seed movie data with TMDB poster images and YouTube trailers
INSERT INTO movies (title, year, category, poster_url, backdrop_url, imdb_rating, rt_score, trailer_url, subtitle, is_featured) VALUES
  ('Pacific Rim', 2013, ARRAY['Action','Drama'], 'https://image.tmdb.org/t/p/w500/sCxfSuEfNE1s3aBFMXRiPireIsK.jpg', 'https://image.tmdb.org/t/p/w1280/cUJYBIbHLJK2ll0CztrHgrXBOlI.jpg', 6.9, '72%', 'https://www.youtube.com/embed/5guMumPFBag', NULL, TRUE),
  ('The Batman', 2022, ARRAY['Action','Drama','DC'], 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', 'https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyFAJlgN7YhkPgifRh.jpg', 7.8, '85%', 'https://www.youtube.com/embed/mqqft2x_Aa4', NULL, TRUE),
  ('The Dark Knight', 2008, ARRAY['Action','Drama','DC'], 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BytUjfs2gX1T.jpg', 'https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg', 9.0, '94%', 'https://www.youtube.com/embed/EXeTwQWrcwY', NULL, TRUE),
  ('Interstellar', 2014, ARRAY['Action','Drama'], 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'https://image.tmdb.org/t/p/w1280/xJHokMbljXjADYdit5fK1DVfjko.jpg', 8.7, '73%', 'https://www.youtube.com/embed/zSWdZVtXT7E', NULL, FALSE),
  ('Spider-Man: Across the Spider-Verse', 2023, ARRAY['Action','Comedy','Marvel'], 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', 'https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg', 8.7, '95%', 'https://www.youtube.com/embed/cqGjhVJWtEg', 'Across the Spider-Verse', FALSE),
  ('Inception', 2010, ARRAY['Action','Drama'], 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', 'https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg', 8.8, '87%', 'https://www.youtube.com/embed/YoHD9XEInc0', NULL, FALSE),
  ('Deadpool & Wolverine', 2024, ARRAY['Action','Comedy','Marvel'], 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', 'https://image.tmdb.org/t/p/w1280/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg', 7.6, '79%', 'https://www.youtube.com/embed/73_1biulkYk', NULL, FALSE),
  ('Dune: Part Two', 2024, ARRAY['Action','Drama'], 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg', 8.8, '92%', 'https://www.youtube.com/embed/Way9Dexny3w', NULL, FALSE),
  ('Avengers: Endgame', 2019, ARRAY['Action','Marvel'], 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', 'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg', 8.4, '94%', 'https://www.youtube.com/embed/TcMBFSGVi1c', NULL, FALSE),
  ('Joker', 2019, ARRAY['Drama','DC'], 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', 'https://image.tmdb.org/t/p/w1280/n6bUvigpRFqSwmPp1m2YMDm2A0Q.jpg', 8.4, '68%', 'https://www.youtube.com/embed/zAGVQLHvwOY', NULL, FALSE),
  ('Oppenheimer', 2023, ARRAY['Drama'], 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', 'https://image.tmdb.org/t/p/w1280/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg', 8.5, '93%', 'https://www.youtube.com/embed/uYPbbksJxIg', NULL, FALSE),
  ('John Wick: Chapter 4', 2023, ARRAY['Action'], 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7Q2KBnHEI4lg.jpg', 'https://image.tmdb.org/t/p/w1280/h8gHn0OzBoKcXvwnKtbPMkDHZ0g.jpg', 7.7, '94%', 'https://www.youtube.com/embed/qEVUtrk8_B4', NULL, FALSE),
  ('Avatar: The Way of Water', 2022, ARRAY['Action','Family','Disney'], 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', 'https://image.tmdb.org/t/p/w1280/Yc9q6QuWrMp9nuDm5R8ExNoExbi.jpg', 7.6, '76%', 'https://www.youtube.com/embed/d9MyW72ELq0', NULL, FALSE),
  ('Top Gun: Maverick', 2022, ARRAY['Action','Drama'], 'https://image.tmdb.org/t/p/w500/62HCnUTziyWQpDaBO2i1DX17ljH.jpg', 'https://image.tmdb.org/t/p/w1280/AaV1YIdWKRYmfih9zEISsdm7wdz.jpg', 8.3, '96%', 'https://www.youtube.com/embed/giXco2jaZ_4', NULL, FALSE);
