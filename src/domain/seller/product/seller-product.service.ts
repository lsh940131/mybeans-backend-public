import { Injectable } from '@nestjs/common';
import { IAuth } from '../../../auth/interface/auth.interface';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  SPCancelSubmitDto,
  SPDeleteManipDto,
  SPCreateManipCreationDto,
  SPSubmitRequestDto,
  SPUpdateManipCreationDto,
  SPGetManipDto,
  SPCreateManipUpdate,
  SPUpdateManipUpdateDto,
  SPListOfManipDto,
  PSCreateManipDeletionDto,
  PSListOfProductDto,
  PSGetProductDto,
} from './dto/seller-product.dto';
import {
  SPManipActionEnum,
  SPManipStatusEnum,
  SPProductStatusEnum,
} from './enum/seller-product.enum';
import {
  ISPCategory,
  ISPManipOption,
  ISPManip,
  ISPManipValue,
} from './interface/seller-product.interface';
import { CategoryService } from '../../../domain/category/category.service';
import {
  SPManipIdPayload,
  SPGetManipPayload,
  SPListOfManipItemPayload,
  SPListOfManipPayload,
  SPListOfProductPayload,
  SPListOfProductItemPayload,
  SPGetProductPayload,
} from './payload/seller-product.payload';
import { ErrorPayload } from '../../../common/payload/error.payload';
import { Prisma } from '@prisma/client';

@Injectable()
export class SellerProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly categoryService: CategoryService,
  ) {}

  /**
   * 카테고리와 옵션 리스트 유효성 체크
   * @returns 중복을 제거한 optionList
   */
  async #validateCategoryNOptionList(
    categoryId?: number,
    optionList?: ISPManipOption[],
  ): Promise<ISPManipOption[]> {
    try {
      let category: ISPCategory;
      let result: ISPManipOption[] = [];
      if (categoryId) {
        category = await this.categoryService.get({ id: categoryId });
        if (!category) {
          throw new ErrorPayload('유효하지 않은 카테고리입니다.');
        }
      }

      if (!category && optionList?.length) {
        throw new ErrorPayload('유효하지 않은 카테고리입니다.');
      }

      if (category && optionList?.length) {
        // 카테고리의 옵션 맵 {categoryOptionId: [categoryOptionValueId]}
        const categoryOptionMap = category.optionList.reduce(
          (acc, cur) => {
            acc[cur.id] = cur.categoryOptionValue.map((v) => v.id);
            return acc;
          },
          {} as Record<number, number[]>,
        );

        const optionIdSet = new Set<number>();
        for (const option of optionList) {
          const { categoryOptionId, categoryOptionValueList } = option;

          if (optionIdSet.has(categoryOptionId)) continue;
          optionIdSet.add(categoryOptionId);

          const categoryOptionValueIdList = categoryOptionMap[categoryOptionId];
          if (!categoryOptionValueIdList) throw new ErrorPayload('유효하지 않은 옵션입니다');

          const optionValudIdSet = new Set<number>();
          const validOptionValueIdList = [];

          for (const value of categoryOptionValueList) {
            const id = value.categoryOptionValueId;
            if (optionValudIdSet.has(id)) continue;
            optionValudIdSet.add(id);

            if (!categoryOptionValueIdList.includes(id)) {
              throw new ErrorPayload('유효하지 않은 옵션 값 입니다.');
            }

            validOptionValueIdList.push(value);
          }

          if (validOptionValueIdList.length > 0) {
            result.push({
              categoryOptionId,
              categoryOptionValueList: validOptionValueIdList,
            });
          }
        }
      }

      return result;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품 조작 요청 목록 조회
   */
  async listOfManip(auth: IAuth, data: SPListOfManipDto): Promise<SPListOfManipPayload> {
    try {
      const { offset, length, keyword, actionList, statusList } = data;

      const findManyArgsWhere: Prisma.ProductManipulationWhereInput = {
        deletedAt: null,
        sellerId: auth.sellerId,
      };

      const findManyArgsWhereOr: Prisma.ProductManipulationWhereInput[] = [];
      const findManyArgsWhereAnd: Prisma.ProductManipulationWhereInput[] = [];

      if (keyword) {
        const escapedKeyword = this.prismaService.escape(keyword);
        findManyArgsWhereOr.push(
          {
            value: {
              path: '$.nameKr',
              string_contains: escapedKeyword,
              mode: 'insensitive',
            },
          },
          {
            value: {
              path: '$.nameEn',
              string_contains: escapedKeyword,
              mode: 'insensitive',
            },
          },
        );
      }

      if (actionList?.length) {
        findManyArgsWhereAnd.push({
          action: {
            in: actionList,
          },
        });
      }

      if (statusList?.length) {
        findManyArgsWhereAnd.push({
          status: {
            in: statusList,
          },
        });
      }

      if (findManyArgsWhereOr.length) findManyArgsWhere.OR = findManyArgsWhereOr;
      if (findManyArgsWhereAnd.length) findManyArgsWhere.AND = findManyArgsWhereAnd;

      const count = await this.prismaService.productManipulation.count({
        where: findManyArgsWhere,
      });
      const list = await this.prismaService.productManipulation.findMany({
        select: {
          id: true,
          action: true,
          status: true,
          category: {
            select: {
              id: true,
              nameKr: true,
              nameEn: true,
            },
          },
          value: true,
          submitedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        where: findManyArgsWhere,
        skip: offset,
        take: length,
      });

      return new SPListOfManipPayload(
        count,
        list.map((v) => new SPListOfManipItemPayload(v)),
      );
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품등록요청 생성
   */
  async createManipCreation(
    auth: IAuth,
    data: SPCreateManipCreationDto,
  ): Promise<SPManipIdPayload> {
    try {
      const { categoryId, nameKr, nameEn, thumbnailUrl, price, optionList, imageList } = data;

      const uniqueOptionList = await this.#validateCategoryNOptionList(categoryId, optionList);

      const value: ISPManipValue = {
        status: SPProductStatusEnum.ON,
        nameKr: nameKr ? nameKr : null,
        nameEn: nameEn ? nameEn : null,
        thumbnailUrl: thumbnailUrl ? thumbnailUrl : null,
        price: price ? price : 0,
        optionList: uniqueOptionList,
        imageList,
      };

      const manip = await this.prismaService.productManipulation.create({
        select: { id: true },
        data: {
          action: SPManipActionEnum.CREATE,
          status: SPManipStatusEnum.TEMP,
          sellerId: auth.sellerId,
          categoryId: categoryId,
          value: value as any,
        },
      });

      return new SPManipIdPayload(manip.id);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품등록요청 수정
   */
  async updateManipCreation(auth: IAuth, data: SPUpdateManipCreationDto): Promise<boolean> {
    try {
      const { manipId, categoryId, nameKr, nameEn, thumbnailUrl, price, optionList, imageList } =
        data;

      const manip = await this.prismaService.productManipulation.findUnique({
        select: {
          id: true,
          action: true,
          status: true,
          sellerId: true,
        },
        where: {
          id: manipId,
          deletedAt: null,
        },
      });

      if (!manip) {
        throw new ErrorPayload('유효하지 않은 요청입니다.');
      }

      if (manip.sellerId != auth.sellerId) {
        throw new ErrorPayload('권한이 없습니다.');
      }

      if (manip.action != SPManipActionEnum.CREATE) {
        throw new ErrorPayload('잘못된 요청입니다.');
      }

      if (
        ![SPManipStatusEnum.TEMP, SPManipStatusEnum.REVISE].includes(
          manip.status as SPManipStatusEnum,
        )
      ) {
        throw new ErrorPayload('수정할 수 없는 상태입니다.');
      }

      const uniqueOptionList = await this.#validateCategoryNOptionList(categoryId, optionList);

      const value: ISPManipValue = {
        status: SPProductStatusEnum.ON,
        nameKr: nameKr ? nameKr : null,
        nameEn: nameEn ? nameEn : null,
        thumbnailUrl: thumbnailUrl ? thumbnailUrl : null,
        price: price ? price : 0,
        optionList: uniqueOptionList,
        imageList: imageList?.length ? imageList : [],
      };

      await this.prismaService.productManipulation.update({
        data: {
          categoryId,
          value: value as any,
        },
        where: {
          id: manip.id,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품수정요청 생성
   */
  async createManipUpdate(auth: IAuth, data: SPCreateManipUpdate): Promise<SPManipIdPayload> {
    try {
      const {
        productId,
        status,
        nameKr,
        nameEn,
        thumbnailUrl,
        price,
        categoryId,
        optionList,
        imageList,
      } = data;

      const product = await this.prismaService.product.findUnique({
        select: {
          id: true,
          sellerId: true,
        },
        where: {
          id: productId,
          deletedAt: null,
        },
      });

      if (!product) {
        throw new ErrorPayload('유효하지 않은 상품입니다.');
      }

      if (product.sellerId != auth.sellerId) {
        throw new ErrorPayload('권한이 없습니다.');
      }

      const preManip = await this.prismaService.productManipulation.findFirst({
        select: {
          id: true,
        },
        where: {
          productId: productId,
          deletedAt: null,
          status: {
            notIn: [SPManipStatusEnum.APPROVAL, SPManipStatusEnum.REJECT],
          },
        },
        orderBy: {
          id: 'desc',
        },
      });
      if (preManip) {
        throw new ErrorPayload('이미 진행중인 요청이 있습니다.');
      }

      const uniqueOptionList = await this.#validateCategoryNOptionList(categoryId, optionList);

      const value: ISPManipValue = {
        status,
        nameKr,
        nameEn,
        thumbnailUrl,
        price,
        optionList: uniqueOptionList,
        imageList: imageList?.length ? imageList : [],
      };

      const manip = await this.prismaService.productManipulation.create({
        select: { id: true },
        data: {
          action: SPManipActionEnum.UPDATE,
          status: SPManipStatusEnum.TEMP,
          sellerId: auth.sellerId,
          categoryId,
          productId,
          value: value as any,
        },
      });

      return new SPManipIdPayload(manip.id);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품수정요청 수정
   */
  async updateManipUpdate(auth: IAuth, data: SPUpdateManipUpdateDto): Promise<boolean> {
    try {
      const {
        manipId,
        status,
        nameKr,
        nameEn,
        thumbnailUrl,
        price,
        categoryId,
        optionList,
        imageList,
      } = data;

      const manip = await this.prismaService.productManipulation.findUnique({
        select: {
          id: true,
          action: true,
          status: true,
          sellerId: true,
          productId: true,
        },
        where: {
          id: manipId,
          deletedAt: null,
        },
      });

      if (!manip) {
        throw new ErrorPayload('유효하지 않은 요청입니다.');
      }

      if (manip.sellerId != auth.sellerId) {
        throw new ErrorPayload('권한이 없습니다.');
      }

      if (manip.action != SPManipActionEnum.UPDATE) {
        throw new ErrorPayload('잘못된 요청입니다.');
      }

      if (
        ![SPManipStatusEnum.TEMP, SPManipStatusEnum.REVISE].includes(
          manip.status as SPManipStatusEnum,
        )
      ) {
        throw new ErrorPayload('수정할 수 없는 상태입니다.');
      }

      const product = await this.prismaService.product.findUnique({
        select: {
          id: true,
          sellerId: true,
        },
        where: {
          id: manip.productId,
          deletedAt: null,
        },
      });

      if (!product) {
        throw new ErrorPayload('유효하지 않은 상품입니다.');
      }

      if (product.sellerId != auth.sellerId) {
        throw new ErrorPayload('권한이 없습니다.');
      }

      const uniqueOptionList = await this.#validateCategoryNOptionList(categoryId, optionList);

      const value: ISPManipValue = {
        status,
        nameKr,
        nameEn,
        thumbnailUrl,
        price,
        optionList: uniqueOptionList,
        imageList: imageList?.length ? imageList : [],
      };

      await this.prismaService.productManipulation.update({
        data: {
          categoryId,
          value: value as any,
        },
        where: {
          id: manip.id,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품삭제요청 생성
   */
  async createManipDeletion(
    auth: IAuth,
    data: PSCreateManipDeletionDto,
  ): Promise<SPManipIdPayload> {
    try {
      const { productId } = data;

      const product = await this.prismaService.product.findUnique({
        select: {
          id: true,
          sellerId: true,
          categoryId: true,
        },
        where: {
          id: productId,
          deletedAt: null,
        },
      });

      if (!product) {
        throw new ErrorPayload('유효하지 않은 상품입니다.');
      }

      if (product.sellerId != auth.sellerId) {
        throw new ErrorPayload('권한이 없습니다.');
      }

      const preManip = await this.prismaService.productManipulation.findFirst({
        select: {
          id: true,
        },
        where: {
          productId: productId,
          deletedAt: null,
          status: {
            notIn: [SPManipStatusEnum.APPROVAL, SPManipStatusEnum.REJECT],
          },
        },
        orderBy: {
          id: 'desc',
        },
      });
      if (preManip) {
        throw new ErrorPayload('이미 진행중인 요청이 있습니다.');
      }

      const manip = await this.prismaService.productManipulation.create({
        select: { id: true },
        data: {
          action: SPManipActionEnum.DELETE,
          status: SPManipStatusEnum.TEMP,
          sellerId: auth.sellerId,
          categoryId: product.categoryId,
          productId: product.id,
        },
      });

      return new SPManipIdPayload(manip.id);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품 조작 요청 조회
   */
  async getManip(auth: IAuth, data: SPGetManipDto): Promise<SPGetManipPayload> {
    try {
      const { manipId } = data;

      const manip = await this.prismaService.productManipulation.findUnique({
        select: {
          id: true,
          action: true,
          status: true,
          sellerId: true,
          categoryId: true,
          productId: true,
          value: true,
          reviseReason: true,
          rejectReason: true,
          submitedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        where: {
          id: manipId,
          deletedAt: null,
        },
      });

      if (!manip) {
        throw new ErrorPayload('유효하지 않은 요청입니다.');
      }

      if (manip.sellerId != auth.sellerId) {
        throw new ErrorPayload('권한이 없습니다.');
      }

      return new SPGetManipPayload(manip);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 요청삭제
   */
  async deleteManip(auth: IAuth, data: SPDeleteManipDto): Promise<boolean> {
    try {
      const { manipId } = data;

      const manip = await this.prismaService.productManipulation.findUnique({
        select: { id: true, status: true },
        where: {
          id: manipId,
          sellerId: auth.sellerId,
          deletedAt: null,
        },
      });

      if (!manip) {
        return true;
      }

      if (
        [SPManipStatusEnum.TEMP, SPManipStatusEnum.REVISE].includes(
          manip.status as SPManipStatusEnum,
        )
      ) {
        throw new ErrorPayload('임시저장 또는 수정요청 상태에서만 삭제 가능합니다.');
      }

      await this.prismaService.productManipulation.update({
        data: { deletedAt: new Date() },
        where: { id: manip.id },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 요청제출
   */
  async submitManip(auth: IAuth, data: SPSubmitRequestDto): Promise<boolean> {
    try {
      const { manipId } = data;

      const manip = (await this.prismaService.productManipulation.findUnique({
        select: {
          id: true,
          action: true,
          status: true,
          sellerId: true,
          categoryId: true,
          productId: true,
          value: true,
        },
        where: {
          id: manipId,
          sellerId: auth.sellerId,
          deletedAt: null,
        },
      })) as any as ISPManip;

      if (!manip) {
        throw new ErrorPayload('유효하지 않은 요청입니다.');
      }

      if ((manip.status as SPManipStatusEnum) !== SPManipStatusEnum.TEMP) {
        throw new ErrorPayload('제출 할 수 없는 상태입니다.');
      }

      switch (manip.action) {
        case SPManipActionEnum.CREATE:
        case SPManipActionEnum.UPDATE:
          if (!manip.categoryId) {
            throw new ErrorPayload('카테고리를 선택해주세요.');
          }
          if (!manip.value.nameKr || !manip.value.nameEn) {
            throw new ErrorPayload('상품의 이름을 입력해주세요.');
          }
          if (!manip.value.thumbnailUrl) {
            throw new ErrorPayload('상품의 대표 이미지를 업로드 해주세요.');
          }
          if (typeof manip.value.price !== 'number') {
            throw new ErrorPayload('상품의 가격을 입력해주세요.');
          }
          if (!manip.value.imageList?.length) {
            throw new ErrorPayload('상품의 상세 페이지에서 보여줄 이미지를 업로드 해주세요.');
          }
          break;

        case SPManipActionEnum.DELETE:
          break;
      }

      await this.prismaService.productManipulation.update({
        data: {
          status: SPManipStatusEnum.SUBMIT,
          submitedAt: new Date(),
        },
        where: {
          id: manip.id,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }
  /**
   * 요청제출 취소
   */
  async cancelSubmitManip(auth: IAuth, data: SPCancelSubmitDto): Promise<boolean> {
    try {
      const { manipId } = data;

      const manip = await this.prismaService.productManipulation.findUnique({
        select: {
          id: true,
          status: true,
          submitedAt: true,
        },
        where: {
          id: manipId,
          sellerId: auth.sellerId,
          deletedAt: null,
        },
      });

      if (!manip) {
        throw new ErrorPayload('유효하지 않은 요청입니다.');
      }

      if (manip.status !== SPManipStatusEnum.SUBMIT) {
        throw new ErrorPayload('제출을 취소할 수 없는 상태입니다.');
      }

      const submitedAt = new Date(manip.submitedAt);
      const now = new Date();
      const diffInMs = now.getTime() - submitedAt.getTime();
      const diffInMinutes = diffInMs / (1000 * 60);
      if (diffInMinutes > 5) {
        throw new ErrorPayload('제출 후 5분 이내에만 취소가 가능합니다.');
      }

      await this.prismaService.productManipulation.update({
        data: {
          status: SPManipStatusEnum.TEMP,
          updatedAt: new Date(),
        },
        where: {
          id: manip.id,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품 목록 조회
   */
  async listOfProduct(auth: IAuth, data: PSListOfProductDto): Promise<SPListOfProductPayload> {
    try {
      const { offset, length, keyword, categoryIdList, statusList } = data;

      const findManyArgsWhere: Prisma.ProductWhereInput = {
        deletedAt: null,
        sellerId: auth.sellerId,
      };
      const findManyArgsWhereOr: Prisma.ProductWhereInput[] = [];
      const findManyArgsWhereAnd: Prisma.ProductWhereInput[] = [];

      if (keyword) {
        const escapedKeyword = this.prismaService.escape(keyword);

        findManyArgsWhereOr.push(
          {
            nameKr: {
              contains: escapedKeyword,
            },
          },
          {
            nameEn: {
              contains: escapedKeyword,
            },
          },
        );
      }

      if (categoryIdList?.length) {
        findManyArgsWhereAnd.push({
          categoryId: {
            in: categoryIdList,
          },
        });
      }

      if (statusList?.length) {
        findManyArgsWhereAnd.push({
          status: {
            in: statusList,
          },
        });
      }

      if (findManyArgsWhereOr.length) findManyArgsWhere.OR = findManyArgsWhereOr;
      if (findManyArgsWhereAnd.length) findManyArgsWhere.AND = findManyArgsWhereAnd;

      const count = await this.prismaService.product.count({ where: findManyArgsWhere });
      const list = await this.prismaService.product.findMany({
        select: {
          id: true,
          category: {
            select: {
              id: true,
              nameKr: true,
              nameEn: true,
            },
          },
          status: true,
          nameKr: true,
          nameEn: true,
          thumbnailUrl: true,
          createdAt: true,
        },
        where: findManyArgsWhere,
        skip: offset,
        take: length,
      });

      return new SPListOfProductPayload(
        count,
        list.map((v) => new SPListOfProductItemPayload(v)),
      );
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품 조회
   */
  async getProduct(auth: IAuth, data: PSGetProductDto): Promise<SPGetProductPayload> {
    try {
      const { productId } = data;

      const product = await this.prismaService.product.findUnique({
        select: {
          id: true,
          categoryId: true,
          sellerId: true,
          status: true,
          nameKr: true,
          nameEn: true,
          thumbnailUrl: true,
          price: true,
          createdAt: true,
          productOption: {
            select: {
              id: true,
              categoryOptionId: true,
              productOptionValue: {
                select: {
                  id: true,
                  categoryOptionValueId: true,
                  extraCharge: true,
                },
                where: {
                  deletedAt: null,
                },
              },
            },
            where: {
              deletedAt: null,
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
          id: productId,
          deletedAt: null,
        },
      });

      if (!product) {
        throw new ErrorPayload('유효하지 않은 상품입니다.');
      }

      if (product.sellerId != auth.sellerId) {
        throw new ErrorPayload('권한이 없습니다.');
      }

      return new SPGetProductPayload(product);
    } catch (e) {
      throw e;
    }
  }
}
