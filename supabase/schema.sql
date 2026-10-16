-- Run ONLY in a NEW Supabase project. Never run against the existing calculator.
create extension if not exists pgcrypto;
create table public.organizations(id uuid primary key default gen_random_uuid(),name text not null,created_at timestamptz not null default now());
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,organization_id uuid not null references public.organizations(id),display_name text not null,role text not null check(role in ('owner','leader','manager','member')),created_at timestamptz not null default now(),unique(id,organization_id));
create table public.categories(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),name text not null,visibility text not null default 'staff' check(visibility in ('staff','all')),unique(id,organization_id));
create table public.members(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),server_id text not null,name text not null,profile_id uuid references public.profiles(id),created_at timestamptz default now(),unique(organization_id,server_id),unique(id,organization_id));
create table public.posts(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),author_id uuid not null references public.profiles(id),category_id uuid,member_id uuid,title text not null,body text not null,kind text not null default 'incident',priority text not null default 'medium' check(priority in ('low','medium','high')),status text not null default 'open' check(status in ('open','review','resolved','archived')),created_at timestamptz not null default now(),foreign key(category_id,organization_id) references public.categories(id,organization_id),foreign key(member_id,organization_id) references public.members(id,organization_id));
create table public.comments(id uuid primary key default gen_random_uuid(),post_id uuid not null references public.posts(id) on delete cascade,author_id uuid not null references public.profiles(id),body text not null,created_at timestamptz not null default now());
create table public.farm_logs(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),profile_id uuid not null references public.profiles(id),resource_type text not null,quantity integer not null check(quantity>0),farmed_on date not null default current_date,status text not null default 'pending' check(status in ('pending','verified','rejected')),created_at timestamptz not null default now());
create index posts_org_time on public.posts(organization_id,created_at desc);
create index farm_org_day on public.farm_logs(organization_id,farmed_on desc);
create index farm_profile_day on public.farm_logs(profile_id,farmed_on desc);
create schema if not exists private;
-- Helper lives in an unexposed schema; explicitly limit EXECUTE.
create function private.is_staff(org uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=org and p.role in ('owner','leader','manager'))$$;
create function private.same_org(org uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.organization_id=org)$$;
revoke all on function private.is_staff(uuid),private.same_org(uuid) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.is_staff(uuid),private.same_org(uuid) to authenticated;
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.farm_logs enable row level security;
create policy org_read on public.organizations for select to authenticated using(private.same_org(id));
create policy profiles_read on public.profiles for select to authenticated using(id=(select auth.uid()) or private.is_staff(organization_id));
create policy categories_read on public.categories for select to authenticated using(private.same_org(organization_id) and (visibility='all' or private.is_staff(organization_id)));
create policy members_read on public.members for select to authenticated using(private.is_staff(organization_id) or profile_id=(select auth.uid()));
create policy posts_read on public.posts for select to authenticated using(private.is_staff(organization_id));
create policy posts_insert on public.posts for insert to authenticated with check(author_id=(select auth.uid()) and private.is_staff(organization_id));
create policy comments_read on public.comments for select to authenticated using(exists(select 1 from public.posts p where p.id=post_id and private.is_staff(p.organization_id)));
create policy comments_insert on public.comments for insert to authenticated with check(author_id=(select auth.uid()) and exists(select 1 from public.posts p where p.id=post_id and private.is_staff(p.organization_id)));
create policy farm_read on public.farm_logs for select to authenticated using(profile_id=(select auth.uid()) or private.is_staff(organization_id));
create policy farm_insert on public.farm_logs for insert to authenticated with check(profile_id=(select auth.uid()) and private.same_org(organization_id) and status='pending');
-- No client-side grants for modifying roles, approvals, or verifying farmeo.
-- Bootstrap the first owner manually from the SQL editor after creating their Auth user:
-- insert into public.organizations(name) values ('LA 04') returning id;
-- insert into public.profiles(id,organization_id,display_name,role) values ('AUTH_USER_UUID','ORG_UUID','Isaías Bianchi','owner');
-- For new accounts, an owner must explicitly create their profile using an admin-only trusted workflow.
