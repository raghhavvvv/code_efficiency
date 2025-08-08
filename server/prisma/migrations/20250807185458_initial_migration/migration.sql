-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "netScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CodingSession" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "codeSubmitted" TEXT,
    "netScore" DOUBLE PRECISION DEFAULT 0.0,
    "userId" INTEGER NOT NULL,
    "challengeId" INTEGER,

    CONSTRAINT "CodingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Challenge" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "expectedCompletionTime" INTEGER NOT NULL,
    "optimalKeywords" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'javascript',

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KeystrokeMetrics" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "keystrokeCount" INTEGER NOT NULL DEFAULT 0,
    "backspaceCount" INTEGER NOT NULL DEFAULT 0,
    "typingSpeed" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "keystrokeLog" JSONB NOT NULL,
    "efficiencyScore" DOUBLE PRECISION,

    CONSTRAINT "KeystrokeMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IdleMetrics" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "totalIdleTime" INTEGER NOT NULL DEFAULT 0,
    "idlePeriods" JSONB NOT NULL,
    "efficiencyScore" DOUBLE PRECISION,

    CONSTRAINT "IdleMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FocusMetrics" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "totalFocusTime" INTEGER NOT NULL DEFAULT 0,
    "contextSwitches" INTEGER NOT NULL DEFAULT 0,
    "efficiencyScore" DOUBLE PRECISION,

    CONSTRAINT "FocusMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ErrorMetrics" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "errorFrequency" INTEGER NOT NULL DEFAULT 0,
    "repeatedErrors" INTEGER NOT NULL DEFAULT 0,
    "avgTimeToFix" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "errorLog" JSONB NOT NULL,
    "efficiencyScore" DOUBLE PRECISION,

    CONSTRAINT "ErrorMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskMetrics" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "completionTime" INTEGER,
    "timeRatio" DOUBLE PRECISION,
    "keywordMatching" DOUBLE PRECISION,
    "efficiencyScore" DOUBLE PRECISION,

    CONSTRAINT "TaskMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasteEvent" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pasteLength" INTEGER NOT NULL,
    "pasteContent" TEXT NOT NULL,

    CONSTRAINT "PasteEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KeystrokeMetrics_sessionId_key" ON "public"."KeystrokeMetrics"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "IdleMetrics_sessionId_key" ON "public"."IdleMetrics"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "FocusMetrics_sessionId_key" ON "public"."FocusMetrics"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorMetrics_sessionId_key" ON "public"."ErrorMetrics"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskMetrics_sessionId_key" ON "public"."TaskMetrics"("sessionId");

-- AddForeignKey
ALTER TABLE "public"."CodingSession" ADD CONSTRAINT "CodingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CodingSession" ADD CONSTRAINT "CodingSession_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "public"."Challenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KeystrokeMetrics" ADD CONSTRAINT "KeystrokeMetrics_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."CodingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IdleMetrics" ADD CONSTRAINT "IdleMetrics_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."CodingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FocusMetrics" ADD CONSTRAINT "FocusMetrics_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."CodingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ErrorMetrics" ADD CONSTRAINT "ErrorMetrics_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."CodingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskMetrics" ADD CONSTRAINT "TaskMetrics_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."CodingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasteEvent" ADD CONSTRAINT "PasteEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."CodingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
