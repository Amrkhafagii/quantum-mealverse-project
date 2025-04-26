
-- Create the menu-items storage bucket
insert into storage.buckets (id, name, public)
values ('menu-items', 'menu-items', true)
on conflict (id) do nothing;

-- Allow public access to the menu-items bucket
create policy "Menu items images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'menu-items' );

-- Allow authenticated users to upload menu item images
create policy "Restaurant users can upload menu item images"
on storage.objects for insert
with check (
  bucket_id = 'menu-items' AND
  (auth.role() = 'authenticated')
);

-- Allow users to update their own menu item images
create policy "Restaurant users can update their own menu item images"
on storage.objects for update
using (
  bucket_id = 'menu-items' AND
  (auth.role() = 'authenticated')
);

-- Allow users to delete their own menu item images
create policy "Restaurant users can delete their own menu item images"
on storage.objects for delete
using (
  bucket_id = 'menu-items' AND
  (auth.role() = 'authenticated')
);
