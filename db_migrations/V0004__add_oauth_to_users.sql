-- Add OAuth fields to users table
ALTER TABLE t_p99005675_game_items_marketpla.users
ADD COLUMN oauth_provider VARCHAR(20),
ADD COLUMN oauth_id VARCHAR(255),
ADD COLUMN email VARCHAR(255),
ADD COLUMN avatar_url TEXT,
ADD COLUMN full_name VARCHAR(255);

-- Create unique index for OAuth authentication
CREATE UNIQUE INDEX idx_users_oauth ON t_p99005675_game_items_marketpla.users(oauth_provider, oauth_id);