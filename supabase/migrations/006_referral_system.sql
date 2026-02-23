-- Migration 006: Referral system
-- NOTE: This SQL has already been applied via the Supabase SQL editor.
-- This file exists for version tracking only.

-- Step 1: Add referral_code to users
ALTER TABLE users
    ADD COLUMN referral_code TEXT UNIQUE
    DEFAULT SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8);

UPDATE users
SET referral_code = SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8)
WHERE referral_code IS NULL;

-- Step 2: Create referrals table
CREATE TABLE referrals (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referee_id              TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status                  TEXT NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'activated')),
    referrer_tokens_awarded INTEGER NOT NULL DEFAULT 0,
    referee_tokens_awarded  INTEGER NOT NULL DEFAULT 0,
    activated_at            TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT referrals_referee_unique UNIQUE (referee_id)
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee  ON referrals(referee_id);
CREATE INDEX idx_referrals_status   ON referrals(status);

-- Step 3: RLS on referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
    ON referrals FOR SELECT
    USING (
        referrer_id = current_setting('request.jwt.claims', true)::json->>'sub'
        OR
        referee_id  = current_setting('request.jwt.claims', true)::json->>'sub'
    );

-- Step 4: Updated trigger (replaces 005_onboarding_token_rewards.sql trigger)
CREATE OR REPLACE FUNCTION award_onboarding_tokens()
RETURNS TRIGGER AS $$
DECLARE
    tokens_to_award      INTEGER := 0;
    award_description    TEXT    := '';
    referral_row         RECORD;
    referrer_new_balance INTEGER;
BEGIN
    IF OLD.first_gear_added_at IS NULL AND NEW.first_gear_added_at IS NOT NULL THEN
        tokens_to_award   := 25;
        award_description := 'Onboarding reward: Added first gear item';
    ELSIF OLD.first_trip_added_at IS NULL AND NEW.first_trip_added_at IS NOT NULL THEN
        tokens_to_award   := 25;
        award_description := 'Onboarding reward: Created first trip';
    ELSIF OLD.first_carlo_chat_at IS NULL AND NEW.first_carlo_chat_at IS NOT NULL THEN
        tokens_to_award   := 50;
        award_description := 'Onboarding reward: Started first Carlo chat';
    ELSIF OLD.profile_completed_at IS NULL AND NEW.profile_completed_at IS NOT NULL THEN
        tokens_to_award   := 25;
        award_description := 'Onboarding reward: Completed profile';
    END IF;

    IF tokens_to_award > 0 THEN
        NEW.token_balance := COALESCE(NEW.token_balance, 0) + tokens_to_award;
        INSERT INTO token_transactions (user_id, amount, balance_after, transaction_type, description)
        VALUES (NEW.id, tokens_to_award, NEW.token_balance, 'grant', award_description);
    END IF;

    IF OLD.first_carlo_chat_at IS NULL AND NEW.first_carlo_chat_at IS NOT NULL THEN
        SELECT * INTO referral_row
        FROM referrals
        WHERE referee_id = NEW.id AND status = 'pending'
        LIMIT 1;

        IF FOUND THEN
            NEW.token_balance := COALESCE(NEW.token_balance, 0) + 50;
            INSERT INTO token_transactions (user_id, amount, balance_after, transaction_type, description)
            VALUES (NEW.id, 50, NEW.token_balance, 'grant', 'Referral bonus: Joined via referral');

            UPDATE users
            SET token_balance = COALESCE(token_balance, 0) + 75
            WHERE id = referral_row.referrer_id
            RETURNING token_balance INTO referrer_new_balance;

            INSERT INTO token_transactions (user_id, amount, balance_after, transaction_type, description)
            VALUES (
                referral_row.referrer_id, 75, referrer_new_balance, 'grant',
                'Referral reward: ' || COALESCE(NEW.first_name, 'Your referral') || ' sent their first Carlo message'
            );

            UPDATE referrals
            SET status = 'activated', activated_at = NOW(),
                referrer_tokens_awarded = 75, referee_tokens_awarded = 50
            WHERE id = referral_row.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
