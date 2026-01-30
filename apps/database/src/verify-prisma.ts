import { prisma } from "./lib/prisma";

async function main() {
  const users = await prisma.user.findMany();
  console.log("Prisma connected. Users:", users);
}

main()
  .catch((e) => {
    console.error("Prisma error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
