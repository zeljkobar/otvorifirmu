import { prisma } from "../src/lib/db";
import fs from "fs";
import path from "path";

async function main() {
  // Dodaj template za D.O.O. statut
  const statutTemplate = fs.readFileSync(
    path.join(process.cwd(), "templates", "doo-statut.hbs"),
    "utf-8"
  );

  await prisma.template.upsert({
    where: { slug: "doo-statut" },
    update: {
      content: statutTemplate,
      name: "D.O.O. Statut",
      description: "Statut društva sa ograničenom odgovornošću",
    },
    create: {
      slug: "doo-statut",
      name: "D.O.O. Statut",
      description: "Statut društva sa ograničenom odgovornošću",
      content: statutTemplate,
      variables: JSON.stringify({
        required: ["companyName", "address", "activity", "capital", "founders"],
        founders: {
          fields: ["name", "idNumber", "address", "sharePercentage"],
        },
      }),
    },
  });

  console.log("✅ Template dodaj u bazu");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
