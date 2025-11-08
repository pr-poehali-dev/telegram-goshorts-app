-- Add moderation and categories to tiktok_videos table
ALTER TABLE tiktok_videos ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE tiktok_videos ADD COLUMN IF NOT EXISTS moderated_by VARCHAR(255);
ALTER TABLE tiktok_videos ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;
ALTER TABLE tiktok_videos ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'general';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_moderation ON tiktok_videos(moderation_status);
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_category ON tiktok_videos(category);

-- Create table for video categories
CREATE TABLE IF NOT EXISTS video_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO video_categories (name, display_name, icon, color) VALUES
('general', 'Общее', 'Grid', 'orange'),
('funny', 'Приколы', 'Laugh', 'yellow'),
('dance', 'Танцы', 'Music', 'pink'),
('food', 'Еда', 'UtensilsCrossed', 'red'),
('travel', 'Путешествия', 'Plane', 'blue'),
('sports', 'Спорт', 'Trophy', 'green'),
('pets', 'Животные', 'PawPrint', 'purple'),
('education', 'Обучение', 'BookOpen', 'indigo')
ON CONFLICT (name) DO NOTHING;