-- Certifications (1:1 with tasks where category='certification')
CREATE TABLE public.certifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      uuid UNIQUE NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  provider     text,  -- 'AWS', 'Google', 'Microsoft', 'Salesforce', etc.
  exam_name    text,
  exam_code    text,
  target_date  date,
  exam_date    date,
  passed       boolean DEFAULT false,
  score        integer,
  cost         numeric(10,2),
  study_hours  integer,
  voucher_code text
);

-- Opportunities (1:1 with tasks where category='opportunity')
CREATE TABLE public.opportunities (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      uuid UNIQUE NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  type         text NOT NULL DEFAULT 'positive' CHECK (type IN ('positive', 'negative')),
  deal_size    numeric(15,2),
  currency     text DEFAULT 'USD',
  stage        text CHECK (stage IN ('prospecting', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  client_name  text,
  contact_name text,
  probability  integer CHECK (probability >= 0 AND probability <= 100),
  close_date   date
);

-- Internal investments (1:1 with tasks where category='investment')
CREATE TABLE public.internal_investments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         uuid UNIQUE NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  investment_type text CHECK (investment_type IN ('tooling', 'training', 'headcount', 'infrastructure', 'process', 'other')),
  budget          numeric(15,2),
  spent           numeric(15,2) DEFAULT 0,
  currency        text DEFAULT 'USD',
  roi_estimate    numeric(10,2),
  roi_actual      numeric(10,2),
  sponsor         text,
  business_case   text
);

-- Enable RLS
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_investments ENABLE ROW LEVEL SECURITY;

-- Certifications RLS: inherit task access
CREATE POLICY "certs_select" ON public.certifications FOR SELECT TO authenticated
  USING (public.user_can_access_task(task_id));

CREATE POLICY "certs_insert" ON public.certifications FOR INSERT TO authenticated
  WITH CHECK (public.user_can_access_task(task_id));

CREATE POLICY "certs_update" ON public.certifications FOR UPDATE TO authenticated
  USING (public.user_can_access_task(task_id));

CREATE POLICY "certs_delete" ON public.certifications FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.created_by = auth.uid()
    )
  );

-- Opportunities RLS
CREATE POLICY "opps_select" ON public.opportunities FOR SELECT TO authenticated
  USING (public.user_can_access_task(task_id));

CREATE POLICY "opps_insert" ON public.opportunities FOR INSERT TO authenticated
  WITH CHECK (public.user_can_access_task(task_id));

CREATE POLICY "opps_update" ON public.opportunities FOR UPDATE TO authenticated
  USING (public.user_can_access_task(task_id));

CREATE POLICY "opps_delete" ON public.opportunities FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.created_by = auth.uid()
    )
  );

-- Internal investments RLS
CREATE POLICY "invest_select" ON public.internal_investments FOR SELECT TO authenticated
  USING (public.user_can_access_task(task_id));

CREATE POLICY "invest_insert" ON public.internal_investments FOR INSERT TO authenticated
  WITH CHECK (public.user_can_access_task(task_id));

CREATE POLICY "invest_update" ON public.internal_investments FOR UPDATE TO authenticated
  USING (public.user_can_access_task(task_id));

CREATE POLICY "invest_delete" ON public.internal_investments FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.created_by = auth.uid()
    )
  );
