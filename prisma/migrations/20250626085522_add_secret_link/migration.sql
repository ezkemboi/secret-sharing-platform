-- CreateTable
CREATE TABLE "SecretLink" (
    "id" TEXT NOT NULL,
    "secretId" TEXT NOT NULL,
    "viewed" BOOLEAN NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecretLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SecretLink_secretId_key" ON "SecretLink"("secretId");

-- AddForeignKey
ALTER TABLE "SecretLink" ADD CONSTRAINT "SecretLink_secretId_fkey" FOREIGN KEY ("secretId") REFERENCES "Secret"("id") ON DELETE CASCADE ON UPDATE CASCADE;
