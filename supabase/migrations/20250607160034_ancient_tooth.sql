/*
  # Create project deliverables table
  
  1. New Tables
    - `project_deliverables`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `title` (text)
      - `description` (text)
      - `status` (text with check constraint)
      - `notes` (text, nullable)
      - `feedback` (text, nullable)
      - `submitted_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS on `project_deliverables` table
    - Add policies for clients and talents to manage deliverables
    
  3. Indexes
    - Add indexes for project_id and status for better query performance
*/

-- Create project_deliverables table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'recommended',
  notes text,
  feedback text,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT project_deliverables_status_check 
    CHECK (status IN ('recommended', 'scoped', 'in_progress', 'approved', 'completed', 'draft', 'submitted', 'rejected'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_deliverables_project ON project_deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_status ON project_deliverables(status);

-- Enable RLS
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Clients can view project deliverables" ON project_deliverables;
DROP POLICY IF EXISTS "Talents can manage their deliverables" ON project_deliverables;

-- Create policies for deliverables access
CREATE POLICY "Clients can view project deliverables"
  ON project_deliverables
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_deliverables.project_id
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "Talents can manage their deliverables"
  ON project_deliverables
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_bids
      WHERE project_bids.project_id = project_deliverables.project_id
      AND project_bids.professional_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_bids
      WHERE project_bids.project_id = project_deliverables.project_id
      AND project_bids.professional_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_project_deliverables_updated_at'
  ) THEN
    CREATE TRIGGER update_project_deliverables_updated_at
      BEFORE UPDATE ON project_deliverables
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;