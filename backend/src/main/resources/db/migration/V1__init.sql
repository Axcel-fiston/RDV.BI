-- Initial schema for institutions onboarding & booking

CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    type VARCHAR(100),
    contact_email VARCHAR(320),
    contact_phone VARCHAR(50),
    address VARCHAR(500),
    description TEXT,
    logo_url VARCHAR(500),
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    status VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    approval_notes TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institutions_status ON institutions(status);
CREATE INDEX IF NOT EXISTS idx_institutions_active ON institutions(active);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    prefix VARCHAR(10),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_services_institution ON services(institution_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);

CREATE TABLE IF NOT EXISTS time_slots (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity > 0),
    booked_count INTEGER NOT NULL DEFAULT 0 CHECK (booked_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_slots_institution_date ON time_slots(institution_id, date);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    time_slot_id UUID REFERENCES time_slots(id) ON DELETE SET NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(320),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    ticket_number VARCHAR(50),
    otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appt_institution_date ON appointments(institution_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appt_status ON appointments(status);
