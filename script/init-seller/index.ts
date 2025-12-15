/**
 * 최초 판매자 세팅
 *
 * sellers 폴더 구조
 * ./sellers/{판매자}/info.json - 사용자 및 판매자 등록용 데이터
 * ./sellers/{판매자}/regist_state.pdf - 공정거래위원회 등록현황
 * ./sellers/{판매자}/products.json - 상품정보
 * ./sellers/{판매자}/products_images/{상품명}_{numbering}.jpg|jpeg|png*
 */
import { PrismaClient, Prisma } from '@prisma/client';
import { promises as fsp } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import { RegisterByEmailDto } from 'src/domain/user/dto/user.dto';
import { ApplyTempDto } from 'src/domain/seller/application/dto/seller-appl.dto';
import { Storage } from './storage';
import { SPCreateManipCreationDto } from 'src/domain/seller/product/dto/seller-product.dto';

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

/* 판매자 자격신청 승인처리를 위한 관리자 아이디 */
const adminUserId = 1;
const now = new Date();
const storage = new Storage();

interface IProduct {
  categoryId: number;
  nameKr: string;
  nameEn: string;
  thumbnailUrl: string;
  price: number;
  shippingFee: number;
  optionList: {
    categoryOptionId: number;
    categoryOptionValueList: {
      categoryOptionValueId: number;
      extraCharge: number;
    }[];
  }[];
  imageList: string[];
  isSingle: boolean;
  isBlend: boolean;
  isSpecialty: boolean;
  isDecaf: boolean;
  profile: any;
}

/* main */
async function main() {
  try {
    await storage.ensureBucket();

    const sellersPath = path.join(__dirname, 'sellers');
    const sellers = await fsp.readdir(sellersPath, { withFileTypes: true });

    for (const seller of sellers) {
      if (!seller.isDirectory()) continue;

      const sellerName = seller.name;
      const pwd = path.join(sellersPath, sellerName);

      console.log(`[${sellerName}] 시작`);

      // info.json 읽기
      const infoPath = path.join(pwd, 'info.json');
      const infoRaw = await fsp.readFile(infoPath, 'utf-8');
      const info = JSON.parse(infoRaw);

      // 이미 등록된 판매자라면 넘김
      const user = await prisma.user.findFirst({
        select: {
          id: true,
        },
        where: {
          email: info.user.email,
          name: info.user.name,
        },
      });
      if (user) {
        console.log(`[${seller.name}] 이미 등록된 판매자이므로 스킵`);
        continue;
      }

      // products.json 읽기
      const productsPath = path.join(pwd, 'products.json');
      const productsRaw = await fsp.readFile(productsPath, 'utf-8');
      const products: IProduct[] = JSON.parse(productsRaw);
      console.log(`[${sellerName}] 총 ${products.length}개 상품`);

      let userId: number;
      try {
        /**
         * 1. 사용자 등록 user
         * 2. 판매자 등록신청 seller_application
         * 3. 판매자 등록 seller
         * 4. 상품등록요청 생성 product_manipulate
         *    - 이미지는 storageService로 등록처리
         * 5. 상품등록요청 승인 evaluateManip
         */
        await prisma.$transaction(async (tx) => {
          // 사용자 등록
          const createUserParam = {
            email: info.user.email,
            name: info.user.name,
            pwd: info.user.pwd,
          };
          userId = await createUser(tx, createUserParam);

          // 판매자 자격신청 생성
          const registFileName = 'regist_state.pdf';
          const registStatePath = path.join(pwd, registFileName);
          const registStateUrl = await storage.upload(
            registStatePath,
            `user/${userId}/seller-application/${registFileName}`,
          );
          const sellerId = await createSellerAppl(tx, userId, {
            ...info.seller,
            ownerBirth: now,
            uploadFileList: [registStateUrl],
          });

          // 판매자 이미지 업데이트
          const logoPath = path.join(pwd, 'logo.png');
          const logo = await storage.upload(
            logoPath,
            `seller/${sellerId}/image/${storage.generateKey('logo.png')}`,
          );
          await tx.seller.update({
            data: {
              image: logo,
            },
            where: {
              id: sellerId,
            },
          });

          // 상품 등록
          for (const product of products) {
            const {
              categoryId,
              nameKr,
              nameEn,
              thumbnailUrl,
              price,
              shippingFee,
              optionList,
              imageList,
              isSingle,
              isBlend,
              isSpecialty,
              isDecaf,
              profile,
            } = product;

            const param = {
              categoryId,
              nameKr,
              nameEn,
              thumbnailUrl: null, // s3|minio 업로드 후 링크 할당
              price,
              shippingFee,
              optionList,
              imageList: [], // s3|minio 업로드 후 링크 할당
            };

            const thumbnailPath = path.join(pwd, `products_images/${thumbnailUrl}`);
            param.thumbnailUrl = await storage.upload(
              thumbnailPath,
              `seller/${sellerId}/products/${storage.generateKey(thumbnailUrl)}`,
            );

            for (const image of imageList) {
              const productImagePath = path.join(pwd, `products_images/${image}`);
              const productImageUrl = await storage.upload(
                productImagePath,
                `seller/${sellerId}/products/${storage.generateKey(thumbnailUrl)}`,
              );
              param.imageList.push(productImageUrl);
            }

            // 상품생성요청 생성 및 상품등록처리
            const productId = await createManipCreation(tx, sellerId, param);

            // 프로필 생성
            if (profile) {
              await createProfile(tx, productId, {
                isSingle,
                isBlend,
                isSpecialty,
                isDecaf,
                profile,
              });
            }
          }
        });

        console.log(`[${sellerName}] 완료`);
      } catch (e) {
        // tx는 rollback 되지만, 파일은 남기 때문에 삭제처리
        await storage.deleteS3Folder(`user/${userId}`);

        throw e;
      }
    }

    console.log('✅ 판매자 및 상품 초기화 완료');
  } catch (e) {
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 사용자 생성
 * @returns user.id
 */
async function createUser(tx: Prisma.TransactionClient, data: RegisterByEmailDto): Promise<number> {
  enum SignupTypeEnum {
    EMAIL = 'A', // 이메일 인증
    NAVER = 'B', // 네이버 간편
    CACAO = 'C', // 카카오 간편
    GOOGLE = 'D', // 구글 간편
  }

  const { name, email, pwd } = data;
  const hashPwd = createHash(pwd);

  const user = await tx.user.create({
    select: { id: true },
    data: { signupType: SignupTypeEnum.EMAIL, name, email, pwd: hashPwd },
  });

  return user.id;

  function createHash(originText: string): string {
    const saltJar = 'mpNvGKaL2Hq9F3Xd';
    const salt = crypto.randomBytes(64).toString('base64');
    const encrypt = crypto.createHash('sha512').update(`${originText}${salt}`).digest('base64');
    const hashPwd = `${encrypt}${saltJar}${salt}`;

    return hashPwd;
  }
}

/**
 * 판매자 자격신청 (승인된 상태로) 생성
 * 판매자 생성
 * @returns 판매자 아이디
 */
async function createSellerAppl(
  tx: Prisma.TransactionClient,
  userId: number,
  data: ApplyTempDto & { name: string },
): Promise<number> {
  enum SellerApplStatusEnum {
    TEMP = 'A', // 임시저장
    SUBMIT = 'B', // 제출완료
    REVISE = 'C', // 수정요청
    APPROVAL = 'D', // 승인
    REJECT = 'E', // 거절
  }

  const params = {
    userId: userId,
    status: SellerApplStatusEnum.APPROVAL,
    step: undefined,
    businessNumber: undefined,
    storeName: undefined,
    businessType: undefined,
    businessAddress: undefined,
    businessCategory: undefined,
    businessItem: undefined,
    mailOrderSalesNumber: undefined,
    ownerType: undefined,
    ownerName: undefined,
    ownerBirth: undefined,
    ownerGender: undefined,
    ownerNationality: undefined,
    ownerPhone: undefined,
    ownerAddress: undefined,
    ownerEmail: undefined,
    ownerBankCode: undefined,
    ownerAccount: undefined,
    ownerJob: undefined,
    shippingName: undefined,
    shippingAddress: undefined,
    shippingPhone1: undefined,
    shippingPhone2: undefined,
    returnName: undefined,
    returnAddress: undefined,
    returnPhone1: undefined,
    returnPhone2: undefined,
    bankCode: undefined,
    accountHolder: undefined,
    accountNumber: undefined,
    contactName: undefined,
    contactPhone: undefined,
    contactEmail: undefined,
  };
  for (const key in params) {
    params[key] = data[key] !== undefined ? data[key] : params[key];
  }

  // 판매자 자격신청 (승인된 상태로) 생성
  const sa = await tx.sellerApplication.create({
    select: { id: true },
    data: { ...params, evaluatorId: adminUserId, evaluatedAt: now },
  });

  // 판매자 자격신청 파일(등록상태) 생성
  const { uploadFileList } = data;
  if (uploadFileList?.length) {
    await tx.sellerApplicationFile.createMany({
      data: uploadFileList.map((v) => ({
        sellerApplicationId: sa.id,
        url: v,
      })),
    });
  }

  // 사용자 정보 업데이트
  await tx.user.update({
    data: { isSeller: true },
    where: { id: userId },
  });

  // 판매자 생성
  const seller = await tx.seller.create({
    select: {
      id: true,
    },
    data: {
      sellerApplicationId: sa.id,
      userId: userId,
      name: data.name,
    },
  });

  return seller.id;
}

/**
 * 상품등록요청 생성
 * 승인처리
 */
async function createManipCreation(
  tx: Prisma.TransactionClient,
  sellerId: number,
  data: SPCreateManipCreationDto,
): Promise<number> {
  enum SPProductStatusEnum {
    ON = 'A', // 판매중
    OFF = 'B', // 판매중단
  }

  enum SPManipActionEnum {
    CREATE = 'C',
    UPDATE = 'U',
    DELETE = 'D',
  }

  enum SPManipStatusEnum {
    TEMP = 'A', // 임시저장
    SUBMIT = 'B', // 제출완료
    REVISE = 'C', // 수정요청
    APPROVAL = 'D', // 승인
    REJECT = 'E', // 거절
  }

  const { categoryId, nameKr, nameEn, thumbnailUrl, price, optionList, imageList } = data;

  const value = {
    status: SPProductStatusEnum.ON,
    nameKr: nameKr,
    nameEn: nameEn,
    thumbnailUrl: thumbnailUrl,
    price: price,
    optionList: optionList,
    imageList,
  };

  // 상품생성요청 생성
  await tx.productManipulation.create({
    data: {
      action: SPManipActionEnum.CREATE,
      status: SPManipStatusEnum.APPROVAL,
      sellerId: sellerId,
      categoryId: categoryId,
      value: value as any,
      evaluatorId: adminUserId,
      evaluatedAt: now,
    },
  });

  // 상품 생성
  const product = await tx.product.create({
    select: { id: true },
    data: {
      categoryId,
      sellerId,
      status: SPProductStatusEnum.ON,
      nameKr,
      nameEn,
      thumbnailUrl,
      price,
      shippingFee: 0,
    },
  });

  // 상품 옵션 및 옵션 값 생성
  if (optionList?.length) {
    for (const option of optionList) {
      const o = await tx.productOption.create({
        select: {
          id: true,
        },
        data: {
          productId: product.id,
          categoryOptionId: option.categoryOptionId,
        },
      });

      for (const value of option.categoryOptionValueList) {
        await tx.productOptionValue.create({
          data: {
            productOptionId: o.id,
            categoryOptionValueId: value.categoryOptionValueId,
            extraCharge: value.extraCharge,
          },
        });
      }
    }
  }

  // 상품 이미지 생성
  if (imageList?.length) {
    for (let i = 0, len = imageList.length; i < len; i++) {
      await tx.productImage.create({
        data: {
          productId: product.id,
          url: imageList[i],
          sortOrder: i + 1,
        },
      });
    }
  }

  return product.id;
}

async function createProfile(
  tx: Prisma.TransactionClient,
  productId: number,
  data: {
    isSingle: boolean;
    isBlend: boolean;
    isSpecialty: boolean;
    isDecaf: boolean;
    profile: any;
  },
) {
  const { isSingle, isBlend, isSpecialty, isDecaf, profile } = data;

  await tx.productCoffeeProfile.create({
    data: {
      productId,
      isSingle,
      isBlend,
      isSpecialty,
      isDecaf,
      value: profile,
    },
  });
}

main();
