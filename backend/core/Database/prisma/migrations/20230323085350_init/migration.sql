-- CreateTable
CREATE TABLE "Website" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "nrOfPages" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "WebsiteGroupInfo" (
    "group" TEXT NOT NULL PRIMARY KEY,
    "rootDiv" TEXT NOT NULL,
    "divIdentifier" TEXT NOT NULL,
    "textIdentifier" TEXT NOT NULL,
    "imgIdentifier" TEXT NOT NULL,
    "nextIdentifier" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Website_url_key" ON "Website"("url");
