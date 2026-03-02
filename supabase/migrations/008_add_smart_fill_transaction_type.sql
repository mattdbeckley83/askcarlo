-- Add 'smart_fill' to the valid_transaction_type check constraint on token_transactions

ALTER TABLE token_transactions
    DROP CONSTRAINT valid_transaction_type;

ALTER TABLE token_transactions
    ADD CONSTRAINT valid_transaction_type CHECK (
        transaction_type IN ('grant', 'purchase', 'usage_chat', 'smart_fill')
    );
