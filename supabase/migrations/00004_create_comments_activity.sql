-- Comments on tasks
CREATE TABLE public.comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id  uuid NOT NULL REFERENCES public.profiles(id),
  parent_id  uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  body       text NOT NULL,
  edited     boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Immutable activity audit trail
CREATE TABLE public.activity_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  actor_id    uuid NOT NULL REFERENCES public.profiles(id),
  action      text NOT NULL CHECK (action IN ('created', 'status_changed', 'assigned', 'commented', 'progress_updated', 'field_updated', 'collaborator_added')),
  field_name  text,
  old_value   text,
  new_value   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_comments_task_id      ON public.comments(task_id);
CREATE INDEX idx_activity_task_id      ON public.activity_log(task_id);
CREATE INDEX idx_activity_created_at   ON public.activity_log(created_at DESC);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Comments RLS
CREATE POLICY "comments_select" ON public.comments FOR SELECT TO authenticated
  USING (public.user_can_access_task(task_id));

CREATE POLICY "comments_insert" ON public.comments FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND public.user_can_access_task(task_id));

CREATE POLICY "comments_update" ON public.comments FOR UPDATE TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "comments_delete" ON public.comments FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- Activity log RLS: read-only for task participants
CREATE POLICY "activity_select" ON public.activity_log FOR SELECT TO authenticated
  USING (public.user_can_access_task(task_id));

-- Only service role can insert activity log (via server actions with service key)
-- Or we allow authenticated inserts and rely on server-side validation
CREATE POLICY "activity_insert" ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND public.user_can_access_task(task_id));
