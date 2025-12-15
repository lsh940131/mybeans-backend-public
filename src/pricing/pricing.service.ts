import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IPricingItem } from './interface/pricing.interface';
import {
  ProductSnapshot,
  PricingData,
  BatchValidationResult,
  SellerSubtotal,
  SellerSubtotalWithProduct,
  SellerSubtotalResultWithProduct,
} from './types';
import { validateItems } from './_lib/validators';
import { buildQuote } from './_lib/rules';

@Injectable()
export class PricingService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 상품 유효성 검사
   */
  async validateProducts(data: IPricingItem[]): Promise<BatchValidationResult> {
    try {
      const productIds = data.map((v) => v.productId);

      const products = await this.prismaService.product.findMany({
        select: {
          id: true,
          status: true,
          price: true,
          deletedAt: true,
          productOption: {
            select: {
              id: true,
              isRequired: true,
              productOptionValue: {
                select: {
                  id: true,
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
        },
        where: {
          id: {
            in: productIds,
          },
        },
      });
      const productMap = new Map<number, ProductSnapshot>();
      for (const product of products) {
        productMap.set(product.id, product);
      }

      return validateItems(data, productMap);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 상품의 개수와 선택옵션에 따른 가격 계산
   */
  async getQuoteOfProducts(data: IPricingItem[]): Promise<SellerSubtotalResultWithProduct> {
    try {
      // 유효성 검사
      const { validItems, invalidItems } = await this.validateProducts(data);

      // 유효한 상품이 없을 경우 바로 return
      if (validItems.length == 0)
        return { subtotalMerchandise: 0, subtotalShippingFee: 0, invalidItems, list: [] };

      // 유효한 상품의 정보 조회
      const validProducts = await this.prismaService.product.findMany({
        select: {
          id: true,
          price: true,
          shippingFee: true,
          seller: {
            select: {
              id: true,
              name: true,
              freeShippingThreshold: true,
            },
          },
        },
        where: {
          id: {
            in: validItems.map((v) => v.productId),
          },
        },
      });

      // 가격 계산을 위한 데이터 스냅샷
      const optionValueIds = validItems.flatMap((v) => v.optionValueIdList);
      const optionValues = await this.prismaService.productOptionValue.findMany({
        select: {
          id: true,
          extraCharge: true,
        },
        where: {
          id: {
            in: optionValueIds,
          },
          deletedAt: null,
        },
      });
      const pricingData: PricingData = {
        basePriceMap: new Map(validProducts.map((v) => [v.id, v.price])),
        extraChargeMap: new Map(optionValues.map((v) => [v.id, v.extraCharge])),
        shippingFeeMap: new Map(validProducts.map((v) => [v.id, v.shippingFee])),
        sellerFreeShippingMap: new Map(
          validProducts.map((v) => [
            v.id,
            {
              id: v.seller.id,
              name: v.seller.name,
              freeShippingThreshold: v.seller.freeShippingThreshold,
            },
          ]),
        ),
      };

      // 가격 계산
      const { list, subtotalMerchandise, subtotalShippingFee } = buildQuote(
        validItems,
        { now: Date.now(), currency: 'KRW' },
        pricingData,
      );

      // 상품 정보 추가
      const enriched = await this.#productsAdditionalInfo(list);

      return { subtotalMerchandise, subtotalShippingFee, invalidItems, list: enriched };
    } catch (e) {
      throw e;
    }
  }

  /**
   * 가격 계산 후 상품의 추가 정보 제공
   */
  async #productsAdditionalInfo(list: SellerSubtotal[]): Promise<SellerSubtotalWithProduct[]> {
    try {
      const productIdSet = list.reduce((acc, cur) => {
        for (const { productId } of cur.items) acc.add(productId);
        return acc;
      }, new Set<number>());
      const productIds = Array.from(productIdSet);

      const products = await this.prismaService.product.findMany({
        select: {
          id: true,
          status: true,
          nameKr: true,
          nameEn: true,
          thumbnailUrl: true,
          price: true,
          shippingFee: true,
          productOption: {
            select: {
              id: true,
              isRequired: true,
              categoryOption: {
                select: {
                  nameKr: true,
                  nameEn: true,
                },
              },
              productOptionValue: {
                select: {
                  id: true,
                  extraCharge: true,
                  categoryOptionValue: {
                    select: {
                      valueKr: true,
                      valueEn: true,
                    },
                  },
                },
                orderBy: {
                  categoryOptionValue: {
                    sortOrder: 'asc',
                  },
                },
              },
            },
            orderBy: {
              categoryOption: {
                sortOrder: 'asc',
              },
            },
          },
        },
        where: {
          id: {
            in: productIds,
          },
        },
      });

      const productById = new Map(products.map((p) => [p.id, p]));

      // 원본 list에 상품 정보를 덧붙인 새 구조 만들어서 반환
      const result: SellerSubtotalWithProduct[] = list.map((v) => ({
        ...v,
        items: v.items.map((item) => ({
          ...item,
          product: productById.get(item.productId),
        })),
      }));

      return result;
    } catch (e) {
      throw e;
    }
  }
}
