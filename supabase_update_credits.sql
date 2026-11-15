-- =====================================================================
-- Update for the new CREDITS feature
-- Run ONCE in Supabase -> SQL Editor -> New query -> Run
-- (your existing data is kept)
-- =====================================================================

-- 1) New columns
alter table public.profiles
  add column if not exists credits int not null default 0;

alter table public.payment_requests
  add column if not exists package_credits int;

-- 2) Profile guard: users can never change role/status/plan/email,
--    and can only DECREASE their own credits (spending), never increase them.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
    new.plan := old.plan;
    new.gmail := old.gmail;
    new.plan_updated_at := old.plan_updated_at;
    if new.credits > old.credits then
      new.credits := old.credits;
    end if;
    if new.credits < 0 then
      new.credits := 0;
    end if;
    if new.plan_status is distinct from old.plan_status then
      if not (new.plan_status = 'pending' and old.plan_status <> 'active') then
        new.plan_status := old.plan_status;
      end if;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- 3) Payment request guard: credits come from the package, not from the user
create or replace function public.guard_payment_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.status := 'pending';
    new.admin_note := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.user_id := auth.uid();
    new.package_credits := case new.package_id
      when 'pkg_starter' then 500
      when 'pkg_pro' then 1500
      when 'pkg_agency' then 10000
      else null
    end;
  end if;
  return new;
end;
$$;
