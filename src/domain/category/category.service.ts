import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryPayload, CategoryTreePayload } from './payload/category.payload';
import { GetDto } from './dto/category.dto';
import { ErrorPayload } from '../../common/payload/error.payload';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 자신 포함 부모 카테고리들의 아이디 반환
   * @returns [자신, 부모, 조부모, ...]
   */
  async #getParentIds(categoryId: number): Promise<number[]> {
    try {
      const allCategories = await this.prismaService.category.findMany({
        select: {
          id: true,
          parentId: true,
        },
        where: {
          deletedAt: null,
        },
      });

      const idMap = new Map<number, { id: number; parentId: number | null }>();
      allCategories.forEach((category) => idMap.set(category.id, category));

      const ids: number[] = [];
      let currentId: number | undefined = categoryId;
      while (currentId !== undefined) {
        const current = idMap.get(currentId);
        if (!current) break;

        ids.push(current.id);
        currentId = current.parentId ?? undefined;
      }

      return ids;
    } catch (e) {
      throw e;
    }
  }

  async tree(): Promise<CategoryTreePayload[]> {
    try {
      const categoryList = await this.prismaService.category.findMany({
        select: {
          id: true,
          parentId: true,
          nameKr: true,
          nameEn: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

      const nodeMap = new Map<number, CategoryTreePayload>();
      const roots: CategoryTreePayload[] = [];

      for (const category of categoryList) {
        nodeMap.set(category.id, new CategoryTreePayload({ ...category, children: [] }));
      }

      for (const category of categoryList) {
        const node = nodeMap.get(category.id);
        if (category.parentId) {
          const parent = nodeMap.get(category.parentId);
          if (parent) {
            parent.children.push(node);
          }
        } else {
          roots.push(node);
        }
      }

      return roots;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 카테고리 조회
   * 카테고리 옵션과 옵션 값 포함
   */
  async get(data: GetDto): Promise<CategoryPayload> {
    try {
      const { id } = data;

      const category = await this.prismaService.category.findUnique({
        select: {
          id: true,
          parentId: true,
          nameKr: true,
          nameEn: true,
        },
        where: { id, deletedAt: null },
      });
      if (!category) {
        throw new ErrorPayload('유효하지 않는 카테고리입니다.');
      }

      const idList = await this.#getParentIds(category.id);
      const optionList = await this.prismaService.categoryOption.findMany({
        select: {
          id: true,
          nameKr: true,
          nameEn: true,
          categoryOptionValue: {
            select: {
              id: true,
              valueKr: true,
              valueEn: true,
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
          categoryId: {
            in: idList,
          },
          deletedAt: null,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });

      return new CategoryPayload(category, optionList);
    } catch (e) {
      throw e;
    }
  }
}
