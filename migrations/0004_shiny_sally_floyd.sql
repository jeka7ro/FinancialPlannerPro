-- Column location_id is now in the initial migration, only add foreign key constraint if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'slots_location_id_locations_id_fk'
    ) THEN
        ALTER TABLE "slots" ADD CONSTRAINT "slots_location_id_locations_id_fk" 
        FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") 
        ON DELETE no action ON UPDATE no action;
    END IF;
END $$;