-- Add notification preference columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_alerts_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS usage_alerts_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS billing_alerts_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS security_alerts_enabled BOOLEAN DEFAULT true;

-- Update existing users to have notifications enabled by default
UPDATE users
SET
  email_alerts_enabled = COALESCE(email_alerts_enabled, true),
  usage_alerts_enabled = COALESCE(usage_alerts_enabled, true),
  billing_alerts_enabled = COALESCE(billing_alerts_enabled, true),
  security_alerts_enabled = COALESCE(security_alerts_enabled, true)
WHERE
  email_alerts_enabled IS NULL
  OR usage_alerts_enabled IS NULL
  OR billing_alerts_enabled IS NULL
  OR security_alerts_enabled IS NULL;
