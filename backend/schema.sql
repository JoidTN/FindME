-- Basic schema for users, profiles, nfc tokens
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id) NOT NULL,
  full_name text NOT NULL,
  dni text,
  allergies text,
  contact_number text,
  email text,
  blood_type text,
  medical_notes text,
  emergency_contact jsonb,
  last_lat double precision,
  last_lng double precision,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nfc_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  token text UNIQUE NOT NULL,
  max_uses integer DEFAULT 1,
  uses integer DEFAULT 0,
  expire_at timestamptz,
  created_at timestamptz DEFAULT now(),
  revoked boolean DEFAULT false
);
