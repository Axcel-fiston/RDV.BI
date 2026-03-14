CREATE TABLE IF NOT EXISTS counters (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    number VARCHAR(50) NOT NULL,
    staff_name VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    current_ticket VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_counter_per_institution UNIQUE (institution_id, number)
);

ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS counter_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS called_time TIMESTAMP,
    ADD COLUMN IF NOT EXISTS completed_time TIMESTAMP;
