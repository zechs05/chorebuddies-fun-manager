
-- Create function to get chore statistics
create or replace function public.get_chore_stats()
returns table (
  total_points bigint,
  completed_chores bigint,
  pending_chores bigint,
  streak_days integer,
  completion_rate numeric
)
security definer
language plpgsql
as $$
declare
  total_chores bigint;
begin
  -- Get total points from completed chores
  select coalesce(sum(points), 0) into total_points
  from chores
  where status = 'completed';

  -- Get count of completed chores
  select count(*) into completed_chores
  from chores
  where status = 'completed';

  -- Get count of pending chores
  select count(*) into pending_chores
  from chores
  where status = 'pending';

  -- Calculate completion rate
  select count(*) into total_chores
  from chores;

  -- Return the statistics
  return query
  select
    total_points,
    completed_chores,
    pending_chores,
    0 as streak_days, -- Placeholder for streak calculation
    case
      when total_chores > 0 then
        (completed_chores::numeric / total_chores::numeric) * 100
      else 0
    end as completion_rate;
end;
$$;

-- Create function to get leaderboard data
create or replace function public.get_leaderboard()
returns table (
  member_id uuid,
  member_name text,
  total_points bigint,
  completed_chores bigint,
  streak_days integer
)
security definer
language plpgsql
as $$
begin
  return query
  select
    fm.id as member_id,
    fm.name as member_name,
    coalesce(sum(c.points), 0)::bigint as total_points,
    count(c.id)::bigint as completed_chores,
    0 as streak_days -- Placeholder for streak calculation
  from
    family_members fm
    left join chores c on c.assigned_to = fm.id and c.status = 'completed'
  group by
    fm.id, fm.name
  order by
    total_points desc;
end;
$$;

