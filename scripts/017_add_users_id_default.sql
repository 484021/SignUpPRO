-- Add default UUID generation for users.id column
ALTER TABLE users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Also ensure clerk_id is unique
ALTER TABLE users
ADD CONSTRAINT users_clerk_id_unique UNIQUE (clerk_id);
