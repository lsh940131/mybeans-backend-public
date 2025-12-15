import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ElasticService } from '../../elastic/elastic.service';
import {
  PDeleteSearchHistoryDto,
  PGetDto,
  PListDto,
  PMergeGuestToMemberSearchHistory,
} from './dto/product.dto';
import {
  ProductGetPayload,
  ProductGetSearchKeywordPayload,
  ProductListItemPayload,
  ProductListPayload,
} from './payload/product.payload';
import { IAuth } from '../../auth/interface/auth.interface';
import { Prisma } from '@prisma/client';
import { IProductOptionValueSql } from './interface/product.interface';
import { convertStartDate } from 'src/common';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly elasticService: ElasticService,
  ) {}

  /**
   * 상품 목록 조회
   *
   * TODO:
   *  - es 쿼리를 이용해 매칭률에 따른  적용해서 회원일 경우 es 쿼리를 이용해 연관성 모델의 매칭률 순으로 정렬 및 매칭률 보여주기
   *  - es와 db 간의 싱크가 맞지 않을 경우 slack 등으로 noti 보내기
   */
  async list(auth: IAuth | null, data: PListDto): Promise<ProductListPayload> {
    try {
      const {
        offset,
        length,
        keyword,
        categoryIdList,
        sellerIdList,
        isSingle,
        isBlend,
        isSpecialty,
        isDecaf,
      } = data;

      // es 검색
      const searchResponse = await this.elasticService.search({
        offset,
        length,
        keyword,
        categoryIdList,
        sellerIdList,
        isSingle,
        isBlend,
        isSpecialty,
        isDecaf,
      });
      // es 검색 결과
      const searchedTotalCount = searchResponse.count;
      const searchedProductIdList = searchResponse.list.map((v) => v.productId);

      // es 검색 결과 productId로 db조회
      const list = await this.prismaService.product.findMany({
        select: {
          id: true,
          status: true,
          nameKr: true,
          nameEn: true,
          thumbnailUrl: true,
          price: true,
          productCoffeeProfile: {
            select: {
              isSingle: true,
              isBlend: true,
              isSpecialty: true,
              isDecaf: true,
            },
          },
          category: {
            select: {
              id: true,
              parentId: true,
              nameKr: true,
              nameEn: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        where: {
          id: {
            in: searchedProductIdList,
          },
          deletedAt: null,
          category: {
            deletedAt: null,
          },
          seller: {
            deletedAt: null,
          },
        },
      });

      // TODO: slack 등으로 noti 보내기
      if (searchedProductIdList.length !== list.length) {
        console.log('db와 es의 상품 싱크가 맞지 않습니다.');
      }

      this.#createSearchHistory(auth, data);

      return new ProductListPayload(
        searchedTotalCount,
        list.map((v) => new ProductListItemPayload(v)),
      );
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품 상세 조회
   */
  async get(auth: IAuth | null, data: PGetDto): Promise<ProductGetPayload> {
    try {
      const { id } = data;

      // 상품 기본 조회
      const product = await this.prismaService.product.findUnique({
        select: {
          id: true,
          status: true,
          nameKr: true,
          nameEn: true,
          thumbnailUrl: true,
          price: true,
          category: {
            select: {
              id: true,
              parentId: true,
              nameKr: true,
              nameEn: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
          productImage: {
            select: {
              id: true,
              url: true,
            },
            where: {
              deletedAt: null,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        where: {
          id: id,
          deletedAt: null,
          category: {
            deletedAt: null,
          },
          seller: {
            deletedAt: null,
          },
        },
      });

      // 상품 옵션, 옵션 값 조회
      const optionValueList = await this.prismaService.$queryRaw<
        IProductOptionValueSql[]
      >(Prisma.sql`
        select
          po.id as optionId,
          po.is_required as isRequired,
          co.name_kr as nameKr,
          co.name_en as nameEn,
          pov.id as optionValueId,
          pov.extra_charge as extraCharge,
          cov.value_kr as valueKr,
          cov.value_en as valueEn
        from
          product_option po
          join category_option co on co.id = po.category_option_id
          join product_option_value pov on pov.product_option_id = po.id
          join category_option_value cov on cov.id = pov.category_option_value_id
        where
          po.product_id = ${product.id} and
          po.deleted_at is null and
          co.deleted_at is null and
          pov.deleted_at is null and
          cov.deleted_at is null
        order by
          co.sort_order asc, cov.sort_order asc
      `);

      // flat한 쿼리 결과를 option 별로 value를 묶는 작업
      const optionMap = new Map<number, any>();
      for (const o of optionValueList) {
        const {
          optionId,
          isRequired,
          nameKr,
          nameEn,
          optionValueId,
          extraCharge,
          valueKr,
          valueEn,
        } = o;

        if (!optionMap.has(optionId)) {
          optionMap.set(optionId, {
            id: optionId,
            isRequired: Boolean(isRequired),
            nameKr,
            nameEn,
            valueList: [],
          });
        }

        optionMap.get(optionId).valueList.push({
          id: optionValueId,
          extraCharge,
          valueKr,
          valueEn,
        });
      }

      return new ProductGetPayload(product, Array.from(optionMap.values()));
    } catch (e) {
      throw e;
    }
  }

  /**
   * 사용자가 수행한 상품 검색 조건을 product_search_history 테이블에 비동기로 적재한다.
   *
   * - keyword, categoryIdList, sellerIdList 중 하나라도 값이 있을 때만 insert
   * - 회원: auth에서 userId를 추출해서 저장 (동일 조건 row 존재 시 createdAt 갱신, 없으면 create)
   * - 비회원: userId는 null 로 저장 (무조건 새로운 row create)
   * - categoryIdList / sellerIdList 는 "1,2,3" 형태의 문자열로 join하여 저장
   * - 에러가 발생하더라도 API 응답에는 영향을 주지 않고 조용히 무시한다.
   */
  async #createSearchHistory(auth: IAuth | null, dto: PListDto): Promise<void> {
    try {
      const { keyword, categoryIdList, sellerIdList } = dto;

      const normalizedKeyword = keyword?.trim();
      const hasKeyword = !!normalizedKeyword;
      const hasCategoryIds = Array.isArray(categoryIdList) && categoryIdList.length > 0;
      const hasSellerIds = Array.isArray(sellerIdList) && sellerIdList.length > 0;

      // 세 값 모두 비어 있으면 기록하지 않음
      if (!hasKeyword && !hasCategoryIds && !hasSellerIds) {
        return;
      }

      const userId = auth ? auth.id : null;

      // DB에 저장될 실제 문자열 형태
      const categoryIdsValue = hasCategoryIds ? categoryIdList.join(',') : null;
      const sellerIdsValue = hasSellerIds ? sellerIdList.join(',') : null;

      const now = new Date();

      /**
       * userId === null (비회원)일 때는 무조건 create
       */
      if (!userId) {
        await this.prismaService.productSearchHistory.create({
          data: {
            userId: null,
            keyword: normalizedKeyword ?? null,
            categoryIds: categoryIdsValue,
            sellerIds: sellerIdsValue,
            createdAt: now,
          },
        });
        return;
      }

      /**
       * userId가 있는 경우에만 update 로직 수행
       */
      const existing = await this.prismaService.productSearchHistory.findFirst({
        select: { id: true },
        where: {
          userId,
          keyword: normalizedKeyword ?? null,
          categoryIds: categoryIdsValue,
          sellerIds: sellerIdsValue,
          deletedAt: null,
        },
      });

      if (existing) {
        // 동일 조건 row가 있을 때는 createdAt만 갱신
        await this.prismaService.productSearchHistory.update({
          where: { id: existing.id },
          data: { createdAt: now },
        });
        return;
      }

      // 동일 조건 row가 없으면 새로 create
      await this.prismaService.productSearchHistory.create({
        data: {
          userId,
          keyword: normalizedKeyword ?? null,
          categoryIds: categoryIdsValue,
          sellerIds: sellerIdsValue,
          createdAt: now,
        },
      });
    } catch (e) {
      // API 응답에 영향을 주지 않도록 조용히 무시
      // console.warn('[ProductService] Failed to create/update search history', e);
    }
  }

  /**
   * 최근 6개월 간 keyword로 검색한 기록 조회
   */
  async getSearchKeywordHistory(auth: IAuth): Promise<ProductGetSearchKeywordPayload[]> {
    try {
      const d = new Date();
      d.setMonth(d.getMonth() - 6);
      const sixMonthsAgo = convertStartDate(d);

      const history = await this.prismaService.productSearchHistory.findMany({
        select: {
          id: true,
          keyword: true,
          createdAt: true,
        },
        where: {
          userId: auth.id,
          deletedAt: null,
          keyword: { not: null },
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return history.map((v) => new ProductGetSearchKeywordPayload(v));
    } catch (e) {
      throw e;
    }
  }

  /**
   * 검색 기록 삭제
   */
  async deleteSearchHistory(auth: IAuth, data: PDeleteSearchHistoryDto) {
    try {
      const { idList } = data;

      await this.prismaService.productSearchHistory.updateMany({
        data: { deletedAt: new Date() },
        where: {
          id: { in: idList },
          userId: auth.id,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 모든 검색 기록 삭제
   */
  async clearSearchHistory(auth: IAuth): Promise<boolean> {
    try {
      await this.prismaService.productSearchHistory.updateMany({
        data: { deletedAt: new Date() },
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
   * guest 사용자가 로그인함으로써 sessionStorage에 저장된 상품 검색 기록 리스트 병합
   */
  async mergeGuestToMemberSearchHistory(
    auth: IAuth,
    data: PMergeGuestToMemberSearchHistory,
  ): Promise<boolean> {
    try {
      const { items } = data;

      if (!items || items.length === 0) {
        return true;
      }

      const history = await this.prismaService.productSearchHistory.findMany({
        select: {
          id: true,
          keyword: true,
          createdAt: true,
        },
        where: {
          userId: auth.id,
          deletedAt: null,
          keyword: { not: null },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // keyword 기준으로 기존 히스토리 빠르게 찾기 위한 Map
      const historyMap = new Map<string, { id: number; createdAt: Date }>();
      for (const h of history) {
        if (!historyMap.has(h.keyword)) {
          historyMap.set(h.keyword, { id: h.id, createdAt: h.createdAt });
        }
      }

      // create / update 준비
      const createParams: Prisma.ProductSearchHistoryCreateArgs[] = [];
      const updateParams: Prisma.ProductSearchHistoryUpdateArgs[] = [];

      const now = new Date();
      for (const item of items) {
        const existing = historyMap.get(item.keyword);

        if (existing) {
          // update 조건: incoming createdAt이 더 최신일 때만
          if (item.createdAt.getTime() > existing.createdAt.getTime()) {
            updateParams.push({
              where: { id: existing.id },
              data: { createdAt: item.createdAt },
            });
          }
        } else {
          // 새 히스토리 생성
          createParams.push({
            data: {
              userId: auth.id,
              keyword: item.keyword,
              categoryIds: null,
              sellerIds: null,
              createdAt: now,
            },
          });
        }
      }

      // 실행할 작업이 없는 경우
      if (createParams.length === 0 && updateParams.length === 0) {
        return true;
      }

      await this.prismaService.$transaction(async (tx) => {
        for (const p of updateParams) {
          await tx.productSearchHistory.update(p);
        }
        for (const p of createParams) {
          await tx.productSearchHistory.create(p);
        }
      });

      return true;
    } catch (e) {
      throw e;
    }
  }
}
