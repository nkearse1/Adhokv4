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
CREATE OR REPLACE FUNCTION get_talent_avg_response_time(user_id uuid)
RETURNS float
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_hours float;
BEGIN
  -- In a real implementation, this would calculate the average time between
  -- client messages and talent responses from a messages table
  -- For now, we'll use a more deterministic approach based on user_id
  
  -- Use the user_id to generate a consistent but seemingly random value
  -- This is just for demonstration purposes
  SELECT 
    CASE 
      WHEN user_id = '00000000-0000-0000-0000-000000000006' THEN 1.5  -- Alex Rivera (Expert)
      WHEN user_id = '00000000-0000-0000-0000-000000000007' THEN 3.2  -- Jessica Park (Pro)
      WHEN user_id = '00000000-0000-0000-0000-000000000008' THEN 2.8  -- Marcus Williams (Pro)
      WHEN user_id = '00000000-0000-0000-0000-000000000009' THEN 5.7  -- Sophie Anderson (Specialist)
      ELSE (ABS(('x' || substring(user_id::text, 2, 8))::bit(32)::int) % 24) + 1
    END INTO avg_hours;
  
  RETURN avg_hours;
END;
$$;

-- Function to get talent repeat clients
CREATE OR REPLACE FUNCTION get_talent_repeat_clients(user_id uuid)
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
    WHERE projects.talent_id = user_id AND projects.status = 'completed'
    GROUP BY client_id
    HAVING COUNT(*) > 1
  ) as repeat_clients;
  
  -- If no data, use a deterministic value for demo purposes
  IF repeat_count IS NULL THEN
    SELECT 
      CASE 
        WHEN user_id = '00000000-0000-0000-0000-000000000006' THEN 3  -- Alex Rivera (Expert)
        WHEN user_id = '00000000-0000-0000-0000-000000000007' THEN 2  -- Jessica Park (Pro)
        WHEN user_id = '00000000-0000-0000-0000-000000000008' THEN 1  -- Marcus Williams (Pro)
        WHEN user_id = '00000000-0000-0000-0000-000000000009' THEN 0  -- Sophie Anderson (Specialist)
        ELSE (ABS(('x' || substring(user_id::text, 2, 8))::bit(32)::int) % 4)
      END INTO repeat_count;
  END IF;
  
  RETURN repeat_count;
END;
$$;

-- Function to calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(
  completed_projects integer,
  admin_complaints integer,
  missed_deadlines integer,
  positive_ratings integer,
  response_time float,
  client_retention integer
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  score numeric := 50; -- Base score starts at 50
BEGIN
  -- Positive factors
  score := score + (completed_projects * 5); -- Each completed project adds 5 points
  score := score + (positive_ratings * 3); -- Each positive rating adds 3 points
  score := score + (client_retention * 10); -- Each repeat client adds 10 points
  
  -- Negative factors
  score := score - (admin_complaints * 15); -- Each admin complaint reduces 15 points
  score := score - (missed_deadlines * 8); -- Each missed deadline reduces 8 points
  
  -- Response time factor (lower is better)
  IF response_time < 2 THEN
    score := score + 10; -- < 2 hours
  ELSIF response_time < 6 THEN
    score := score + 5; -- < 6 hours
  ELSIF response_time > 24 THEN
    score := score - 10; -- > 24 hours
  END IF;
  
  -- Ensure score is between 0-100
  RETURN GREATEST(0, LEAST(100, score));
END;
$$;

-- Function to update trust score for a talent
CREATE OR REPLACE FUNCTION update_talent_trust_score(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completed_projects integer;
  admin_complaints integer;
  missed_deadlines integer;
  positive_ratings integer;
  response_time float;
  client_retention integer;
  calculated_trust_score numeric;
  factors jsonb;
BEGIN
  -- Get completed projects count
  SELECT COUNT(*) INTO completed_projects
  FROM projects
  WHERE projects.talent_id = user_id AND projects.status = 'completed';
  
  -- Get admin complaints count
  SELECT COUNT(*) INTO admin_complaints
  FROM admin_audit_logs
  WHERE admin_audit_logs.entity_id = user_id AND admin_audit_logs.action = 'flag_talent';
  
  -- Get missed deadlines count
  SELECT COUNT(*) INTO missed_deadlines
  FROM projects
  WHERE projects.talent_id = user_id AND projects.deadline < now() AND projects.status != 'completed';
  
  -- Get positive ratings count (4-5 stars)
  SELECT COUNT(*) INTO positive_ratings
  FROM project_reviews pr
  JOIN projects p ON pr.project_id = p.id
  WHERE p.talent_id = user_id AND pr.rating >= 4;
  
  -- Get average response time
  SELECT get_talent_avg_response_time(user_id) INTO response_time;
  
  -- Get client retention
  SELECT get_talent_repeat_clients(user_id) INTO client_retention;
  
  -- Calculate trust score
  SELECT calculate_trust_score(
    completed_projects,
    admin_complaints,
    missed_deadlines,
    positive_ratings,
    response_time,
    client_retention
  ) INTO calculated_trust_score;
  
  -- Create factors object
  factors := jsonb_build_object(
    'completedProjects', completed_projects,
    'adminComplaints', admin_complaints,
    'missedDeadlines', missed_deadlines,
    'positiveRatings', positive_ratings,
    'responseTime', response_time,
    'clientRetention', client_retention
  );
  
  -- Update talent profile
  UPDATE talent_profiles
  SET 
    trust_score = calculated_trust_score,
    trust_score_updated_at = now(),
    trust_score_factors = factors
  WHERE talent_profiles.id = user_id;
  
  -- Return the factors and score
  RETURN jsonb_build_object(
    'trust_score', calculated_trust_score,
    'factors', factors
  );
END;
$$;

-- Function to recalculate all trust scores
CREATE OR REPLACE FUNCTION recalculate_all_trust_scores()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  talent_record record;
  updated_count integer := 0;
BEGIN
  FOR talent_record IN SELECT id FROM talent_profiles LOOP
    PERFORM update_talent_trust_score(talent_record.id);
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_talent_avg_response_time(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_talent_repeat_clients(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_trust_score(integer, integer, integer, integer, float, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION update_talent_trust_score(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_all_trust_scores() TO authenticated;

-- Add policy to allow admins to view and update trust scores
CREATE POLICY "Admins can view and update trust scores"
  ON talent_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.user_role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.user_role = 'admin'
    )
  );

-- Add initial trust scores for mock talents
SELECT update_talent_trust_score('00000000-0000-0000-0000-000000000006'); -- Alex Rivera (Expert)
SELECT update_talent_trust_score('00000000-0000-0000-0000-000000000007'); -- Jessica Park (Pro)
SELECT update_talent_trust_score('00000000-0000-0000-0000-000000000008'); -- Marcus Williams (Pro)
SELECT update_talent_trust_score('00000000-0000-0000-0000-000000000009'); -- Sophie Anderson (Specialist)