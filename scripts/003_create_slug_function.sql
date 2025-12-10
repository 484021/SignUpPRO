-- Function to generate unique slug from title
create or replace function public.generate_slug(title text)
returns text
language plpgsql
as $$
declare
  slug text;
  counter int := 0;
  base_slug text;
begin
  -- Convert title to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  slug := base_slug;
  
  -- Check if slug exists and append counter if needed
  while exists(select 1 from public.events where events.slug = slug) loop
    counter := counter + 1;
    slug := base_slug || '-' || counter;
  end loop;
  
  return slug;
end;
$$;
