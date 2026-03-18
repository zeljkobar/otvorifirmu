import { prisma } from "../src/lib/db";
import fs from "fs";
import path from "path";

async function main() {
  // Dodaj template za D.O.O. statut
  const statutTemplate = fs.readFileSync(
    path.join(process.cwd(), "templates", "doo-statut.hbs"),
    "utf-8",
  );

  await prisma.template.upsert({
    where: { slug: "doo-statut" },
    update: {
      content: statutTemplate,
      name: "Statut jednočlanog D.O.O.",
      description:
        "Statut jednočlanog društva sa ograničenom odgovornošću prema Zakonu 090/25",
    },
    create: {
      slug: "doo-statut",
      name: "Statut jednočlanog D.O.O.",
      description:
        "Statut jednočlanog društva sa ograničenom odgovornošću prema Zakonu 090/25",
      content: statutTemplate,
      variables: JSON.stringify({
        required: [
          "companyName",
          "city",
          "address",
          "email",
          "phone",
          "activity",
          "activityCode",
          "allActivities",
          "capital",
          "founders",
          "currentDate",
        ],
        founders: {
          fields: [
            "name",
            "isResident",
            "jmbg",
            "idNumber",
            "address",
            "sharePercentage",
            "birthPlace",
            "issuedBy",
          ],
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
