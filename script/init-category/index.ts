/**
 * 최초 카테고리 데이터 세팅
 * category 테이블에 데이터가 없어야하며, id가 AI 이므로 초기화 해놓을 것
 * npm run script init-category
 */
import { PrismaClient, Prisma } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

/* prisma client */
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

/* read category json */
interface ICategoryNode {
  kr: string;
  en: string;
  children?: ICategoryNode[];
}
const filePath = path.resolve(__dirname, 'category.json');
const categoryData: ICategoryNode[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

/* main */
async function main() {
  try {
    const count = await prisma.category.count();
    if (count > 0) {
      console.error('❌ category 테이블이 비어있지 않습니다. 초기화 후 실행하세요.');
      return;
    }

    await prisma.$transaction(async (tx) => {
      await insertCategoryTree(tx, categoryData);
    });

    console.log('✅ 카테고리 데이터 초기화 완료');
  } catch (e) {
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

async function insertCategoryTree(
  tx: Prisma.TransactionClient,
  nodes: ICategoryNode[],
  parentId: number | null = null,
) {
  for (const node of nodes) {
    const { kr, en, children } = node;

    const category = await tx.category.create({
      data: {
        nameKr: kr,
        nameEn: en,
        parentId: parentId ?? undefined,
      },
    });

    if (children?.length) {
      await insertCategoryTree(tx, children, category.id);
    }
  }
}

main();
