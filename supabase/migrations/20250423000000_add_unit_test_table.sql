
create table if not exists unit_test_customer (
  id uuid default uuid_generate_v4() primary key,
  test_name text not null,
  function_name text not null,
  input jsonb,
  expected_output jsonb,
  actual_output jsonb,
  passed boolean not null,
  error_message text,
  execution_time double precision not null,
  timestamp timestamptz not null default now()
);

-- Add index on timestamp for efficient querying
create index idx_unit_test_customer_timestamp 
  on unit_test_customer(timestamp);

-- Add index on function name for filtering
create index idx_unit_test_customer_function 
  on unit_test_customer(function_name);
