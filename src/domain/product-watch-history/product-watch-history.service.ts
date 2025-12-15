import { Injectable } from '@nestjs/common';
import { IAuth } from '../../auth/interface/auth.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { PwhCreateDto, PwhDeleteDto, PwhMergeDto } from './dto/product-watch-history.dto';
import {
  PwhListPayload,
  PwhCreatedPayload,
  PwhListItemPayload,
} from './payload/product-watch-history.payload';
import { ErrorPayload } from '../..//common/payload/error.payload';

@Injectable()
export class ProductWatchHistoryService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 구경 한 상품 목록 조회
   * 최대 50개 제한
   */
  async list(auth: IAuth): Promise<PwhListPayload> {
    try {
      const list = await this.prismaService.productWatchHistory.findMany({
        select: {
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              nameKr: true,
              nameEn: true,
              thumbnailUrl: true,
            },
          },
        },
        where: {
          userId: auth.id,
          deletedAt: null,
          product: {
            deletedAt: null,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });

      const count = list?.length ?? 0;

      return new PwhListPayload(
        count,
        list.map((v) => new PwhListItemPayload(v)),
      );
    } catch (e) {
      throw e;
    }
  }

  /**
   * 구경한 상품 기록 저장
   * 이전에 구경했던 상품이라면 생성시간 업데이트
   */
  async create(auth: IAuth, data: PwhCreateDto): Promise<PwhCreatedPayload> {
    try {
      const { productId } = data;

      const product = await this.prismaService.product.findUnique({
        where: {
          id: productId,
          deletedAt: null,
        },
      });
      if (!product) {
        throw new ErrorPayload('유효하지 않은 상품입니다.');
      }

      const exist = await this.prismaService.productWatchHistory.findFirst({
        select: { id: true },
        where: {
          userId: auth.id,
          productId,
          deletedAt: null,
        },
      });

      let pwhId: number;
      // 이미 구경했던 상품이라면 생성시간 업데이트
      if (exist) {
        await this.prismaService.productWatchHistory.update({
          data: {
            createdAt: new Date(),
          },
          where: {
            id: exist.id,
          },
        });

        pwhId = exist.id;
      }
      // 처음 구경한 상품이면 데이터 생성
      else {
        const created = await this.prismaService.productWatchHistory.create({
          select: {
            id: true,
          },
          data: {
            userId: auth.id,
            productId,
          },
        });

        pwhId = created.id;
      }

      return new PwhCreatedPayload({ id: pwhId });
    } catch (e) {
      throw e;
    }
  }

  /**
   * 구경 한 상품 기록 삭제
   */
  async delete(auth: IAuth, data: PwhDeleteDto): Promise<boolean> {
    try {
      const { productId } = data;

      await this.prismaService.productWatchHistory.updateMany({
        data: {
          deletedAt: new Date(),
        },
        where: {
          userId: auth.id,
          productId,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 구경한 모든 상품 기록 삭제
   */
  async clear(auth: IAuth): Promise<boolean> {
    try {
      await this.prismaService.productWatchHistory.updateMany({
        data: {
          deletedAt: new Date(),
        },
        where: {
          userId: auth.id,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * guest 사용자가 로그인함으로써 sessionStorage에 저장된 구경 상품 리스트 병합
   * - 기존에 구경했던 상품이면 createdAt 업데이트 (새로 들어온 값이 기존 값보다 커야함)
   */
  async mergeGuestToMember(auth: IAuth, data: PwhMergeDto): Promise<boolean> {
    try {
      const { list } = data;

      if (list.length < 1) return true;

      // 같은 productId가 여러 번 올 수 있으니 "가장 최신 createdAt"로 map 생성
      const map = new Map<number, Date>();
      for (const { productId, createdAt } of list) {
        const prev = map.get(productId);
        if (!prev || createdAt > prev) {
          map.set(productId, createdAt);
        }
      }

      // 유효한 상품으로 필터
      const products = await this.prismaService.product.findMany({
        where: {
          id: {
            in: list.map((v) => v.productId),
          },
          deletedAt: null,
        },
      });
      const productIdList = products.map((v) => v.id);

      // 이미 구경했던 상품이라면 신규 구경일시가 기존 구경일시보다 클 경우 업데이트
      const existList = await this.prismaService.productWatchHistory.findMany({
        select: {
          product: {
            select: {
              id: true,
            },
          },
          createdAt: true,
        },
        where: {
          userId: auth.id,
          productId: {
            in: productIdList,
          },
          deletedAt: null,
        },
      });
      const existMap = new Map<number, Date>();
      for (const exist of existList) {
        existMap.set(exist.product.id, exist.createdAt);
      }

      const createParams: { productId: number }[] = [];
      const updateParams: { productId: number; createdAt: Date }[] = [];
      for (const productId of productIdList) {
        const exist = existMap.get(productId);
        if (!exist) {
          createParams.push({ productId });
        } else {
          const createdAt = map.get(productId);
          if (exist < createdAt) updateParams.push({ productId, createdAt });
        }
      }

      await this.prismaService.$transaction(async (tx) => {
        if (createParams.length) {
          await tx.productWatchHistory.createMany({
            data: createParams.map((v) => ({ userId: auth.id, productId: v.productId })),
          });
        }

        if (updateParams.length) {
          for (const param of updateParams) {
            await tx.productWatchHistory.updateMany({
              data: { createdAt: param.createdAt },
              where: {
                userId: auth.id,
                productId: param.productId,
                deletedAt: null,
              },
            });
          }
        }
      });

      return true;
    } catch (e) {
      throw e;
    }
  }
}
