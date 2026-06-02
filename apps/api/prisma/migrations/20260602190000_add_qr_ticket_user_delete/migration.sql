-- Allow users to remove eligible QR tickets from their own wallet without
-- deleting attendance, certificate, or audit history.
ALTER TABLE "QRTicket" ADD COLUMN "deletedByUserAt" TIMESTAMP(3);

CREATE INDEX "QRTicket_userId_deletedByUserAt_idx" ON "QRTicket"("userId", "deletedByUserAt");
