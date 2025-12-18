const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function updateTemplate() {
  try {
    console.log("Čitam template iz fajla...");
    const templatePath = path.join(__dirname, "../templates/doo-statut.hbs");
    const templateContent = fs.readFileSync(templatePath, "utf8");

    console.log(`Template veličina: ${templateContent.length} karaktera`);

    console.log("Ažuriram template u bazi...");
    const result = await prisma.template.update({
      where: { slug: "doo-statut" },
      data: {
        content: templateContent,
        variables: JSON.stringify([
          "companyName",
          "address",
          "email",
          "phone",
          "capital",
          "founders",
          "activityCode",
          "currentDate",
          "isPreview",
          "allActivities",
        ]),
      },
    });

    console.log("✅ Template uspješno ažuriran!");
    console.log(`ID: ${result.id}`);
    console.log(`Naziv: ${result.name}`);
    console.log(`Veličina u bazi: ${result.content.length} karaktera`);
  } catch (error) {
    console.error("❌ Greška:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTemplate();
