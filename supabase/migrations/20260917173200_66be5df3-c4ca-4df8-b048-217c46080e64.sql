DROP POLICY IF EXISTS conversations_select_member ON public.conversations;
CREATE POLICY conversations_select_member
ON public.conversations
FOR SELECT
TO authenticated
USING (
  private.is_conversation_member(id, auth.uid())
  OR created_by = auth.uid()
  OR private.has_role(auth.uid(), 'admin'::app_role)
);