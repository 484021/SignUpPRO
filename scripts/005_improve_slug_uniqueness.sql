-- Improve slug generation to include a random suffix for better uniqueness
create or replace function public.generate_slug(title text)
returns text
language plpgsql
as $$
declare
  slug_var text;
  base_slug text;
  random_suffix text;
begin
  -- Convert title to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  
  -- Generate a random 6-character suffix using alphanumeric characters
  random_suffix := substr(md5(random()::text || clock_timestamp()::text), 1, 6);
  
  -- Combine base slug with random suffix
  slug_var := base_slug || '-' || random_suffix;
  
  -- If somehow this still exists (extremely unlikely), add a counter
  while exists(select 1 from public.events where events.slug = slug_var) loop
    random_suffix := substr(md5(random()::text || clock_timestamp()::text), 1, 6);
    slug_var := base_slug || '-' || random_suffix;
  end loop;
  
  return slug_var;
end;
$$;
