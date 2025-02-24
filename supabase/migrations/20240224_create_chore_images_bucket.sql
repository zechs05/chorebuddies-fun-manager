
-- Create the storage bucket for chore images
insert into storage.buckets (id, name, public)
values ('chore-images', 'chore-images', true);

-- Create a policy to allow authenticated users to upload images
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'chore-images' AND
  auth.uid() = owner
);

-- Create a policy to allow public viewing of images
create policy "Allow public viewing of images"
on storage.objects for select
to public
using (bucket_id = 'chore-images');
