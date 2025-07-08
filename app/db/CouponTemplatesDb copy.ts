import { prisma } from "@/app/lib/prisma";
async function main() {
  const allUsers = await prisma.coupon_templates.findMany();
  console.log(allUsers);
}

main();
