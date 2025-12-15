import { Injectable } from '@nestjs/common';
import { IAuth } from 'src/auth/interface/auth.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { MyPageGetOrderListDto } from './dto/mypage.dto';
import { Prisma } from '@prisma/client';
import { convertEndDate, convertStartDate } from 'src/common';
import { IMypageProductOption } from './interface/mypage.interface';
import {
  MypageOrderListItemPayload,
  MypageOrderListPayload,
  MypageOrderProductPayload,
} from './payload/mypage.payload';

@Injectable()
export class MypageService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 주문/배송내역 조회
   */
  async getOrderList(auth: IAuth, data: MyPageGetOrderListDto): Promise<MypageOrderListPayload> {
    try {
      const {
        offset,
        length,
        startDate,
        endDate,
        keyword,
        orderProductStatus,
        shipmentProductStatus,
      } = data;

      // 주문 상품 where
      const orderProductWhere: Prisma.OrderProductWhereInput = {
        deletedAt: null,
      };
      // 주문 상품 키워드 필터
      if (keyword) {
        orderProductWhere.product = {
          OR: [{ nameKr: { contains: keyword } }, { nameEn: { contains: keyword } }],
        };
      }
      // 주문 상품 결제 상태 필터
      if (orderProductStatus?.length) {
        orderProductWhere.status = {
          in: orderProductStatus,
        };
      }
      // 주문 상품 배송 상태 필터
      if (shipmentProductStatus?.length) {
        orderProductWhere.shipmentProduct = {
          status: {
            in: shipmentProductStatus,
          },
        };
      }

      // 주문 where
      const orderWhere: Prisma.OrderWhereInput = {
        userId: auth.id,
        createdAt: {
          gte: convertStartDate(startDate),
          lt: convertEndDate(endDate),
        },
        // 유효한 orderProduct가 하나 이상 있는 주문만 조회
        orderProduct: {
          some: orderProductWhere,
        },
      };

      const count = await this.prismaService.order.count({
        where: {
          ...orderWhere,
          orderProduct: {
            some: orderProductWhere,
          },
        },
      });

      const orders = await this.prismaService.order.findMany({
        select: {
          id: true,
          no: true,
          totalMerchandise: true,
          totalShippingFee: true,
          totalAmount: true,
          orderProduct: {
            select: {
              id: true,
              status: true,
              qty: true,
              optionValueIds: true,
              price: true,
              totalPrice: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  nameKr: true,
                  nameEn: true,
                  thumbnailUrl: true,
                  productOption: {
                    select: {
                      categoryOption: {
                        select: {
                          id: true,
                          nameKr: true,
                          nameEn: true,
                          sortOrder: true,
                        },
                      },
                      productOptionValue: {
                        select: {
                          id: true,
                          categoryOptionValue: {
                            select: {
                              id: true,
                              valueKr: true,
                              valueEn: true,
                              sortOrder: true,
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
              },
              shipmentProduct: {
                select: {
                  id: true,
                  status: true,
                  shippedAt: true,
                  deliveredAt: true,
                  createdAt: true,
                },
              },
            },
            where: orderProductWhere,
          },
        },
        where: orderWhere,
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: length,
      });

      const list: MypageOrderListItemPayload[] = [];
      for (const order of orders) {
        const op: MypageOrderProductPayload[] = [];
        for (const orderProduct of order.orderProduct) {
          const selectedOptValueIds = this.#parseSelectedOptValueIds(orderProduct.optionValueIds);

          let selectedOptionList: IMypageProductOption[] = [];
          if (selectedOptValueIds?.length) {
            const optionMap = this.#buildOptionMap(orderProduct.product.productOption);
            selectedOptionList = this.#pickSelectedOptions(optionMap, selectedOptValueIds);
          }

          op.push({
            id: orderProduct.id,
            status: orderProduct.status,
            qty: orderProduct.qty,
            price: orderProduct.price,
            totalPrice: orderProduct.totalPrice,
            createdAt: orderProduct.createdAt,
            product: Object.assign(orderProduct.product, { selectedOptionList }),
            shipment: orderProduct.shipmentProduct,
          });
        }

        list.push({
          id: order.id,
          no: order.no,
          totalMerchandise: order.totalMerchandise,
          totalShippingFee: order.totalShippingFee,
          totalAmount: order.totalAmount,
          orderProductList: op,
        });
      }

      return new MypageOrderListPayload(count, list);
    } catch (e) {
      throw e;
    }
  }

  /**
   * product_order.option_value_ids(string|null) 값을 오름차순 number[]로 반환
   */
  #parseSelectedOptValueIds(optValueIds?: string | null): number[] {
    if (!optValueIds) return [];
    return optValueIds
      .split(',')
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v))
      .sort((a, b) => a - b);
  }

  #buildOptionMap(
    productOptions: {
      categoryOption: { nameKr: string; nameEn: string };
      productOptionValue: {
        id: number;
        categoryOptionValue: { valueKr: string; valueEn: string };
      }[];
    }[] = [],
  ): Map<number, IMypageProductOption> {
    const map = new Map<number, IMypageProductOption>();

    for (const productOption of productOptions) {
      const { nameKr, nameEn } = productOption.categoryOption;

      for (const optionValue of productOption.productOptionValue) {
        map.set(optionValue.id, {
          optionNameKr: nameKr,
          optionNameEn: nameEn,
          optionValueKr: optionValue.categoryOptionValue.valueKr,
          optionValueEn: optionValue.categoryOptionValue.valueEn,
        });
      }
    }

    return map;
  }

  #pickSelectedOptions(
    optionMap: Map<number, IMypageProductOption>,
    optionValueIds: number[],
  ): IMypageProductOption[] {
    const result: IMypageProductOption[] = [];

    for (const id of optionValueIds) {
      const found = optionMap.get(id);
      if (found) {
        result.push(found);
      }
    }

    return result;
  }
}
