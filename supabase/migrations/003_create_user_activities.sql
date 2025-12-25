-- Create user_activities junction table
-- Run this in Supabase SQL editor if table doesn't exist

CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_id)
);

-- Enable RLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own activities"
    ON user_activities FOR SELECT
    USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can insert their own activities"
    ON user_activities FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can delete their own activities"
    ON user_activities FOR DELETE
    USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_activity_id ON user_activities(activity_id);
