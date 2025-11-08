-- Create table for storing TikTok videos
CREATE TABLE IF NOT EXISTS tiktok_videos (
    id SERIAL PRIMARY KEY,
    tiktok_url TEXT NOT NULL,
    video_url TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    author_avatar TEXT,
    description TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    hashtags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by VARCHAR(255),
    UNIQUE(tiktok_url)
);

CREATE INDEX idx_tiktok_videos_active ON tiktok_videos(is_active);
CREATE INDEX idx_tiktok_videos_created ON tiktok_videos(created_at DESC);