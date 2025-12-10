-- Clear all tables to start fresh
-- Run this to reset your database

-- Delete in correct order to respect foreign key constraints
DELETE FROM waitlist;
DELETE FROM signups;
DELETE FROM slots;
DELETE FROM events;
DELETE FROM users;
