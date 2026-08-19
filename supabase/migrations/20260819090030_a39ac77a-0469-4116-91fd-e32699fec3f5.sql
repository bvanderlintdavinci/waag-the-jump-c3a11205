DROP POLICY "conversations_select_member" ON public.conversations;
CREATE POLICY "conversations_select_member" ON public.conversations FOR SELECT TO authenticated
USING (
  public.is_conversation_member(id, auth.uid())
  OR created_by = auth.uid()
  OR activity_id IS NOT NULL
  OR public.has_role(auth.uid(),'admin')
);