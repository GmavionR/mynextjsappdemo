// lib/prisma.ts
import { PrismaClient } from "../../generated/prisma";
// ================================================================
//  全局修复: "TypeError: Do not know how to serialize a BigInt"
//  这会告诉 JSON.stringify 在遇到 BigInt 时，将其转换为字符串。
// ================================================================
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 监听 SIGINT（Ctrl + C）信号来关闭 Prisma 连接
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
