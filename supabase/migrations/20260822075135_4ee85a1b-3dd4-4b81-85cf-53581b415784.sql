DROP INDEX IF EXISTS public.activities_source_url_key;
CREATE UNIQUE INDEX activities_source_url_key ON public.activities (source_url);