import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PricingService } from '../../../pricing/pricing.service';
import { IAuth } from 'src/auth/interface/auth.interface';
import { OCCreateDto, OCGetDto, OCUpdateDto } from './dto/order-checkout.dto';
import { OCSourceEnum, OCStatusEnum } from './enum/order-checkout.enum';
import { ErrorPayload } from 'src/common/payload/error.payload';
import { isSameArray } from 'src/common';
import { Prisma } from '@prisma/client';
import { ICPricingItem } from 'src/domain/cart/interface/cart.interface';
import { OCCreatePayload, OCQuotePayload } from './payload/order-checkout.payload';
import { IOCShipment } from '../interface/order.interface';

@Injectable()
export class OrderCheckoutService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  /**
   * 계산서 생성
   * 상품과 상품의 옵션의 유효성 체크
   */
  async create(auth: IAuth, data: OCCreateDto): Promise<OCCreatePayload> {
    try {
      const { source, cartIdList = [], productId, qty, optionValueIdList = [] } = data;

      const uniqueCartIds = Array.from(new Set(cartIdList));
      const uniqueOptionValueIds = Array.from(new Set(optionValueIdList));
      const expiredAt = new Date(Date.now() + 30 * 60 * 1000); // 30분 뒤 만료

      const createParams: Prisma.OrderCheckoutUncheckedCreateInput = {
        userId: auth.id,
        status: OCStatusEnum.PENDING,
        source,
        expiredAt,
      };

      // 장바구니: 장바구니 아이템 유효성 체크
      if (source === OCSourceEnum.CART) {
        const cartItems = await this.prismaService.cart.findMany({
          select: {
            id: true,
          },
          where: {
            id: {
              in: uniqueCartIds,
            },
            orderedAt: null,
            deletedAt: null,
            userId: auth.id,
          },
        });

        const cartItemIds = cartItems.map((v) => v.id);
        if (!isSameArray(uniqueCartIds, cartItemIds)) {
          throw new ErrorPayload('유효하지 않은 장바구니 상품입니다.');
        }

        createParams.cartIds = cartItemIds.join(',');
      }
      // 바로구매: 상품 유효성 체크
      else {
        const { invalidItems } = await this.pricingService.validateProducts([
          { productId, qty, optionValueIdList },
        ]);
        if (invalidItems.length) {
          throw new ErrorPayload('유효하지 않은 상품 및 옵션입니다.');
        }

        createParams.productId = productId;
        createParams.qty = qty;
        createParams.optionValueIds = uniqueOptionValueIds.join(',');
      }

      const oc = await this.prismaService.orderCheckout.create({
        select: { id: true },
        data: createParams,
      });

      return new OCCreatePayload({ id: oc.id, expiredAt });
    } catch (e) {
      throw e;
    }
  }

  /**
   * 계산서 조회
   * 주문하려는 상품들의 견적서(quote) 반환
   */
  async get(auth: IAuth, data: OCGetDto): Promise<OCQuotePayload> {
    try {
      const { id } = data;

      const oc = await this.prismaService.orderCheckout.findUnique({
        select: {
          id: true,
          userId: true,
          status: true,
          source: true,
          cartIds: true,
          productId: true,
          qty: true,
          optionValueIds: true,
          expiredAt: true,
        },
        where: {
          id,
        },
      });

      if (!oc || oc.userId !== auth.id) {
        throw new ErrorPayload('유효하지 않은 계산서입니다.');
      }

      if (oc.status !== OCStatusEnum.PENDING) {
        throw new ErrorPayload('유효하지 않은 상태의 계산서입니다.');
      }

      if (oc.expiredAt < new Date()) {
        throw new ErrorPayload('만료된 계산서입니다.');
      }

      // 견적 받을 아이템들
      const quoteItems: ICPricingItem[] = [];

      // 계산서의 source가 장바구니 일 경우, 장바구니 상품 유효성 체크 및 견적 받을 아이템에 추가
      if (oc.source === OCSourceEnum.CART) {
        const cartIds = oc.cartIds.split(',').map((v) => Number(v));
        const cartItems = await this.prismaService.cart.findMany({
          select: {
            id: true,
            productId: true,
            qty: true,
            cartProductOptionValue: {
              select: {
                productOptionValueId: true,
              },
              where: {
                deletedAt: null,
              },
            },
          },
          where: {
            id: { in: cartIds },
            orderedAt: null,
            deletedAt: null,
            userId: auth.id,
          },
        });

        const isSame = isSameArray(
          cartIds,
          cartItems.map((v) => v.id),
        );
        if (!isSame) throw new ErrorPayload('유효하지 않은 장바구니 상품입니다.');

        for (const item of cartItems) {
          quoteItems.push({
            productId: item.productId,
            qty: item.qty,
            optionValueIdList: item.cartProductOptionValue.map((v) => v.productOptionValueId),
          });
        }
      }
      // 계산서의 source가 바로구매 일 경우
      else {
        quoteItems.push({
          productId: oc.productId,
          qty: oc.qty,
          optionValueIdList: oc.optionValueIds.split(',').map((v) => Number(v)),
        });
      }

      const { subtotalMerchandise, subtotalShippingFee, invalidItems, list } =
        await this.pricingService.getQuoteOfProducts(quoteItems);

      if (invalidItems.length) {
        throw new ErrorPayload('유효하지 않은 견적입니다.');
      }

      return new OCQuotePayload({ subtotalMerchandise, subtotalShippingFee, list });
    } catch (e) {
      throw e;
    }
  }

  /**
   * 계산서 수정
   * 배송지 및 배송요청사항 수정
   * todo: 할인,마일리지,쿠폰 등 가격에 영향을 끼치는 것도 저장하여 견적 계산 및 주문/결제에 반영
   */
  async update(auth: IAuth, data: OCUpdateDto) {
    try {
      const { id, shipment } = data;

      const checkout = await this.prismaService.orderCheckout.findUnique({
        select: {
          id: true,
          status: true,
          source: true,
          cartIds: true,
          productId: true,
          optionValueIds: true,
          expiredAt: true,
        },
        where: {
          id,
          userId: auth.id,
        },
      });

      if (!checkout) {
        throw new ErrorPayload('유효하지 않은 계산서입니다.');
      }

      if (checkout.status !== OCStatusEnum.PENDING) {
        throw new ErrorPayload('수정할 수 없는 계산서입니다.');
      }

      if (checkout.expiredAt <= new Date()) {
        throw new ErrorPayload('만료된 계산서입니다.');
      }

      // 계산서 source에 따라 견적서 상품 조회
      const items: { productId: number; optValueIds: number[] }[] = [];
      if (checkout.source === OCSourceEnum.CART) {
        const cartIds = checkout.cartIds.split(',').map((v) => Number(v));

        const cartItems = await this.prismaService.cart.findMany({
          select: {
            id: true,
            productId: true,
            qty: true,
            cartProductOptionValue: {
              select: {
                productOptionValueId: true,
              },
              where: {
                deletedAt: null,
              },
            },
          },
          where: {
            userId: auth.id,
            orderedAt: null,
            deletedAt: null,
            id: {
              in: cartIds,
            },
          },
        });

        for (const cartItem of cartItems) {
          items.push({
            productId: cartItem.productId,
            optValueIds: cartItem.cartProductOptionValue.map((v) => v.productOptionValueId),
          });
        }
      } else if (checkout.source === OCSourceEnum.DIRECT) {
        items.push({
          productId: checkout.productId,
          optValueIds: checkout.optionValueIds
            ? checkout.optionValueIds
                ?.split(',')
                .map((v) => Number(v))
                .filter((v) => Number.isFinite(v))
            : [],
        });
      } else {
        throw new ErrorPayload('유효하지 않은 계산서입니다.');
      }

      if (items.length != shipment.items.length) {
        throw new ErrorPayload(
          `주문 상품 개수(${shipment.items.length})가 견적서 상품 개수(${items.length})와 일치하지 않습니다.`,
        );
      }

      // 견적서 상품들의 key set 생성
      const itemsKeySet = new Set<string>();
      for (const item of items) {
        const key = this.#makeItemKey(item.productId, item.optValueIds);
        itemsKeySet.add(key);
      }

      // 주문 상품의 map<key: shipmentReqMsg> 생성 및 유효성 체크
      const shipItemsMap = new Map<string, string | undefined | null>();
      for (const shipItem of shipment.items) {
        // 중복 key 체크
        if (shipItemsMap.has(shipItem.key)) {
          throw new ErrorPayload(`중복된 상품 키가 요청에 포함되어 있습니다: ${shipItem.key}`);
        }
        // itemsKeySet 없는 key 체크
        if (!itemsKeySet.has(shipItem.key)) {
          throw new ErrorPayload(`견적서에 존재하지 않는 상품 키입니다: ${shipItem.key}`);
        }

        shipItemsMap.set(shipItem.key, shipItem.shipmentReqMsg);
      }

      // 양쪽 key 개수 체크
      if (shipItemsMap.size !== itemsKeySet.size) {
        throw new ErrorPayload('견적서 상품과 주문 상품의 구성이 일치하지 않습니다.');
      }

      const shipmentParams: IOCShipment = {
        receiverName: shipment.receiverName,
        phone: shipment.phone,
        address: shipment.address,
        addressDetail: shipment.addressDetail,
        postcode: shipment.postcode,
        items: shipment.items.map((v) => ({
          key: v.key,
          shipmentReqMsg: v.shipmentReqMsg,
        })),
      };

      await this.prismaService.orderCheckout.update({
        data: {
          shipment: shipmentParams as unknown as Prisma.InputJsonValue,
          updatedAt: new Date(),
        },
        where: {
          id,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  #makeItemKey(productId: number, optValueIds: number[]): string {
    if (!optValueIds || optValueIds.length === 0) return `${productId}:-`;

    const sorted = optValueIds.map(Number).filter((v) => Number.isFinite(v));
    sorted.sort((a, b) => a - b);

    return `${productId}:${sorted.join(',')}`;
  }
}
