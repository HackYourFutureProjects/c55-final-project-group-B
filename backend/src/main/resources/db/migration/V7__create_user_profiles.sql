CREATE TABLE user_profiles (
    user_id            UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    preferred_city     VARCHAR(100),
    preferred_province VARCHAR(100)
);