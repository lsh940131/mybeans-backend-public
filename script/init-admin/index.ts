/**
 * 최초 사용자 = 어드민 유저 생성
 * npm run script init-admin
 */
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

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

const SALTJAR = 'mpNvGKaL2Hq9F3Xd';

/* main */
async function main() {
  try {
    const name = 'admin';
    const email = 'admin@mybeans.com';
    const pwd = 'qwer1234';

    const exist = await prisma.user.findFirst({
      select: { id: true },
      where: { email },
    });
    if (exist) {
      throw new Error(`이미 어드민 사용자가 있습니다: user.id = ${exist.id}`);
    }

    const user = await prisma.user.create({
      select: { id: true },
      data: { signupType: SignupTypeEnum.EMAIL, name, email, pwd: createHash(pwd), isAdmin: true },
    });

    console.log(`✅ 어드민 사용자 생성 완료: user.id = ${user.id}`);
  } catch (e) {
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

enum SignupTypeEnum {
  EMAIL = 'A', // 이메일 인증
  NAVER = 'B', // 네이버 간편
  KAKAO = 'C', // 카카오 간편
  GOOGLE = 'D', // 구글 간편
}

/**
 * 단방향 암호화
 * @param {string} originText 암호화할 문자열
 * @returns 암호된 문자 hex
 */
function createHash(originText: string): string {
  if (typeof originText !== 'string' || originText.length < 1) {
    throw new Error(
      `To dev) 의도되지 않은 값이 들어왔습니다. value: ${originText}, length: ${originText.length}, type: ${typeof originText}`,
    );
  }

  const salt = crypto.randomBytes(64).toString('base64');
  const encrypt = crypto.createHash('sha512').update(`${originText}${salt}`).digest('base64');
  const hashPwd = `${encrypt}${SALTJAR}${salt}`;

  return hashPwd;
}

main();
