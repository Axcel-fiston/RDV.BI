ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS otp_code_hash TEXT,
    ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;
