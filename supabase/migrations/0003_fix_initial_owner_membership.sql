create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from workspaces
    where id = target_workspace_id
      and owner_id = auth.uid()
  );
$$;

create policy "owners can create their own membership" on workspace_members for insert
  with check (
    role = 'owner'
    and user_id = auth.uid()
    and public.is_workspace_owner(workspace_id)
  );
