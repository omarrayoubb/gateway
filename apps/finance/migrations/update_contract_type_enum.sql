-- Migration script to update ContractType enum
-- Run this in your PostgreSQL database

-- Step 1: Create a new enum type with the new values
CREATE TYPE contracts_contracttype_enum_new AS ENUM ('customer', 'vendor', 'employee', 'other');

-- Step 2: Alter the contracts table to use the new enum type
-- First, convert existing values (if any) - you may need to map old values to new ones
ALTER TABLE contracts 
  ALTER COLUMN "contractType" TYPE contracts_contracttype_enum_new 
  USING CASE 
    WHEN "contractType"::text = 'sales' THEN 'customer'::contracts_contracttype_enum_new
    WHEN "contractType"::text = 'purchase' THEN 'vendor'::contracts_contracttype_enum_new
    WHEN "contractType"::text = 'service' THEN 'other'::contracts_contracttype_enum_new
    WHEN "contractType"::text = 'lease' THEN 'other'::contracts_contracttype_enum_new
    WHEN "contractType"::text = 'other' THEN 'other'::contracts_contracttype_enum_new
    ELSE 'other'::contracts_contracttype_enum_new
  END;

-- Step 3: Drop the old enum type
DROP TYPE contracts_contracttype_enum;

-- Step 4: Rename the new enum type to the original name
ALTER TYPE contracts_contracttype_enum_new RENAME TO contracts_contracttype_enum;

-- Step 5: Update PartyType enum to include 'employee' (if it doesn't exist)
-- Check if 'employee' already exists in the enum
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'employee' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'contracts_partytype_enum')
  ) THEN
    ALTER TYPE contracts_partytype_enum ADD VALUE 'employee';
  END IF;
END $$;

