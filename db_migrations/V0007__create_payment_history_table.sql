CREATE TABLE IF NOT EXISTS t_p99005675_game_items_marketpla.payment_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p99005675_game_items_marketpla.users(id),
    payment_id VARCHAR(255) NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    rubles NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'sbp',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_payment_history_user_id ON t_p99005675_game_items_marketpla.payment_history(user_id);
CREATE INDEX idx_payment_history_payment_id ON t_p99005675_game_items_marketpla.payment_history(payment_id);
CREATE INDEX idx_payment_history_status ON t_p99005675_game_items_marketpla.payment_history(status);
