ALTER TABLE users
    ALTER COLUMN institution_id DROP NOT NULL;

ALTER TABLE institutions
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
