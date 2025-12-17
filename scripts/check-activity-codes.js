const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkActivityCodes() {
  try {
    console.log("Checking activity_codes table...");

    const activityCodes = await prisma.activityCode.findMany({
      orderBy: {
        code: "asc",
      },
    });

    console.log(`Found ${activityCodes.length} activity codes:`);
    console.log("\nFirst 10 records:");
    activityCodes.slice(0, 10).forEach((ac) => {
      console.log(`${ac.code} - ${ac.description}`);
    });

    if (activityCodes.length > 10) {
      console.log(`\n... and ${activityCodes.length - 10} more records`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActivityCodes();
