/*
  # Escrow System Enhancements
  
  1. New Tables
    - escrow_history: Track all escrow actions with timestamps
    
  2. Updates
    - Add flagged column to projects table
    - Update escrow_transactions status enum
    
  3. Security
    - Enable RLS on new tables
    - Add policies for proper access control
    
  4. Functions
    - Add notification triggers for escrow events
*/

-- Add flagged column to projects if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'flagged'
  ) THEN
    ALTER TABLE projects ADD COLUMN flagged boolean DEFAULT false;
  END IF;
END $$;

-- Create escrow_history table
CREATE TABLE IF NOT EXISTS escrow_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  action text NOT NULL,
  actor_id uuid REFERENCES auth.users(id),
  actor_name text,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_escrow_action CHECK (
    action IN ('requested', 'approved', 'rejected', 'disputed', 'overridden', 'flagged')
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_escrow_history_project ON escrow_history(project_id);
CREATE INDEX IF NOT EXISTS idx_escrow_history_action ON escrow_history(action);
CREATE INDEX IF NOT EXISTS idx_escrow_history_created_at ON escrow_history(created_at);

-- Enable RLS
ALTER TABLE escrow_history ENABLE ROW LEVEL SECURITY;

-- Create policies for escrow_history
CREATE POLICY "Project members can view escrow history"
  ON escrow_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = escrow_history.project_id
      AND (
        projects.client_id = auth.uid()
        OR projects.talent_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can view all escrow history"
  ON escrow_history
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "System can insert escrow history"
  ON escrow_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update escrow_transactions status constraint to include new statuses
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'escrow_transactions_status_check'
  ) THEN
    ALTER TABLE escrow_transactions DROP CONSTRAINT escrow_transactions_status_check;
  END IF;
  
  -- Add updated constraint
  ALTER TABLE escrow_transactions ADD CONSTRAINT escrow_transactions_status_check 
    CHECK (status IN ('pending', 'funded', 'requested', 'approved', 'rejected', 'disputed', 'flagged', 'released', 'refunded'));
END $$;

-- Create function to automatically log escrow actions
CREATE OR REPLACE FUNCTION log_escrow_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_type text;
  user_name text;
BEGIN
  -- Determine action type based on status change
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      action_type := NEW.status;
    ELSE
      RETURN NEW; -- No status change, skip logging
    END IF;
  END IF;

  -- Get user name
  SELECT full_name INTO user_name
  FROM users
  WHERE id = auth.uid();

  -- Insert history record
  INSERT INTO escrow_history (
    project_id,
    action,
    actor_id,
    actor_name,
    metadata
  ) VALUES (
    NEW.project_id,
    action_type,
    auth.uid(),
    COALESCE(user_name, 'System'),
    jsonb_build_object(
      'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE null END,
      'new_status', NEW.status,
      'amount', NEW.amount
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger for escrow_transactions
DROP TRIGGER IF EXISTS escrow_action_logger ON escrow_transactions;
CREATE TRIGGER escrow_action_logger
  AFTER INSERT OR UPDATE ON escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION log_escrow_action();

-- Create function to send escrow notifications
CREATE OR REPLACE FUNCTION notify_escrow_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  -- Skip if status hasn't changed
  IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get project details
  SELECT * INTO project_record
  FROM projects
  WHERE id = NEW.project_id;

  -- Determine notification content based on status
  CASE NEW.status
    WHEN 'requested' THEN
      notification_title := '💰 Payment Release Requested';
      notification_message := 'Talent has requested payment release for "' || project_record.title || '"';
      notification_type := 'escrow_request';
      
      -- Notify client
      IF project_record.client_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, metadata)
        VALUES (
          project_record.client_id,
          notification_title,
          notification_message,
          notification_type,
          jsonb_build_object('project_id', NEW.project_id, 'escrow_id', NEW.id)
        );
      END IF;

    WHEN 'approved' THEN
      notification_title := '✅ Payment Released!';
      notification_message := 'Your payment for "' || project_record.title || '" has been released from escrow';
      notification_type := 'escrow_approved';
      
      -- Notify talent
      IF project_record.talent_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, metadata)
        VALUES (
          project_record.talent_id,
          notification_title,
          notification_message,
          notification_type,
          jsonb_build_object('project_id', NEW.project_id, 'escrow_id', NEW.id)
        );
      END IF;

    WHEN 'rejected' THEN
      notification_title := '❌ Payment Release Rejected';
      notification_message := 'Payment release for "' || project_record.title || '" was rejected';
      notification_type := 'escrow_rejected';
      
      -- Notify talent
      IF project_record.talent_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, metadata)
        VALUES (
          project_record.talent_id,
          notification_title,
          notification_message,
          notification_type,
          jsonb_build_object('project_id', NEW.project_id, 'escrow_id', NEW.id)
        );
      END IF;

    WHEN 'flagged' THEN
      notification_title := '🚨 Project Flagged for Review';
      notification_message := 'Project "' || project_record.title || '" has been flagged for potential fraud';
      notification_type := 'fraud_alert';
      
      -- Notify all admins
      INSERT INTO notifications (user_id, title, message, type, metadata)
      SELECT 
        admin_users.id,
        notification_title,
        notification_message,
        notification_type,
        jsonb_build_object('project_id', NEW.project_id, 'escrow_id', NEW.id)
      FROM admin_users;

    ELSE
      -- No notification for other statuses
      RETURN NEW;
  END CASE;

  RETURN NEW;
END;
$$;

-- Update the existing trigger to use the new function
DROP TRIGGER IF EXISTS on_escrow_status_change ON escrow_transactions;
CREATE TRIGGER on_escrow_status_change
  AFTER INSERT OR UPDATE OF status ON escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_escrow_status_change();