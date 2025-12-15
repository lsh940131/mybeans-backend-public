import { Prisma, PrismaClient } from '@prisma/client';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import { Transport } from '@elastic/transport';
import { readFileSync } from 'fs';
import { join } from 'path';

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

/* es client */
const esClient = new ElasticsearchClient({
  node: 'http://localhost:9200',
  Transport: class extends Transport {
    // 현재 es 와 버전 호환 이슈가 있어서 버전 8로 명시
    constructor(opts: any) {
      super({
        ...opts,
        headers: {
          accept: 'application/vnd.elasticsearch+json; compatible-with=8',
          'content-type': 'application/vnd.elasticsearch+json; compatible-with=8',
        },
      });
    }
  },
});

async function main() {
  const indexName = 'mybeans_products';

  try {
    /* 1. mapping.json 읽기 */
    const mappingFilePath = join(__dirname, './mapping.json');
    const { settings, mappings } = JSON.parse(readFileSync(mappingFilePath, 'utf-8'));

    console.log('📌 Loaded mapping.json');

    /* 2. 기존 인덱스 삭제 */
    const exists = await esClient.indices.exists({ index: indexName });
    if (exists) {
      console.log(`⚠️ Index already exists → deleting: ${indexName}`);
      await esClient.indices.delete({ index: indexName });
    }

    /* 3. 정적 매핑 기반 인덱스 생성 */
    await esClient.indices.create({
      index: indexName,
      settings,
      mappings,
    });

    console.log(`✅ Created index with mapping: ${indexName}`);

    /* 4. MySQL 조회 */
    const data = await prisma.$queryRaw<any[]>(Prisma.sql`
      select
        p.id as productId,
        p.name_kr as productNameKr,
        p.name_en as productNameEn,
        
        c.id as categoryId,
        c.parent_id as categoryParentId,
        c.name_kr as categoryNameKr,
        c.name_en as categoryNameEn,
        
        s.id as sellerId,
        s.name as sellerName,

        pcp.is_single as isSingle,
        pcp.is_blend as isBlend,
        pcp.is_specialty as isSpecialty,
        pcp.is_decaf as isDecaf,
        pcp.value as profile
      from
        product p
        join category c on c.id = p.category_id
        join seller s on s.id = p.seller_id
        join product_coffee_profile pcp on pcp.product_id = p.id
      where
        p.deleted_at is null and
        s.deleted_at is null
    `);

    console.log(`📌 Loaded products: ${data.length}`);

    /* 5. bulk insert */
    const bulkBody = data.flatMap((doc) => [
      { index: { _index: indexName, _id: doc.productId } },
      preprocess(doc),
    ]);

    const bulkResult = await esClient.bulk({ refresh: true, body: bulkBody });

    if (bulkResult.errors) {
      console.error('❌ Bulk insert had errors');
    } else {
      console.log('🎉 Bulk insert completed successfully!');
    }
  } catch (e) {
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 자료형 변경
 *  - mysql에서 boolean 대신 사용하는 int형들을 boolean으로
 *  - int 자료형을 es에서 bigint로 인식하고, 받지 못하는 이슈가 있으므로 Number로 감싸줌
 * key를 camelcase로 변경
 * @param obj
 * @returns obj
 */
function preprocess(obj: any): any {
  const BOOLEAN_FIELDS = ['isSingle', 'isBlend', 'isSpecialty', 'isDecaf'];

  const toCamelCase = (str: string): string =>
    str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

  if (typeof obj === 'bigint') {
    return Number(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(preprocess);
  }

  if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      const newKey = toCamelCase(key);
      let value = preprocess(obj[key]);

      if (BOOLEAN_FIELDS.includes(newKey)) {
        value = Boolean(value);
      }

      newObj[newKey] = value;
    }
    return newObj;
  }

  return obj;
}

main();
