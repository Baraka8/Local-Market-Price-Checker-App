-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'consumer', -- consumer, vendor, admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Markets Table
CREATE TABLE markets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prices Table
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    market_id INTEGER REFERENCES markets(id),
    user_id INTEGER REFERENCES users(id), -- User who submitted the price
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RWF',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
