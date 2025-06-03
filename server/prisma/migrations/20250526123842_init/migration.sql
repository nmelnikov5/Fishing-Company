-- CreateTable
CREATE TABLE "Boat" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "displacement" DOUBLE PRECISION NOT NULL,
    "buildDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewMember" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrewMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FishingTrip" (
    "id" SERIAL NOT NULL,
    "boatId" INTEGER NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FishingTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FishingBank" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FishingBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankVisit" (
    "id" SERIAL NOT NULL,
    "fishingTripId" INTEGER NOT NULL,
    "fishingBankId" INTEGER NOT NULL,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FishType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FishType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FishCatch" (
    "id" SERIAL NOT NULL,
    "bankVisitId" INTEGER NOT NULL,
    "fishTypeId" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "quality" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FishCatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CrewMemberToFishingTrip" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FishType_name_key" ON "FishType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_CrewMemberToFishingTrip_AB_unique" ON "_CrewMemberToFishingTrip"("A", "B");

-- CreateIndex
CREATE INDEX "_CrewMemberToFishingTrip_B_index" ON "_CrewMemberToFishingTrip"("B");

-- AddForeignKey
ALTER TABLE "FishingTrip" ADD CONSTRAINT "FishingTrip_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankVisit" ADD CONSTRAINT "BankVisit_fishingTripId_fkey" FOREIGN KEY ("fishingTripId") REFERENCES "FishingTrip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankVisit" ADD CONSTRAINT "BankVisit_fishingBankId_fkey" FOREIGN KEY ("fishingBankId") REFERENCES "FishingBank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FishCatch" ADD CONSTRAINT "FishCatch_bankVisitId_fkey" FOREIGN KEY ("bankVisitId") REFERENCES "BankVisit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FishCatch" ADD CONSTRAINT "FishCatch_fishTypeId_fkey" FOREIGN KEY ("fishTypeId") REFERENCES "FishType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrewMemberToFishingTrip" ADD CONSTRAINT "_CrewMemberToFishingTrip_A_fkey" FOREIGN KEY ("A") REFERENCES "CrewMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrewMemberToFishingTrip" ADD CONSTRAINT "_CrewMemberToFishingTrip_B_fkey" FOREIGN KEY ("B") REFERENCES "FishingTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
