-- Bring the migration history in line with prisma/schema.prisma.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

DO $$ BEGIN
  CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Bus"
  ADD COLUMN IF NOT EXISTS "images" JSONB;

ALTER TABLE "Trip"
  ADD COLUMN IF NOT EXISTS "seatPricingConfig" JSONB,
  ADD COLUMN IF NOT EXISTS "seatStatuses" JSONB;

CREATE TABLE IF NOT EXISTS "Admin" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "passwordHash" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_phone_key" ON "Admin"("phone");
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "BusBooking"
  ADD COLUMN IF NOT EXISTS "passengers" JSONB,
  ADD COLUMN IF NOT EXISTS "contact" JSONB,
  ADD COLUMN IF NOT EXISTS "options" JSONB,
  ADD COLUMN IF NOT EXISTS "requestKey" TEXT;
ALTER TABLE "PackageBooking"
  ADD COLUMN IF NOT EXISTS "bookingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "travelers" JSONB,
  ADD COLUMN IF NOT EXISTS "contact" JSONB,
  ADD COLUMN IF NOT EXISTS "options" JSONB,
  ADD COLUMN IF NOT EXISTS "requestKey" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "BusBooking_requestKey_key" ON "BusBooking"("requestKey");
CREATE UNIQUE INDEX IF NOT EXISTS "PackageBooking_requestKey_key" ON "PackageBooking"("requestKey");

CREATE TABLE IF NOT EXISTS "BusBookingSeat" (
  "id" TEXT NOT NULL,
  "tripId" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "seatNumber" TEXT NOT NULL,
  CONSTRAINT "BusBookingSeat_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BusBookingSeat_tripId_seatNumber_key"
  ON "BusBookingSeat"("tripId", "seatNumber");
CREATE INDEX IF NOT EXISTS "BusBookingSeat_bookingId_idx"
  ON "BusBookingSeat"("bookingId");

ALTER TABLE "BusBookingSeat"
  DROP CONSTRAINT IF EXISTS "BusBookingSeat_tripId_fkey";
ALTER TABLE "BusBookingSeat"
  ADD CONSTRAINT "BusBookingSeat_tripId_fkey"
  FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BusBookingSeat"
  DROP CONSTRAINT IF EXISTS "BusBookingSeat_bookingId_fkey";
ALTER TABLE "BusBookingSeat"
  ADD CONSTRAINT "BusBookingSeat_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "BusBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Stop if historical active bookings overlap: an operator must resolve these
-- explicitly rather than silently discarding an allocation.
INSERT INTO "BusBookingSeat" ("id", "tripId", "bookingId", "seatNumber")
SELECT md5(b."id" || ':' || b."tripId" || ':' || seat), b."tripId", b."id", seat
FROM "BusBooking" b
CROSS JOIN LATERAL unnest(b."seatNumbers") AS seat
WHERE b."status" IN ('Pending', 'Confirmed')
ON CONFLICT DO NOTHING;
