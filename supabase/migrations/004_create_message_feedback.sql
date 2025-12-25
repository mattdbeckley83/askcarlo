-- Create message_feedback table for Carlo AI feedback system
CREATE TABLE IF NOT EXISTS message_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    rating TEXT NOT NULL CHECK (rating IN ('helpful', 'not_helpful')),
    issue_type TEXT CHECK (issue_type IS NULL OR issue_type IN ('inaccurate', 'not_relevant', 'too_generic', 'missing_details', 'other')),
    comment TEXT,
    message_content TEXT,
    user_query TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure only one feedback per user per message
    UNIQUE(user_id, message_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_message_feedback_conversation ON message_feedback(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_feedback_user ON message_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_message_feedback_rating ON message_feedback(rating);

-- Enable RLS
ALTER TABLE message_feedback ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own feedback
CREATE POLICY "Users can view own feedback"
    ON message_feedback FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own feedback"
    ON message_feedback FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own feedback"
    ON message_feedback FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own feedback"
    ON message_feedback FOR DELETE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
