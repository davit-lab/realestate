-- ================================================================
-- Add detailed property columns to existing properties table
-- Run this in Supabase SQL Editor if the table already exists
-- ================================================================

alter table public.properties
  add column if not exists kitchen_area_sqm  numeric,
  add column if not exists floor_type        text,
  add column if not exists balconies         integer,
  add column if not exists bathrooms         integer,
  add column if not exists building_status   text,
  add column if not exists building_type     text,
  add column if not exists building_condition text,
  add column if not exists additional_info   text[] default '{}';
