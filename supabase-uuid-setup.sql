-- =====================================================
-- UUID Auto-Generation Setup for Supabase
-- =====================================================
-- This SQL script sets up automatic UUID generation
-- for all tables that use UUID as primary key.
-- 
-- Run this in Supabase SQL Editor once to enable
-- auto-generation of UUIDs at database level.
-- =====================================================

-- Enable the pgcrypto extension for UUID generation
-- This is usually already enabled in Supabase, but just in case
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Step 1: Create default UUID function
-- =====================================================
-- This function generates a UUID v4 using pgcrypto
CREATE OR REPLACE FUNCTION generate_uuid_v4()
RETURNS TEXT AS $$
BEGIN
  RETURN gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Step 2: Alter tables to use UUID default
-- =====================================================
-- Set default value for id columns to auto-generate UUID

-- User table
ALTER TABLE "User" 
ALTER COLUMN id SET DEFAULT generate_uuid_v4();

-- Wedding table
ALTER TABLE "Wedding" 
ALTER COLUMN id SET DEFAULT generate_uuid_v4();

-- MenuConfig table
ALTER TABLE "MenuConfig" 
ALTER COLUMN id SET DEFAULT generate_uuid_v4();

-- Event table
ALTER TABLE "Event" 
ALTER COLUMN id SET DEFAULT generate_uuid_v4();

-- Gallery table
ALTER TABLE "Gallery" 
ALTER COLUMN id SET DEFAULT generate_uuid_v4();

-- Guest table
ALTER TABLE "Guest" 
ALTER COLUMN id SET DEFAULT generate_uuid_v4();

-- Wish table
ALTER TABLE "Wish" 
ALTER COLUMN id SET DEFAULT generate_uuid_v4();

-- Admin table
ALTER TABLE "Admin" 
ALTER COLUMN id SET DEFAULT generate_uuid_v4();

-- =====================================================
-- Step 3: Create trigger function for auto-UUID
-- (Optional backup solution)
-- =====================================================
-- This trigger ensures UUID is generated even if
-- the default value is somehow bypassed

CREATE OR REPLACE FUNCTION set_uuid_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set UUID if id is NULL
  IF NEW.id IS NULL THEN
    NEW.id := generate_uuid_v4();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Step 4: Attach triggers to all tables
-- =====================================================

CREATE TRIGGER set_user_uuid_before_insert
BEFORE INSERT ON "User"
FOR EACH ROW
EXECUTE FUNCTION set_uuid_before_insert();

CREATE TRIGGER set_wedding_uuid_before_insert
BEFORE INSERT ON "Wedding"
FOR EACH ROW
EXECUTE FUNCTION set_uuid_before_insert();

CREATE TRIGGER set_menuconfig_uuid_before_insert
BEFORE INSERT ON "MenuConfig"
FOR EACH ROW
EXECUTE FUNCTION set_uuid_before_insert();

CREATE TRIGGER set_event_uuid_before_insert
BEFORE INSERT ON "Event"
FOR EACH ROW
EXECUTE FUNCTION set_uuid_before_insert();

CREATE TRIGGER set_gallery_uuid_before_insert
BEFORE INSERT ON "Gallery"
FOR EACH ROW
EXECUTE FUNCTION set_uuid_before_insert();

CREATE TRIGGER set_guest_uuid_before_insert
BEFORE INSERT ON "Guest"
FOR EACH ROW
EXECUTE FUNCTION set_uuid_before_insert();

CREATE TRIGGER set_wish_uuid_before_insert
BEFORE INSERT ON "Wish"
FOR EACH ROW
EXECUTE FUNCTION set_uuid_before_insert();

CREATE TRIGGER set_admin_uuid_before_insert
BEFORE INSERT ON "Admin"
FOR EACH ROW
EXECUTE FUNCTION set_uuid_before_insert();

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify the setup is correct

-- Check if pgcrypto extension is enabled
-- SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- Check default values for User table
-- SELECT column_name, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'User' AND column_name = 'id';

-- Test UUID generation
-- SELECT generate_uuid_v4();

-- =====================================================
-- Rollback (if needed)
-- =====================================================
-- To undo these changes, run:
-- 
-- DROP TRIGGER IF EXISTS set_user_uuid_before_insert ON "User";
-- DROP TRIGGER IF EXISTS set_wedding_uuid_before_insert ON "Wedding";
-- DROP TRIGGER IF EXISTS set_menuconfig_uuid_before_insert ON "MenuConfig";
-- DROP TRIGGER IF EXISTS set_event_uuid_before_insert ON "Event";
-- DROP TRIGGER IF EXISTS set_gallery_uuid_before_insert ON "Gallery";
-- DROP TRIGGER IF EXISTS set_guest_uuid_before_insert ON "Guest";
-- DROP TRIGGER IF EXISTS set_wish_uuid_before_insert ON "Wish";
-- DROP TRIGGER IF EXISTS set_admin_uuid_before_insert ON "Admin";
-- DROP FUNCTION IF EXISTS set_uuid_before_insert();
-- ALTER TABLE "User" ALTER COLUMN id DROP DEFAULT;
-- ALTER TABLE "Wedding" ALTER COLUMN id DROP DEFAULT;
-- ALTER TABLE "MenuConfig" ALTER COLUMN id DROP DEFAULT;
-- ALTER TABLE "Event" ALTER COLUMN id DROP DEFAULT;
-- ALTER TABLE "Gallery" ALTER COLUMN id DROP DEFAULT;
-- ALTER TABLE "Guest" ALTER COLUMN id DROP DEFAULT;
-- ALTER TABLE "Wish" ALTER COLUMN id DROP DEFAULT;
-- ALTER TABLE "Admin" ALTER COLUMN id DROP DEFAULT;
-- DROP FUNCTION IF EXISTS generate_uuid_v4();
-- =====================================================
