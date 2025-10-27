-- Add password field for login authentication
ALTER TABLE t_p99005675_game_items_marketpla.users 
ADD COLUMN password_hash VARCHAR(255);