-- Migration 002: Inject app_role into access token claims
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  claims jsonb;
  role_value text;
begin
  claims := coalesce(event->'claims', '{}'::jsonb);

  select role
    into role_value
  from public.members
  where lower(email) = lower(event->>'email')
  limit 1;

  if role_value is null then
    role_value := 'member';
  elsif role_value <> 'member' then
    role_value := 'admin';
  end if;

  claims := jsonb_set(claims, '{app_role}', to_jsonb(role_value), true);
  event := jsonb_set(event, '{claims}', claims, true);

  return event;
end;
$$;

comment on function public.custom_access_token_hook(jsonb)
  is 'Supabase custom access token hook that injects app_role claim from public.members.role';

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
revoke execute on function public.custom_access_token_hook(jsonb) from service_role;
