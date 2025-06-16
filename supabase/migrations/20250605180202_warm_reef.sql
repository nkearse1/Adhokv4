/*
  # Add notifications and activity logging
  
  1. New Tables
    - notifications: Store user notifications
    - activity_logs: Track project activity history
    
  2. Security
    - Enable RLS on both tables
    - Add policies for proper access control
    
  3. Functions
    - Add trigger function for activity logging and notifications
*/

-- Safely create notifications table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT valid_notification_type CHECK (
      type IN ('project_update', 'deliverable_update', 'review', 'payment', 'system')
    )
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Safely create activity logs table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    actor_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Project members can view activity logs" ON activity_logs;

-- Recreate notification policies
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Recreate activity log policies
CREATE POLICY "Project members can view activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = activity_logs.project_id
      AND (
        projects.client_id = auth.uid()
        OR projects.talent_id = auth.uid()
      )
    )
  );

-- Drop existing function to avoid conflicts
DROP FUNCTION IF EXISTS log_activity_and_notify();

-- Recreate function
CREATE OR REPLACE FUNCTION log_activity_and_notify()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Get project details
  SELECT * INTO project_record
  FROM projects
  WHERE id = NEW.project_id;

  -- Create activity log
  INSERT INTO activity_logs (
    project_id,
    actor_id,
    action,
    details
  ) VALUES (
    NEW.project_id,
    auth.uid(),
    TG_ARGV[0],
    NEW.details
  );

  -- Determine notification content
  SELECT * INTO notification_title, notification_message
  FROM (VALUES 
    ('deliverable_update', 'Deliverable Updated', 'A deliverable has been updated'),
    ('project_update', 'Project Status Changed', 'The project status has been updated'),
    ('review', 'New Review Received', 'You have received a new review'),
    ('payment', 'Payment Update', 'There has been a payment update')
  ) AS content (type, title, message)
  WHERE type = TG_ARGV[0];

  -- Create notifications for relevant users
  IF project_record.client_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (project_record.client_id, notification_title, notification_message, TG_ARGV[0], 
      jsonb_build_object('project_id', NEW.project_id, 'details', NEW.details)
    );
  END IF;

  IF project_record.talent_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (project_record.talent_id, notification_title, notification_message, TG_ARGV[0],
      jsonb_build_object('project_id', NEW.project_id, 'details', NEW.details)
    );
  END IF;

  RETURN NEW;
END;
$$;