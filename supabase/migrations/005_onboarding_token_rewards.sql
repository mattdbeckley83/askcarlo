-- Trigger function: fires when a milestone timestamp changes from NULL to a value
CREATE OR REPLACE FUNCTION award_onboarding_tokens()
RETURNS TRIGGER AS $$
DECLARE
    tokens_to_award INTEGER := 0;
    award_description TEXT := '';
BEGIN
    IF OLD.first_gear_added_at IS NULL AND NEW.first_gear_added_at IS NOT NULL THEN
        tokens_to_award := 25;
        award_description := 'Onboarding reward: Added first gear item';
    ELSIF OLD.first_trip_added_at IS NULL AND NEW.first_trip_added_at IS NOT NULL THEN
        tokens_to_award := 25;
        award_description := 'Onboarding reward: Created first trip';
    ELSIF OLD.first_carlo_chat_at IS NULL AND NEW.first_carlo_chat_at IS NOT NULL THEN
        tokens_to_award := 50;
        award_description := 'Onboarding reward: Started first Carlo chat';
    ELSIF OLD.profile_completed_at IS NULL AND NEW.profile_completed_at IS NOT NULL THEN
        tokens_to_award := 25;
        award_description := 'Onboarding reward: Completed profile';
    END IF;

    IF tokens_to_award > 0 THEN
        NEW.token_balance := COALESCE(NEW.token_balance, 0) + tokens_to_award;

        INSERT INTO token_transactions (user_id, amount, balance_after, transaction_type, description)
        VALUES (NEW.id, tokens_to_award, NEW.token_balance, 'grant', award_description);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to users table
CREATE TRIGGER onboarding_token_rewards
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION award_onboarding_tokens();
