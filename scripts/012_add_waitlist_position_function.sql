-- Function to update waitlist positions after removal
create or replace function update_waitlist_positions(slot_id_param uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Recalculate positions for all entries in this slot's waitlist
  with ranked as (
    select id, row_number() over (order by created_at) as new_position
    from public.waitlist
    where slot_id = slot_id_param
  )
  update public.waitlist
  set position = ranked.new_position
  from ranked
  where waitlist.id = ranked.id;
end;
$$;
