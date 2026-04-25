-- Add consent_at column to event_log table for LGPD audit trail
-- Story 1.3: Migration consent_at
ALTER TABLE event_log ADD COLUMN consent_at INTEGER;
