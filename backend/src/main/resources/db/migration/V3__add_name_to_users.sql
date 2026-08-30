ALTER TABLE users
    ADD COLUMN name VARCHAR(100);

-- Existing users need a temporary name before the column becomes required.
-- Use the email section before @ as a reasonable fallback.
UPDATE users
SET name = LEFT(
    COALESCE(
    NULLIF(BTRIM(SPLIT_PART(email, '@', 1)), ''),
    'Existing user'
    ),
    100
    )
WHERE name IS NULL;

ALTER TABLE users
    ALTER COLUMN name SET NOT NULL;