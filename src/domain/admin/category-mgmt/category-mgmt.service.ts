import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateDto,
  CreateOptionDto,
  CreateOptionValueDto,
  DeleteDto,
  DeleteOptionDto,
  DeleteOptionValueDto,
  UpdateDto,
  UpdateOptionDto,
  UpdateOptionValueDto,
} from './dto/category-mgmt.dto';
import { ErrorPayload } from '../../../common/payload/error.payload';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryMgmtService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 카테고리 생성
   */
  async create(data: CreateDto): Promise<boolean> {
    try {
      const { parentId, nameKr, nameEn } = data;

      if (parentId) {
        const parent = await this.prismaService.category.findUnique({
          select: { id: true },
          where: { id: parentId, deletedAt: null },
        });
        if (!parent) {
          throw new ErrorPayload('부모로 지정한 카테고리가 유효하지 않습니다.');
        }
      }

      const others = await this.prismaService.category.findMany({
        where: {
          deletedAt: null,
          OR: [{ nameKr }, { nameEn }],
        },
      });
      if (others.length) {
        throw new ErrorPayload(
          `카테고리 이름이 중복되었습니다. 사용중인 카테고리 이름(한글): [${others.map((v) => v.nameKr).join(', ')}], 이름(영어): [${others.map((v) => v.nameEn).join(', ')}]`,
        );
      }

      await this.prismaService.category.create({
        data: {
          parentId,
          nameKr,
          nameEn,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 카테고리 수정
   * 부모 카테고리 set null 가능
   * nameKr, nameEn 은 set null 불가
   */
  async update(data: UpdateDto): Promise<boolean> {
    try {
      const { id, parentId, nameKr, nameEn } = data;

      const category = await this.prismaService.category.findUnique({
        select: { id: true },
        where: { id, deletedAt: null },
      });
      if (!category) {
        throw new ErrorPayload('유효하지 않은 카테고리입니다.');
      }

      if (parentId) {
        const parent = await this.prismaService.category.findUnique({
          select: { id: true },
          where: { id: parentId },
        });
        if (!parent) {
          throw new ErrorPayload('부모로 설정한 카테고리가 없습니다.');
        }
      }

      const others = await this.prismaService.category.findMany({
        where: {
          deletedAt: null,
          id: {
            not: id,
          },
          OR: [{ nameKr }, { nameEn }],
        },
      });
      if (others.length) {
        throw new ErrorPayload(
          `카테고리 이름이 중복되었습니다. 사용중인 카테고리 이름(한글): [${others.map((v) => v.nameKr).join(', ')}], 이름(영어): [${others.map((v) => v.nameEn).join(', ')}]`,
        );
      }

      await this.prismaService.category.update({
        where: { id },
        data: {
          parentId: parentId !== undefined ? parentId : undefined,
          nameKr: nameKr ? nameKr : undefined,
          nameEn: nameEn ? nameEn : undefined,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 카테고리 삭제
   * 상품이 있을 경우 삭제 불가
   */
  async delete(data: DeleteDto): Promise<boolean> {
    try {
      const { id } = data;

      const category = await this.prismaService.category.findUnique({
        select: {
          id: true,
        },
        where: {
          id,
          deletedAt: null,
        },
      });
      if (!category) {
        return true;
      }

      // 해당 카테고리로 등록된 상품이 있을 경우 삭제 불가
      const products = await this.prismaService.product.findMany({
        where: {
          categoryId: id,
          deletedAt: null,
        },
      });
      if (products.length) {
        throw new ErrorPayload('해당 카테고리로 등록된 물품들이 있습니다');
      }

      await this.prismaService.category.update({
        where: {
          id,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 카테고리 옵션 생성
   * 자식 카테고리들도 해당 옵션 선택 가능
   */
  async createOption(data: CreateOptionDto): Promise<boolean> {
    try {
      const { categoryId, nameKr, nameEn } = data;

      const category = await this.prismaService.category.findUnique({
        select: { id: true },
        where: { id: categoryId, deletedAt: null },
      });
      if (!category) {
        throw new ErrorPayload('유효하지 않는 카테고리입니다.');
      }

      const others = await this.prismaService.categoryOption.findMany({
        select: { id: true, nameKr: true, nameEn: true },
        where: {
          deletedAt: null,
          categoryId: category.id,
          OR: [{ nameKr }, { nameEn }],
        },
      });
      if (others.length) {
        throw new ErrorPayload(
          `카테고리 옵션 이름이 중복되었습니다. 사용중인 카테고리 옵션 이름(한글): [${others.map((v) => v.nameKr).join(', ')}], 이름(영어): [${others.map((v) => v.nameEn).join(', ')}]`,
        );
      }

      const lastSortOrder = await this.prismaService.categoryOption.findFirst({
        select: {
          sortOrder: true,
        },
        orderBy: {
          sortOrder: 'desc',
        },
      });

      await this.prismaService.categoryOption.create({
        data: {
          categoryId,
          nameKr,
          nameEn,
          sortOrder: lastSortOrder?.sortOrder ?? 0 + 1,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 카테고리 옵션 수정
   */
  async updateOption(data: UpdateOptionDto): Promise<boolean> {
    try {
      const { categoryOptionId, nameKr, nameEn } = data;

      const categoryOption = await this.prismaService.categoryOption.findUnique({
        select: { id: true, categoryId: true },
        where: { id: categoryOptionId, deletedAt: null },
      });
      if (!categoryOption) {
        throw new ErrorPayload('유효하지 않은 카테고리 옵션입니다.');
      }

      const others = await this.prismaService.categoryOption.findMany({
        select: { id: true, nameKr: true, nameEn: true },
        where: {
          deletedAt: null,
          id: {
            not: categoryOption.id,
          },
          categoryId: categoryOption.categoryId,
          OR: [{ nameKr }, { nameEn }],
        },
      });
      if (others.length) {
        throw new ErrorPayload(
          `카테고리 옵션 이름이 중복되었습니다. 사용중인 카테고리 옵션 이름(한글): [${others.map((v) => v.nameKr).join(', ')}], 이름(영어): [${others.map((v) => v.nameEn).join(', ')}]`,
        );
      }

      await this.prismaService.categoryOption.update({
        data: {
          nameKr: nameKr ? nameKr : undefined,
          nameEn: nameEn ? nameEn : undefined,
        },
        where: {
          id: categoryOption.id,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 카테고리 옵션 삭제
   * 해당 카테고리 옵션을 사용중인 상품이 있을 경우 삭제 불가
   */
  async deleteOption(data: DeleteOptionDto): Promise<boolean> {
    try {
      const { categoryOptionId } = data;
      const categoryOption = await this.prismaService.categoryOption.findUnique({
        select: {
          id: true,
        },
        where: {
          id: categoryOptionId,
          deletedAt: null,
        },
      });
      if (!categoryOption) {
        return true;
      }

      const products = await this.prismaService.product.findMany({
        select: { id: true },
        where: {
          deletedAt: null,
          productOption: {
            some: {
              categoryOptionId: categoryOption.id,
              deletedAt: null,
            },
          },
        },
      });
      if (products.length) {
        throw new ErrorPayload('해당 카테고리 옵션을 사용하는 상품이 있습니다.');
      }

      await this.prismaService.categoryOption.update({
        data: { deletedAt: new Date() },
        where: { id: categoryOption.id },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 카테고리 옵션 값 생성
   */
  async createOptionValue(data: CreateOptionValueDto): Promise<boolean> {
    try {
      const { categoryOptionId, valueKr, valueEn } = data;

      const categoryOption = await this.prismaService.categoryOption.findUnique({
        select: { id: true },
        where: { id: categoryOptionId, deletedAt: null },
      });
      if (!categoryOption) {
        throw new ErrorPayload('유효하지 않은 카테고리 옵션입니다.');
      }

      const others = await this.prismaService.categoryOptionValue.findMany({
        select: {
          id: true,
          valueKr: true,
          valueEn: true,
        },
        where: {
          deletedAt: null,
          categoryOptionId: categoryOptionId,
          OR: [{ valueKr }, { valueEn }],
        },
      });
      if (others.length) {
        throw new ErrorPayload(
          `카테고리 옵션 이름이 중복되었습니다. 사용중인 카테고리 옵션 값 이름(한글): [${others.map((v) => v.valueKr).join(', ')}], 이름(영어): [${others.map((v) => v.valueEn).join(', ')}]`,
        );
      }

      const lastSortOrder = await this.prismaService.categoryOptionValue.findFirst({
        select: {
          sortOrder: true,
        },
        where: {
          categoryOptionId: categoryOption.id,
        },
        orderBy: {
          sortOrder: 'desc',
        },
      });

      await this.prismaService.categoryOptionValue.create({
        data: {
          categoryOptionId: categoryOption.id,
          valueKr,
          valueEn,
          sortOrder: lastSortOrder?.sortOrder ?? 0 + 1,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 카테고리 옵션 값 수정
   * 등록된 상품이 사용중인 옵션이라면 수정 불가 (옵션 값에 따라 추가요금이 붙는 구조라 데이터가 엉킬 수 있음)
   */
  async updateOptionValue(data: UpdateOptionValueDto): Promise<boolean> {
    try {
      const { categoryOptionValueId, valueKr, valueEn } = data;

      const categoryOptionValue = await this.prismaService.categoryOptionValue.findUnique({
        select: { id: true, categoryOptionId: true },
        where: {
          deletedAt: null,
          id: categoryOptionValueId,
        },
      });
      if (!categoryOptionValue) {
        throw new ErrorPayload('유효하지 않은 카테고리 옵션 값입니다.');
      }

      const others = await this.prismaService.categoryOptionValue.findMany({
        select: {
          id: true,
          valueKr: true,
          valueEn: true,
        },
        where: {
          deletedAt: null,
          categoryOptionId: categoryOptionValue.categoryOptionId,
          id: { not: categoryOptionValue.id },
          OR: [{ valueKr }, { valueEn }],
        },
      });
      if (others.length) {
        throw new ErrorPayload(
          `카테고리 옵션 이름이 중복되었습니다. 사용중인 카테고리 옵션 값 이름(한글): [${others.map((v) => v.valueKr).join(', ')}], 이름(영어): [${others.map((v) => v.valueEn).join(', ')}]`,
        );
      }

      const products = await this.prismaService.product.findMany({
        where: {
          deletedAt: null,
          productOption: {
            some: {
              deletedAt: null,
              productOptionValue: {
                some: {
                  deletedAt: null,
                  categoryOptionValueId: categoryOptionValue.id,
                },
              },
            },
          },
        },
      });
      if (products.length) {
        throw new ErrorPayload('해당 옵션 값을 사용중인 상품이 있습니다.');
      }

      await this.prismaService.categoryOptionValue.update({
        data: {
          valueKr: valueKr ? valueKr : undefined,
          valueEn: valueEn ? valueEn : undefined,
        },
        where: {
          id: categoryOptionValue.id,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 카테고리 옵션 값 삭제
   * 등록된 상품이 사용중인 옵션이라면 수정 불가 (옵션 값에 따라 추가요금이 붙는 구조라 데이터가 엉킬 수 있음)
   */
  async deleteOptionValue(data: DeleteOptionValueDto): Promise<boolean> {
    try {
      const { categoryOptionValueId } = data;

      const categoryOptionValue = await this.prismaService.categoryOptionValue.findUnique({
        select: { id: true },
        where: {
          deletedAt: null,
          id: categoryOptionValueId,
        },
      });
      if (!categoryOptionValue) {
        return true;
      }

      const products = await this.prismaService.product.findMany({
        where: {
          deletedAt: null,
          productOption: {
            some: {
              deletedAt: null,
              productOptionValue: {
                some: {
                  deletedAt: null,
                  categoryOptionValueId: categoryOptionValue.id,
                },
              },
            },
          },
        },
      });
      if (products.length) {
        throw new ErrorPayload('해당 옵션 값을 사용중인 상품이 있습니다.');
      }

      await this.prismaService.categoryOptionValue.update({
        data: {
          deletedAt: new Date(),
        },
        where: {
          id: categoryOptionValue.id,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }
}
