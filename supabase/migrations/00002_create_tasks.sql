-- Core tasks table
CREATE TABLE public.tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  description  text,
  category     text NOT NULL CHECK (category IN ('certification', 'opportunity', 'investment')),
  status       text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
  priority     text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  progress     integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date     date,
  created_by   uuid NOT NULL REFERENCES public.profiles(id),
  assignee_id  uuid REFERENCES public.profiles(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Collaborators (many-to-many)
CREATE TABLE public.task_collaborators (
  task_id   uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role      text NOT NULL DEFAULT 'viewer' CHECK (role IN ('editor', 'viewer')),
  added_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, user_id)
);

-- Indexes
CREATE INDEX idx_tasks_category    ON public.tasks(category);
CREATE INDEX idx_tasks_status      ON public.tasks(status);
CREATE INDEX idx_tasks_assignee    ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_created_by  ON public.tasks(created_by);
CREATE INDEX idx_tasks_due_date    ON public.tasks(due_date);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_collaborators ENABLE ROW LEVEL SECURITY;

-- Helper function: can current user access this task?
CREATE OR REPLACE FUNCTION public.user_can_access_task(task_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_id
      AND (
        t.created_by = auth.uid()
        OR t.assignee_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.task_collaborators tc
          WHERE tc.task_id = t.id AND tc.user_id = auth.uid()
        )
      )
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Task RLS policies
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR assignee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.task_collaborators tc
      WHERE tc.task_id = id AND tc.user_id = auth.uid()
    )
  );

CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR assignee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.task_collaborators tc
      WHERE tc.task_id = id AND tc.user_id = auth.uid() AND tc.role = 'editor'
    )
  );

CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- Collaborators RLS
CREATE POLICY "collab_select" ON public.task_collaborators FOR SELECT TO authenticated
  USING (public.user_can_access_task(task_id));

CREATE POLICY "collab_insert" ON public.task_collaborators FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "collab_delete" ON public.task_collaborators FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND t.created_by = auth.uid()
    )
  );
