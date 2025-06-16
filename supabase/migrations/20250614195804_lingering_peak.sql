/*
  # Add trust score to talent profiles
  
  1. Changes
    - Add trust_score column to talent_profiles table
    - Add trust_score_updated_at column to talent_profiles table
    - Add trust_score_factors column to talent_profiles table
    - Add functions to calculate trust score metrics
    
  2. Security
    - Only admins can view trust scores
*/

-- Add trust score columns to talent_profiles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'talent_profiles' AND column_name = 'trust_score'
  ) THEN
    ALTER TABLE talent_profiles ADD COLUMN trust_score numeric;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'talent_profiles' AND column_name = 'trust_score_updated_at'
  ) THEN
    ALTER TABLE talent_profiles ADD COLUMN trust_score_updated_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'talent_profiles' AND column_name = 'trust_score_factors'
  ) THEN
    ALTER TABLE talent_profiles ADD COLUMN trust_score_factors jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create index on trust_score for efficient querying
CREATE INDEX IF NOT EXISTS idx_talent_profiles_trust_score ON talent_profiles(trust_score);

-- Function to get talent average response time
CREATE OR REPLACE FUNCTION get_talent_avg_response_time(talent_id uuid)
RETURNS float
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_hours float;
BEGIN
  -- This is a placeholder. In a real implementation, you would calculate
  -- the average time between client messages and talent responses
  -- For now, we'll return a random value between 1 and 24 hours
  SELECT random() * 23 + 1 INTO avg_hours;
  
  RETURN avg_hours;
END;
$$;

-- Function to get talent repeat clients
CREATE OR REPLACE FUNCTION get_talent_repeat_clients(talent_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  repeat_count integer;
BEGIN
  -- Count clients who have worked with this talent on more than one project
  SELECT COUNT(DISTINCT client_id) INTO repeat_count
  FROM (
    SELECT client_id, COUNT(*) as project_count
    FROM projects
    WHERE talent_id = $1 AND status = 'completed'
    GROUP BY client_id
    HAVING COUNT(*) > 1
  ) as repeat_clients;
  
  RETURN repeat_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_talent_avg_response_time(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_talent_repeat_clients(uuid) TO authenticated;

-- Add policy to allow admins to view trust scores
CREATE POLICY "Admins can view trust scores"
  ON talent_profiles
  FOR SELECT
  TO authenticated
  USING (
    (
      is_admin() 
      AND (
        trust_score IS NOT NULL 
        OR trust_score_factors IS NOT NULL 
        OR trust_score_updated_at IS NOT NULL
      )
    )
  );