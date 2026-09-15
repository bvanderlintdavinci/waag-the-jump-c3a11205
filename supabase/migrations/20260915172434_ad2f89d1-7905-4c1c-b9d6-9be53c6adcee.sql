ALTER TABLE public.profiles
  ADD COLUMN education_level text,
  ADD COLUMN occupation text,
  ADD COLUMN industry text,
  ADD COLUMN languages text[] NOT NULL DEFAULT '{}',
  ADD COLUMN living_situation text,
  ADD COLUMN relationship_status text,
  ADD COLUMN has_children text,
  ADD COLUMN children_details text,
  ADD COLUMN child_wish text,
  ADD COLUMN sports text[] NOT NULL DEFAULT '{}',
  ADD COLUMN lifestyle text,
  ADD COLUMN favorite_activities text,
  ADD COLUMN dating_preferences text,
  ADD COLUMN profile_visibility jsonb NOT NULL DEFAULT '{"education_level":false,"occupation":false,"industry":false,"languages":false,"living_situation":false,"relationship_status":false,"has_children":false,"children_details":false,"child_wish":false,"sports":false,"lifestyle":false,"favorite_activities":false,"dating_preferences":false}'::jsonb;

COMMENT ON COLUMN public.profiles.profile_visibility IS 'Per-field opt-in visibility for optional extended profile details.';