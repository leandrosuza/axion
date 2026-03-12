-- Add key_preview column to api_keys table
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS key_preview TEXT;

-- Delete any existing API keys that don't have the correct bdc_ format
-- Users will need to regenerate their API keys
DELETE FROM public.api_keys WHERE key_hash NOT LIKE '$2a$%' OR key_hash NOT LIKE '$2b$%';

-- Add a comment to the column
COMMENT ON COLUMN public.api_keys.key_preview IS 'Masked preview of the API key for display (e.g., bdc_xxxxx...xxxx)';
