/**
 * 최초 카테고리 옵션(category_option)과 옵션 값(category_option_value) 세팅
 * category_option, category_option_value 테이블에 데이터가 없어야하며, id가 AI 이므로 초기화 해놓을 것
 */
import { PrismaClient } from '@prisma/client';
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

interface ICategoryOptionValue {
  value_kr: string;
  value_en: string;
}

interface ICategoryOption {
  name_kr: string;
  name_en: string;
  value: ICategoryOptionValue[];
}

interface ICategory {
  categoryNamekr: string;
  option: ICategoryOption[];
}

/* main */
async function main() {
  try {
    const categoryOptionCount = await prisma.categoryOption.count();
    const categoryOptionValueCount = await prisma.categoryOptionValue.count();
    if (categoryOptionCount > 0 || categoryOptionValueCount > 0) {
      console.error(
        '❌ category_option 또는 category_option_value 테이블이 비어있지 않습니다. 초기화 후 실행하세요.',
      );
      return;
    }

    const categoryList = await prisma.category.findMany({
      select: { id: true, nameKr: true },
      where: { deletedAt: null },
    });
    const categoryMap = new Map<string, number>(); // nameKr: id
    categoryList.forEach((v) => categoryMap.set(v.nameKr, v.id));

    const filePath = path.join(__dirname, 'category_option.json');
    const jsonData: ICategory[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const categoryNameKrList = jsonData.map((v) => v.categoryNamekr);
    for (const categoryNameKr of categoryNameKrList) {
      if (!categoryMap.get(categoryNameKr)) {
        console.error(
          '❌ category_option.json에 유효하지 않은 categoryNameKr이 있습니다. category 테이블에 있는 name_kr을 입력하세요.',
        );
        return;
      }
    }

    await prisma.$transaction(async (tx) => {
      let categoryOptionSortOrder = 1; // 카테고리 옵션 넘버링. 카테고리에 관계 없이 넘버링 (하위 카테고리가 상위 카테고리의 옵션을 선택할 수 있기 때문)
      let categoryOptionValueSortOrder = 1; // 카테고리 옵션 값 넘버링. 카테고리 옵션 별로 넘버링
      for (const category of jsonData) {
        const categoryId = categoryMap.get(category.categoryNamekr);

        for (const option of category.option) {
          const createdOption = await tx.categoryOption.create({
            data: {
              categoryId: categoryId,
              nameKr: option.name_kr,
              nameEn: option.name_en,
              sortOrder: categoryOptionSortOrder++,
            },
          });

          for (const value of option.value) {
            await tx.categoryOptionValue.create({
              data: {
                categoryOptionId: createdOption.id,
                valueKr: value.value_kr,
                valueEn: value.value_en,
                sortOrder: categoryOptionValueSortOrder++,
              },
            });
          }
          categoryOptionValueSortOrder = 1;
        }
      }
    });

    console.log('✅ category_option 및 category_option_value 데이터 삽입 완료');
  } catch (e) {
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

main();
