/**
 * 장바구니에 담긴 상품 중 90일을 초과한 상품 삭제처리
 */
import { PrismaClient } from '@prisma/client';

const LOCAL_DB_URL = 'mysql://root:admin@localhost:3306/mybeans';
let databaseUrl = LOCAL_DB_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL을 설정해주세요.');
  process.exit(1);
}
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function main() {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    await prisma.cart.updateMany({
      data: {
        deletedAt: new Date(),
      },
      where: {
        deletedAt: null,
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });
  } catch (e) {
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}
main();
