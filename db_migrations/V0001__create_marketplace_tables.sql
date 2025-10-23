-- Создание таблицы пользователей с балансами
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы игровых предметов
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category VARCHAR(100),
    rarity VARCHAR(50),
    is_sold BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы транзакций
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id),
    seller_id INTEGER REFERENCES users(id),
    item_id INTEGER REFERENCES items(id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка тестовых данных
INSERT INTO users (username, balance) VALUES 
    ('Player1', 1500.00),
    ('ProGamer', 3200.00),
    ('Trader99', 890.00)
ON CONFLICT (username) DO NOTHING;

INSERT INTO items (seller_id, title, description, price, category, rarity, image_url) VALUES
    (1, 'Легендарный меч пламени', 'Редкий меч с огненным уроном +50', 450.00, 'Оружие', 'Легендарный', 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=400'),
    (2, 'Доспехи дракона', 'Эпическая броня с защитой +100', 890.00, 'Броня', 'Эпический', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'),
    (1, 'Зелье невидимости', 'Делает невидимым на 30 секунд', 120.00, 'Зелья', 'Редкий', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400'),
    (3, 'Крылья феникса', 'Позволяют летать, +25% скорость', 1200.00, 'Аксессуары', 'Легендарный', 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400'),
    (2, 'Кристалл маны', 'Восстанавливает 500 маны', 75.00, 'Расходники', 'Обычный', 'https://images.unsplash.com/photo-1610056494071-cae5a4d52c1c?w=400'),
    (3, 'Скин Киберниндзя', 'Эксклюзивный скин персонажа', 650.00, 'Скины', 'Эпический', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400')
ON CONFLICT DO NOTHING;