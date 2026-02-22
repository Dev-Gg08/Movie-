-- =============================================
-- EVC Movie Streaming - Supabase SQL Setup
-- =============================================

-- 1. Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tmdb_id BIGINT,
  title TEXT NOT NULL,
  year INT,
  category TEXT[],
  poster_url TEXT,
  backdrop_url TEXT,
  imdb_rating DECIMAL(3, 1),
  rt_score TEXT,
  trailer_url TEXT,
  direct_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read access
CREATE POLICY "Allow public read" ON movies
  FOR SELECT USING (true);

-- 4. Seed movie data
INSERT INTO movies (tmdb_id, title, year, category, poster_url, backdrop_url, imdb_rating, rt_score, trailer_url, is_featured) VALUES
  (68726, 'Pacific Rim', 2013, ARRAY['Action','Drama'], 'https://image.tmdb.org/t/p/w500/sCxfSuEfNE1s3aBFMXRiPireIsK.jpg', 'https://image.tmdb.org/t/p/w1280/cUJYBIbHLJK2ll0CztrHgrXBOlI.jpg', 6.9, '72%', 'https://www.youtube.com/embed/5guMumPFBag', TRUE),
  (414906, 'The Batman', 2022, ARRAY['Action','Drama','DC'], 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', 'https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyFAJlgN7YhkPgifRh.jpg', 7.8, '85%', 'https://www.youtube.com/embed/mqqft2x_Aa4', TRUE),
  (155, 'The Dark Knight', 2008, ARRAY['Action','Drama','DC'], 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BytUjfs2gX1T.jpg', 'https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg', 9.0, '94%', 'https://www.youtube.com/embed/EXeTwQWrcwY', TRUE),
  (157336, 'Interstellar', 2014, ARRAY['Action','Drama'], 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'https://image.tmdb.org/t/p/w1280/xJHokMbljXjADYdit5fK1DVfjko.jpg', 8.7, '73%', 'https://www.youtube.com/embed/zSWdZVtXT7E', FALSE);
