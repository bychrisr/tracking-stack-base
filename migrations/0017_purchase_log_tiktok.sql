-- Persist TikTok Events API response and payload for debugging.
ALTER TABLE purchase_log ADD COLUMN tiktok_status_code INTEGER;
ALTER TABLE purchase_log ADD COLUMN tiktok_response_ok INTEGER DEFAULT 0;
ALTER TABLE purchase_log ADD COLUMN tiktok_response_body TEXT;
ALTER TABLE purchase_log ADD COLUMN tiktok_payload_sent TEXT;
