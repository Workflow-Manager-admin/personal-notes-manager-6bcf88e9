# Supabase Table Schema Required

**Table required: `notes`**

| Column     | Type        | Required? | Default | Description                 |
|------------|-------------|-----------|---------|-----------------------------|
| id         | integer     | YES (PK)  | auto-increment | Note primary key             |
| title      | text        | YES       |         | Note title (100 chars max)   |
| content    | text        | NO        |         | Note content                 |
| created_at | timestamptz | YES       | now()   | Created timestamp            |
| updated_at | timestamptz | YES       | now()   | Updated timestamp            |

> Set `updated_at` to auto-update on update (using a trigger if needed).

- Table must be called `notes`.
- Required columns: id (integer PK), title (text), content (text), created_at, updated_at.

**Environment variables required:**

- `REACT_APP_APP_SUPABASE_URL`
- `REACT_APP_APP_SUPABASE_KEY`

These must be set for the frontend to connect to Supabase.

## Setup (sample SQL)

```sql
create table if not exists notes (
  id serial primary key,
  title text not null,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- For auto-updating updated_at on row update:
create or replace function update_updated_at_column() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

drop trigger if exists set_updated_at on notes;
create trigger set_updated_at
before update on notes
for each row
execute procedure update_updated_at_column();
```
