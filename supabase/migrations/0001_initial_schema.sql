-- =========== EXTENSIONES ===========
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- =========== USUARIOS Y WORKSPACES ===========
create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  domain text,
  brand_name text not null,
  brand_aliases text[] default '{}',
  brand_statement text,
  default_country text default 'ES',
  default_language text default 'es-ES',
  plan text default 'free' check (plan in ('free','pro','enterprise')),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table workspace_members (
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner','admin','viewer')),
  created_at timestamptz default now(),
  primary key (workspace_id, user_id)
);

-- =========== CATALOGO LLM ===========
create table llm_providers (
  id text primary key,
  name text not null,
  enabled boolean default true,
  cost_per_million_input numeric,
  cost_per_million_output numeric
);

insert into llm_providers (id, name, cost_per_million_input, cost_per_million_output) values
  ('openai-gpt-5', 'OpenAI GPT-5', 1.25, 10),
  ('anthropic-haiku-4-5', 'Claude Haiku 4.5', 1, 5),
  ('gemini-3-flash-lite', 'Gemini 3 Flash Lite', 0.10, 0.40),
  ('perplexity-sonar-pro', 'Perplexity Sonar Pro', 3, 15);

-- =========== PROMPTS ===========
create table prompts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  text text not null,
  country text default 'ES',
  language text default 'es-ES',
  status text default 'active' check (status in ('active','paused','archived')),
  schedule_cron text default '0 6 * * *',
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index prompts_workspace_status_idx on prompts (workspace_id, status);

create table prompt_llms (
  prompt_id uuid references prompts(id) on delete cascade,
  llm_id text references llm_providers(id),
  primary key (prompt_id, llm_id)
);

-- =========== EJECUCIONES ===========
create table responses (
  id uuid primary key default uuid_generate_v4(),
  raw_text text not null,
  raw_json jsonb,
  tokens_in int default 0,
  tokens_out int default 0,
  created_at timestamptz default now()
);

create table prompt_runs (
  id uuid primary key default uuid_generate_v4(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  llm_id text not null references llm_providers(id),
  ran_at timestamptz default now(),
  status text not null check (status in ('success','error','rate_limited')),
  response_id uuid references responses(id) on delete set null,
  brand_mentioned boolean default false,
  brand_position int,
  brand_sentiment text check (brand_sentiment in ('positive','neutral','negative')),
  brand_consistency_score numeric,
  total_brands_mentioned int default 0,
  cost_usd numeric default 0,
  latency_ms int,
  error text,
  date_bucket date generated always as (ran_at::date) stored,
  unique (prompt_id, llm_id, date_bucket)
);

create index prompt_runs_prompt_ran_at_idx on prompt_runs (prompt_id, ran_at desc);

-- =========== MARCAS Y MENCIONES ===========
create table brands (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  aliases text[] default '{}',
  domain text,
  is_own boolean default false,
  is_tracked boolean default true,
  category text default 'competitor' check (category in ('own','competitor','partner')),
  created_at timestamptz default now()
);

create unique index brands_workspace_name_idx on brands (workspace_id, lower(name));

create table mentions (
  id uuid primary key default uuid_generate_v4(),
  prompt_run_id uuid not null references prompt_runs(id) on delete cascade,
  brand_id uuid not null references brands(id) on delete cascade,
  position int,
  context text,
  sentiment text check (sentiment in ('positive','neutral','negative')),
  sentiment_score numeric,
  detected_via text check (detected_via in ('exact','fuzzy','llm-extract'))
);

create index mentions_brand_run_idx on mentions (brand_id, prompt_run_id);

-- =========== SOURCES ===========
create table sources (
  id uuid primary key default uuid_generate_v4(),
  prompt_run_id uuid not null references prompt_runs(id) on delete cascade,
  url text not null,
  domain text not null,
  title text,
  is_owned boolean default false
);

create index sources_domain_idx on sources (domain);

-- =========== METRICAS AGREGADAS ===========
create table daily_workspace_metrics (
  workspace_id uuid references workspaces(id) on delete cascade,
  date date not null,
  brand_mentions int default 0,
  total_runs int default 0,
  avg_position numeric,
  brand_consistency_pct numeric,
  share_of_voice_pct numeric,
  primary key (workspace_id, date)
);

create table daily_prompt_metrics (
  prompt_id uuid references prompts(id) on delete cascade,
  date date not null,
  llm_id text references llm_providers(id),
  brand_mentioned_count int default 0,
  total_runs int default 0,
  avg_position numeric,
  sov_pct numeric,
  primary key (prompt_id, date, llm_id)
);

-- =========== RLS HELPERS ===========
create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_workspace(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and role in ('owner','admin')
  );
$$;

-- =========== RLS ===========
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table llm_providers enable row level security;
alter table prompts enable row level security;
alter table prompt_llms enable row level security;
alter table prompt_runs enable row level security;
alter table responses enable row level security;
alter table brands enable row level security;
alter table mentions enable row level security;
alter table sources enable row level security;
alter table daily_workspace_metrics enable row level security;
alter table daily_prompt_metrics enable row level security;

create policy "authenticated can read llm providers" on llm_providers for select
  using (auth.uid() is not null);

create policy "members can read workspaces" on workspaces for select
  using (public.is_workspace_member(id));

create policy "owners can update workspaces" on workspaces for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "authenticated can create owned workspaces" on workspaces for insert
  with check (owner_id = auth.uid());

create policy "members can read workspace members" on workspace_members for select
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage workspace members" on workspace_members for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "members can read prompts" on prompts for select
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage prompts" on prompts for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "members can read prompt llms" on prompt_llms for select
  using (
    exists (
      select 1 from prompts
      where prompts.id = prompt_llms.prompt_id
        and public.is_workspace_member(prompts.workspace_id)
    )
  );

create policy "admins can manage prompt llms" on prompt_llms for all
  using (
    exists (
      select 1 from prompts
      where prompts.id = prompt_llms.prompt_id
        and public.can_manage_workspace(prompts.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from prompts
      where prompts.id = prompt_llms.prompt_id
        and public.can_manage_workspace(prompts.workspace_id)
    )
  );

create policy "members can read prompt runs" on prompt_runs for select
  using (
    exists (
      select 1 from prompts
      where prompts.id = prompt_runs.prompt_id
        and public.is_workspace_member(prompts.workspace_id)
    )
  );

create policy "admins can manage prompt runs" on prompt_runs for all
  using (
    exists (
      select 1 from prompts
      where prompts.id = prompt_runs.prompt_id
        and public.can_manage_workspace(prompts.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from prompts
      where prompts.id = prompt_runs.prompt_id
        and public.can_manage_workspace(prompts.workspace_id)
    )
  );

create policy "members can read responses" on responses for select
  using (
    exists (
      select 1
      from prompt_runs
      join prompts on prompts.id = prompt_runs.prompt_id
      where prompt_runs.response_id = responses.id
        and public.is_workspace_member(prompts.workspace_id)
    )
  );

create policy "admins can manage responses" on responses for all
  using (
    exists (
      select 1
      from prompt_runs
      join prompts on prompts.id = prompt_runs.prompt_id
      where prompt_runs.response_id = responses.id
        and public.can_manage_workspace(prompts.workspace_id)
    )
  )
  with check (true);

create policy "members can read brands" on brands for select
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage brands" on brands for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "members can read mentions" on mentions for select
  using (
    exists (
      select 1
      from brands
      where brands.id = mentions.brand_id
        and public.is_workspace_member(brands.workspace_id)
    )
  );

create policy "admins can manage mentions" on mentions for all
  using (
    exists (
      select 1
      from brands
      where brands.id = mentions.brand_id
        and public.can_manage_workspace(brands.workspace_id)
    )
  )
  with check (
    exists (
      select 1
      from brands
      where brands.id = mentions.brand_id
        and public.can_manage_workspace(brands.workspace_id)
    )
  );

create policy "members can read sources" on sources for select
  using (
    exists (
      select 1
      from prompt_runs
      join prompts on prompts.id = prompt_runs.prompt_id
      where prompt_runs.id = sources.prompt_run_id
        and public.is_workspace_member(prompts.workspace_id)
    )
  );

create policy "admins can manage sources" on sources for all
  using (
    exists (
      select 1
      from prompt_runs
      join prompts on prompts.id = prompt_runs.prompt_id
      where prompt_runs.id = sources.prompt_run_id
        and public.can_manage_workspace(prompts.workspace_id)
    )
  )
  with check (
    exists (
      select 1
      from prompt_runs
      join prompts on prompts.id = prompt_runs.prompt_id
      where prompt_runs.id = sources.prompt_run_id
        and public.can_manage_workspace(prompts.workspace_id)
    )
  );

create policy "members can read daily workspace metrics" on daily_workspace_metrics for select
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage daily workspace metrics" on daily_workspace_metrics for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "members can read daily prompt metrics" on daily_prompt_metrics for select
  using (
    exists (
      select 1 from prompts
      where prompts.id = daily_prompt_metrics.prompt_id
        and public.is_workspace_member(prompts.workspace_id)
    )
  );

create policy "admins can manage daily prompt metrics" on daily_prompt_metrics for all
  using (
    exists (
      select 1 from prompts
      where prompts.id = daily_prompt_metrics.prompt_id
        and public.can_manage_workspace(prompts.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from prompts
      where prompts.id = daily_prompt_metrics.prompt_id
        and public.can_manage_workspace(prompts.workspace_id)
    )
  );
