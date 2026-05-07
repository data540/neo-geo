create policy "owners can create initial membership" on workspace_members for insert
  with check (
    role = 'owner'
    and user_id = auth.uid()
    and exists (
      select 1
      from workspaces
      where workspaces.id = workspace_members.workspace_id
        and workspaces.owner_id = auth.uid()
    )
  );
