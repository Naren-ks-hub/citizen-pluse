
CREATE POLICY "Users upload own complaint images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'complaint-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own complaint images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'complaint-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins read all complaint images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'complaint-images' AND public.has_role(auth.uid(), 'admin'));
