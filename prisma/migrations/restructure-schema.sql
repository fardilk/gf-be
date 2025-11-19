-- Migration: Restructure database schema
-- This migration transforms the schema to use _id PKs only and adds new tables

BEGIN;

-- Step 1: Create new tables
CREATE TABLE IF NOT EXISTS "organization_level" (
  "organization_level_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_level_name" VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "relation" (
  "relation_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "relation_name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "gifter_id" UUID,
  "receiver_id" UUID
);

CREATE TABLE IF NOT EXISTS "upcoming_event" (
  "upcoming_event_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "person_id" UUID NOT NULL,
  "upcoming_event_title" VARCHAR(255) NOT NULL,
  "relation_id" UUID NOT NULL,
  "event_date" DATE NOT NULL
);

-- Step 2: Add new columns to person table
ALTER TABLE "person" ADD COLUMN IF NOT EXISTS "is_free" BOOLEAN DEFAULT false;
ALTER TABLE "person" ADD COLUMN IF NOT EXISTS "organization_level_id" UUID;

-- Step 3: Backup existing data before transformation
-- Create temp tables to hold mapping data
CREATE TEMP TABLE gender_mapping AS
SELECT gender_id, gender_code, name as gender_name FROM gender WHERE gender_id IS NOT NULL;

CREATE TEMP TABLE city_mapping AS
SELECT city_id, city_code, name as city_name FROM city WHERE city_id IS NOT NULL;

CREATE TEMP TABLE ethnicity_mapping AS
SELECT ethnicity_id, ethnicity_code, name as ethnicity_name FROM ethnicity WHERE ethnicity_id IS NOT NULL;

CREATE TEMP TABLE job_mapping AS
SELECT job_id, job_code, name as job_name FROM job WHERE job_id IS NOT NULL;

-- Step 4: Transform Gender table
-- Drop old constraints and columns
ALTER TABLE "person" DROP CONSTRAINT IF EXISTS "person_gender_code_fkey";
ALTER TABLE "person" DROP CONSTRAINT IF EXISTS "person_gender_id_fkey";

-- Make sure gender_id is populated for all rows
UPDATE "gender" SET gender_id = gen_random_uuid() WHERE gender_id IS NULL;

-- Update person.gender_id from person.gender_code using mapping
UPDATE "person" p
SET gender_id = gm.gender_id
FROM gender_mapping gm
WHERE p.gender_code = gm.gender_code AND p.gender_id IS NULL;

-- Drop old gender table and recreate
DROP TABLE IF EXISTS "gender" CASCADE;
CREATE TABLE "gender" (
  "gender_id" UUID PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL
);

-- Restore gender data from mapping
INSERT INTO "gender" (gender_id, name)
SELECT gender_id, gender_name FROM gender_mapping
ON CONFLICT DO NOTHING;

-- Step 5: Transform City table
ALTER TABLE "person" DROP CONSTRAINT IF EXISTS "person_birth_place_fkey";
ALTER TABLE "person" DROP CONSTRAINT IF EXISTS "person_birth_place_id_fkey";

-- Rename person.birth_place_id to person.city_id
ALTER TABLE "person" RENAME COLUMN "birth_place_id" TO "city_id";

-- Update person.city_id from person.birth_place (city_code) using mapping
UPDATE "person" p
SET city_id = cm.city_id
FROM city_mapping cm
WHERE p.birth_place = cm.city_code AND p.city_id IS NULL;

-- Drop birth_place column (old city_code)
ALTER TABLE "person" DROP COLUMN IF EXISTS "birth_place";

-- Make sure city_id is populated for all city rows
UPDATE "city" SET city_id = gen_random_uuid() WHERE city_id IS NULL;

-- Drop old city table and recreate
DROP TABLE IF EXISTS "city" CASCADE;
CREATE TABLE "city" (
  "city_id" UUID PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL
);

-- Restore city data from mapping
INSERT INTO "city" (city_id, name)
SELECT city_id, city_name FROM city_mapping
ON CONFLICT DO NOTHING;

-- Step 6: Transform Ethnicity table
ALTER TABLE "person" DROP CONSTRAINT IF EXISTS "person_ethnicity_code_fkey";
ALTER TABLE "person" DROP CONSTRAINT IF EXISTS "person_ethnicity_id_fkey";

-- Update person.ethnicity_id from person.ethnicity_code using mapping
UPDATE "person" p
SET ethnicity_id = em.ethnicity_id
FROM ethnicity_mapping em
WHERE p.ethnicity_code = em.ethnicity_code AND p.ethnicity_id IS NULL;

-- Drop old ethnicity table and recreate (will filter out Group A, B, C in seed)
DROP TABLE IF EXISTS "ethnicity" CASCADE;
CREATE TABLE "ethnicity" (
  "ethnicity_id" UUID PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL
);

-- Restore ethnicity data (excluding generic groups)
INSERT INTO "ethnicity" (ethnicity_id, name)
SELECT ethnicity_id, ethnicity_name FROM ethnicity_mapping
WHERE ethnicity_name NOT LIKE 'Group%'
ON CONFLICT DO NOTHING;

-- Drop person ethnicity_code column
ALTER TABLE "person" DROP COLUMN IF EXISTS "ethnicity_code";

-- Step 7: Transform Job table
ALTER TABLE "person" DROP CONSTRAINT IF EXISTS "person_job_code_fkey";
ALTER TABLE "person" DROP CONSTRAINT IF EXISTS "person_job_id_fkey";

-- Update person.job_id from person.job_code using mapping
UPDATE "person" p
SET job_id = jm.job_id
FROM job_mapping jm
WHERE p.job_code = jm.job_code AND p.job_id IS NULL;

-- Drop job_other table
DROP TABLE IF EXISTS "job_other" CASCADE;

-- Drop old job table and recreate
DROP TABLE IF EXISTS "job" CASCADE;
CREATE TABLE "job" (
  "job_id" UUID PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL
);

-- Restore job data from mapping
INSERT INTO "job" (job_id, name)
SELECT job_id, job_name FROM job_mapping
ON CONFLICT DO NOTHING;

-- Add "Other" job if not exists
INSERT INTO "job" (job_id, name)
VALUES (gen_random_uuid(), 'Other')
ON CONFLICT DO NOTHING;

-- Drop person job_code column
ALTER TABLE "person" DROP COLUMN IF EXISTS "job_code";

-- Step 8: Transform MaritalStatus table
ALTER TABLE "person" DROP CONSTRAINT IF EXISTS "person_marital_status_fkey";

-- Rename marital_status column to marital_status_id and update values
ALTER TABLE "person" RENAME COLUMN "marital_status" TO "marital_status_id";

-- Update marital status codes to unclear codes (ms1, ms2, etc)
UPDATE "person" SET marital_status_id = 'ms1' WHERE marital_status_id = 'single';
UPDATE "person" SET marital_status_id = 'ms2' WHERE marital_status_id = 'married';
UPDATE "person" SET marital_status_id = 'ms3' WHERE marital_status_id = 'divorced';
UPDATE "person" SET marital_status_id = 'ms4' WHERE marital_status_id = 'undisclosed';

-- Update marital_status table
UPDATE "marital_status" SET marital_status_code = 'ms1' WHERE marital_status_code = 'single';
UPDATE "marital_status" SET marital_status_code = 'ms2' WHERE marital_status_code = 'married';
UPDATE "marital_status" SET marital_status_code = 'ms3' WHERE marital_status_code = 'divorced';
UPDATE "marital_status" SET marital_status_code = 'ms4' WHERE marital_status_code = 'undisclosed';

-- Rename marital_status_code to marital_status_id
ALTER TABLE "marital_status" RENAME COLUMN "marital_status_code" TO "marital_status_id";

-- Step 9: Re-create foreign key constraints
ALTER TABLE "person" ADD CONSTRAINT "person_gender_id_fkey" 
  FOREIGN KEY ("gender_id") REFERENCES "gender"("gender_id") ON DELETE SET NULL;

ALTER TABLE "person" ADD CONSTRAINT "person_city_id_fkey" 
  FOREIGN KEY ("city_id") REFERENCES "city"("city_id") ON DELETE SET NULL;

ALTER TABLE "person" ADD CONSTRAINT "person_ethnicity_id_fkey" 
  FOREIGN KEY ("ethnicity_id") REFERENCES "ethnicity"("ethnicity_id") ON DELETE SET NULL;

ALTER TABLE "person" ADD CONSTRAINT "person_job_id_fkey" 
  FOREIGN KEY ("job_id") REFERENCES "job"("job_id") ON DELETE SET NULL;

ALTER TABLE "person" ADD CONSTRAINT "person_marital_status_id_fkey" 
  FOREIGN KEY ("marital_status_id") REFERENCES "marital_status"("marital_status_id") ON DELETE SET NULL;

ALTER TABLE "person" ADD CONSTRAINT "person_organization_level_id_fkey" 
  FOREIGN KEY ("organization_level_id") REFERENCES "organization_level"("organization_level_id") ON DELETE SET NULL;

-- Step 10: Add foreign keys for new tables
ALTER TABLE "relation" ADD CONSTRAINT "relation_gifter_id_fkey" 
  FOREIGN KEY ("gifter_id") REFERENCES "person"("person_id") ON DELETE SET NULL;

ALTER TABLE "relation" ADD CONSTRAINT "relation_receiver_id_fkey" 
  FOREIGN KEY ("receiver_id") REFERENCES "person"("person_id") ON DELETE SET NULL;

ALTER TABLE "upcoming_event" ADD CONSTRAINT "upcoming_event_person_id_fkey" 
  FOREIGN KEY ("person_id") REFERENCES "person"("person_id") ON DELETE CASCADE;

ALTER TABLE "upcoming_event" ADD CONSTRAINT "upcoming_event_relation_id_fkey" 
  FOREIGN KEY ("relation_id") REFERENCES "relation"("relation_id") ON DELETE CASCADE;

-- Step 11: Create indexes
CREATE INDEX IF NOT EXISTS "relation_gifter_id_idx" ON "relation"("gifter_id");
CREATE INDEX IF NOT EXISTS "relation_receiver_id_idx" ON "relation"("receiver_id");
CREATE INDEX IF NOT EXISTS "upcoming_event_person_id_idx" ON "upcoming_event"("person_id");
CREATE INDEX IF NOT EXISTS "upcoming_event_relation_id_idx" ON "upcoming_event"("relation_id");

COMMIT;
