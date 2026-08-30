-- Enforce normalized email uniqueness, including simultaneous registrations.
-- Existing duplicates must be resolved before applying this migration.
CREATE UNIQUE INDEX users_email_normalized_unique
    ON users (LOWER(BTRIM(email)));
