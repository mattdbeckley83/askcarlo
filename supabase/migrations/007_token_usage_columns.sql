-- Add input_tokens and output_tokens as dedicated columns on token_transactions
-- These store the raw API token counts for charting usage breakdown

ALTER TABLE token_transactions
    ADD COLUMN IF NOT EXISTS input_tokens integer,
    ADD COLUMN IF NOT EXISTS output_tokens integer;
