create or replace function public.commit_member_import(p_chapter_id uuid, import_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  entry jsonb;
  payload jsonb;
  duplicate_policy text;
  existing_id uuid;
  created_count int := 0;
  updated_count int := 0;
  skipped_count int := 0;
begin
  if jsonb_typeof(import_rows) is distinct from 'array' then
    raise exception 'import_rows must be a json array';
  end if;

  for entry in select value from jsonb_array_elements(import_rows)
  loop
    duplicate_policy := coalesce(entry->>'duplicate_policy', 'overwrite');
    existing_id := nullif(entry->>'existing_id', '')::uuid;
    payload := coalesce(entry->'payload', '{}'::jsonb);

    if duplicate_policy = 'skip' then
      skipped_count := skipped_count + 1;
      continue;
    end if;

    if existing_id is null then
      insert into public.members (
        chapter_id,
        email,
        member_number,
        chinese_name,
        english_name,
        line_name,
        specialty_title,
        specialty_description,
        general_referral,
        ideal_referral,
        dream_referral,
        company_name,
        company_address,
        industry_experience_years,
        previous_career,
        role,
        position,
        committee,
        is_active
      ) values (
        p_chapter_id,
        payload->>'email',
        nullif(payload->>'member_number', ''),
        payload->>'chinese_name',
        nullif(payload->>'english_name', ''),
        nullif(payload->>'line_name', ''),
        nullif(payload->>'specialty_title', ''),
        nullif(payload->>'specialty_description', ''),
        nullif(payload->>'general_referral', ''),
        nullif(payload->>'ideal_referral', ''),
        nullif(payload->>'dream_referral', ''),
        nullif(payload->>'company_name', ''),
        nullif(payload->>'company_address', ''),
        case when nullif(payload->>'industry_experience_years', '') is null then null else (payload->>'industry_experience_years')::int end,
        nullif(payload->>'previous_career', ''),
        coalesce(nullif(payload->>'role', ''), 'member'),
        nullif(payload->>'position', ''),
        nullif(payload->>'committee', ''),
        coalesce((payload->>'is_active')::boolean, true)
      );
      created_count := created_count + 1;
      continue;
    end if;

    if duplicate_policy = 'merge' then
      update public.members as m
      set
        member_number = coalesce(nullif(m.member_number, ''), nullif(payload->>'member_number', ''), m.member_number),
        chinese_name = coalesce(nullif(m.chinese_name, ''), nullif(payload->>'chinese_name', ''), m.chinese_name),
        english_name = coalesce(nullif(m.english_name, ''), nullif(payload->>'english_name', ''), m.english_name),
        line_name = coalesce(nullif(m.line_name, ''), nullif(payload->>'line_name', ''), m.line_name),
        specialty_title = coalesce(nullif(m.specialty_title, ''), nullif(payload->>'specialty_title', ''), m.specialty_title),
        specialty_description = coalesce(nullif(m.specialty_description, ''), nullif(payload->>'specialty_description', ''), m.specialty_description),
        general_referral = coalesce(nullif(m.general_referral, ''), nullif(payload->>'general_referral', ''), m.general_referral),
        ideal_referral = coalesce(nullif(m.ideal_referral, ''), nullif(payload->>'ideal_referral', ''), m.ideal_referral),
        dream_referral = coalesce(nullif(m.dream_referral, ''), nullif(payload->>'dream_referral', ''), m.dream_referral),
        company_name = coalesce(nullif(m.company_name, ''), nullif(payload->>'company_name', ''), m.company_name),
        company_address = coalesce(nullif(m.company_address, ''), nullif(payload->>'company_address', ''), m.company_address),
        industry_experience_years = coalesce(m.industry_experience_years, case when nullif(payload->>'industry_experience_years', '') is null then null else (payload->>'industry_experience_years')::int end),
        previous_career = coalesce(nullif(m.previous_career, ''), nullif(payload->>'previous_career', ''), m.previous_career),
        position = coalesce(nullif(m.position, ''), nullif(payload->>'position', ''), m.position),
        committee = coalesce(nullif(m.committee, ''), nullif(payload->>'committee', ''), m.committee),
        updated_at = now()
      where m.id = existing_id
        and m.chapter_id = p_chapter_id;
    else
      update public.members as m
      set
        email = coalesce(nullif(payload->>'email', ''), m.email),
        member_number = nullif(payload->>'member_number', ''),
        chinese_name = coalesce(nullif(payload->>'chinese_name', ''), m.chinese_name),
        english_name = nullif(payload->>'english_name', ''),
        line_name = nullif(payload->>'line_name', ''),
        specialty_title = nullif(payload->>'specialty_title', ''),
        specialty_description = nullif(payload->>'specialty_description', ''),
        general_referral = nullif(payload->>'general_referral', ''),
        ideal_referral = nullif(payload->>'ideal_referral', ''),
        dream_referral = nullif(payload->>'dream_referral', ''),
        company_name = nullif(payload->>'company_name', ''),
        company_address = nullif(payload->>'company_address', ''),
        industry_experience_years = case when nullif(payload->>'industry_experience_years', '') is null then null else (payload->>'industry_experience_years')::int end,
        previous_career = nullif(payload->>'previous_career', ''),
        role = coalesce(nullif(payload->>'role', ''), m.role),
        position = nullif(payload->>'position', ''),
        committee = nullif(payload->>'committee', ''),
        is_active = coalesce((payload->>'is_active')::boolean, m.is_active),
        updated_at = now()
      where m.id = existing_id
        and m.chapter_id = p_chapter_id;
    end if;

    updated_count := updated_count + 1;
  end loop;

  return jsonb_build_object(
    'created', created_count,
    'updated', updated_count,
    'skipped', skipped_count
  );
end;
$$;
