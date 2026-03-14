-- Migration: Auth.js to better-auth
-- This migration converts the database schema from Auth.js (NextAuth v5) to better-auth.

-- 1. Convert email_verified from timestamp to boolean
ALTER TABLE "users" ALTER COLUMN "email_verified" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "email_verified" TYPE boolean USING (email_verified IS NOT NULL);
ALTER TABLE "users" ALTER COLUMN "email_verified" SET DEFAULT false;
ALTER TABLE "users" ALTER COLUMN "email_verified" SET NOT NULL;

-- 2. Drop password column from users (moves to accounts table)
ALTER TABLE "users" DROP COLUMN IF EXISTS "password";

-- 3. Create sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "expires_at" timestamp NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 4. Create accounts table
CREATE TABLE IF NOT EXISTS "accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "access_token_expires_at" timestamp,
  "refresh_token_expires_at" timestamp,
  "scope" text,
  "id_token" text,
  "password" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 5. Create verifications table
CREATE TABLE IF NOT EXISTS "verifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 6. Drop old Auth.js tables
DROP TABLE IF EXISTS "email_verification_tokens";
DROP TABLE IF EXISTS "password_reset_tokens";
