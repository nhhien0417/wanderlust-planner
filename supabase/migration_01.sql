-- Add JSONB columns for nested data in trips
alter table trips add column expenses jsonb default '[]'::jsonb;
alter table trips add column tasks jsonb default '[]'::jsonb;
alter table trips add column packing_list jsonb default '[]'::jsonb;
alter table trips add column weather jsonb default '[]'::jsonb;
alter table trips add column photos jsonb default '[]'::jsonb;

-- Add order_index to activities for drag-and-drop reordering
alter table activities add column order_index integer default 0;
