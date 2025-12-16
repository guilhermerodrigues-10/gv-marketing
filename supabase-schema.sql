-- GV Marketing Database Schema for Supabase
-- Execute este SQL no Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Gerente', 'Membro', 'Convidado')),
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  budget NUMERIC(10, 2) DEFAULT 0,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Members (many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog',
  priority TEXT NOT NULL CHECK (priority IN ('Baixa', 'Normal', 'Alta', 'Urgente')),
  due_date TIMESTAMPTZ,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  time_tracked INTEGER DEFAULT 0, -- in seconds
  is_tracking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Assignees (many-to-many relationship)
CREATE TABLE IF NOT EXISTS task_assignees (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (task_id, user_id)
);

-- Subtasks Table
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Columns/Board Configuration Table
CREATE TABLE IF NOT EXISTS board_columns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets Library Table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL, -- Dropbox path
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'document', 'other')),
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_uploaded_by ON assets(uploaded_by);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permitir tudo por enquanto - você pode restringir depois)
-- Users
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users" ON users FOR UPDATE USING (true);

-- Projects
CREATE POLICY "Enable read access for all users" ON projects FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users" ON projects FOR UPDATE USING (true);
CREATE POLICY "Enable delete for users" ON projects FOR DELETE USING (true);

-- Tasks
CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete for users" ON tasks FOR DELETE USING (true);

-- Notifications
CREATE POLICY "Enable read access for all users" ON notifications FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Enable delete for users" ON notifications FOR DELETE USING (true);

-- Board Columns
CREATE POLICY "Enable read access for all users" ON board_columns FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON board_columns FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users" ON board_columns FOR UPDATE USING (true);
CREATE POLICY "Enable delete for users" ON board_columns FOR DELETE USING (true);

-- Project Members
CREATE POLICY "Enable read access for all users" ON project_members FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON project_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for users" ON project_members FOR DELETE USING (true);

-- Task Assignees
CREATE POLICY "Enable read access for all users" ON task_assignees FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON task_assignees FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for users" ON task_assignees FOR DELETE USING (true);

-- Subtasks
CREATE POLICY "Enable read access for all users" ON subtasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON subtasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users" ON subtasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete for users" ON subtasks FOR DELETE USING (true);

-- Attachments
CREATE POLICY "Enable read access for all users" ON attachments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for users" ON attachments FOR DELETE USING (true);

-- Assets
CREATE POLICY "Enable read access for all users" ON assets FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users" ON assets FOR UPDATE USING (true);
CREATE POLICY "Enable delete for users" ON assets FOR DELETE USING (true);

-- Insert default board columns
INSERT INTO board_columns (id, title, position) VALUES
  ('backlog', 'Backlog', 0),
  ('todo', 'A Fazer', 1),
  ('in_progress', 'Em Progresso', 2),
  ('review', 'Revisão', 3),
  ('done', 'Concluído', 4)
ON CONFLICT (id) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
