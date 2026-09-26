
-- Revoke execute on internal trigger-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Owner-scoped storage policies for complaint-images bucket
CREATE POLICY "Users can update their own complaint images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'complaint-images' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'complaint-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own complaint images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'complaint-images' AND auth.uid()::text = (storage.foldername(name))[1]);
