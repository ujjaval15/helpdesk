-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('GENERAL_QUESTION', 'TECHNICAL_QUESTION', 'REFUND_REQUEST');

-- CreateTable
CREATE TABLE "ticket" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "category" "TicketCategory",
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "assignedAgentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_status_idx" ON "ticket"("status");

-- CreateIndex
CREATE INDEX "ticket_category_idx" ON "ticket"("category");

-- CreateIndex
CREATE INDEX "ticket_assignedAgentId_idx" ON "ticket"("assignedAgentId");

-- CreateIndex
CREATE INDEX "ticket_customerEmail_idx" ON "ticket"("customerEmail");

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
