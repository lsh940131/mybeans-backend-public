import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IAuth } from '../../auth/interface/auth.interface';
import { OrderConfirmDto } from './dto/order.dto';
import { ConfigService } from '@nestjs/config';
import { ErrorPayload } from 'src/common/payload/error.payload';
import { OCSourceEnum, OCStatusEnum } from './enum/order.enum';
import { ICPricingItem } from '../cart/interface/cart.interface';
import { PricingService } from 'src/pricing/pricing.service';
import axios from 'axios';
import { CryptoService } from 'src/common/crypto/crypto.service';
import {
  IOCShipment,
  IOCShipmentItem,
  IOrderProduct,
  ITossPaymentApproveResponse,
} from './interface/order.interface';
import { SellerSubtotalWithProduct } from 'src/pricing/types';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  private TOSS_END_POINT: string;
  private TOSS_API_SECRET_KEY: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly pricingService: PricingService,
    private readonly cryptoService: CryptoService,
  ) {
    this.TOSS_END_POINT = this.configService.get<string>('TOSS_END_POINT');
    this.TOSS_API_SECRET_KEY = this.configService.get<string>('TOSS_API_SECRET_KEY');
  }

  /**
   * 주문/결제 확인
   */
  async confirm(auth: IAuth, data: OrderConfirmDto) {
    try {
      const { checkoutId, paymentKey, tossOrderId, amount } = data;

      const checkout = await this.prismaService.orderCheckout.findUnique({
        select: {
          id: true,
          status: true,
          source: true,
          cartIds: true,
          productId: true,
          qty: true,
          optionValueIds: true,
          shipment: true,
          expiredAt: true,
        },
        where: {
          id: checkoutId,
          userId: auth.id,
        },
      });

      // 견적서 유효성 체크
      if (!checkout) {
        throw new ErrorPayload('유효하지 않은 주문/결제 신청입니다.');
      }
      if (checkout.status == OCStatusEnum.COMPLETED) {
        throw new ErrorPayload('완료된 주문/결제건입니다.');
      }
      const now = new Date();
      if (checkout.status != OCStatusEnum.PENDING || checkout.expiredAt <= now) {
        throw new ErrorPayload('만료된 주문/결제건입니다.');
      }
      if (!checkout.shipment) {
        throw new ErrorPayload('배송지 정보를 입력해주세요.');
      }

      // 견적 받을 상품들
      const quoteItems: ICPricingItem[] = [];
      // 계산서 source에 따라 견적 상품 구성이 다름
      if (checkout.source == OCSourceEnum.CART) {
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
          quoteItems.push({
            productId: cartItem.productId,
            qty: cartItem.qty,
            optionValueIdList:
              cartItem.cartProductOptionValue?.map((w) => w.productOptionValueId) ?? [],
          });
        }
      } else if (checkout.source == OCSourceEnum.DIRECT) {
        quoteItems.push({
          productId: checkout.productId,
          qty: checkout.qty,
          optionValueIdList: checkout.optionValueIds?.split(',').map((v) => Number(v)) ?? [],
        });
      }
      // 견적서 조회
      const { subtotalMerchandise, subtotalShippingFee, invalidItems, list } =
        await this.pricingService.getQuoteOfProducts(quoteItems);

      // 결제 금액 유효성 체크 (tobe: 쿠폰 등이 생기면 dto에 쿠폰 id 같은 거 넣고 계산 로직 보충)
      if (amount !== subtotalMerchandise + subtotalShippingFee) {
        throw new ErrorPayload('결제 금액이 주문서와 일치하지 않습니다.');
      }

      if (invalidItems.length) {
        throw new ErrorPayload('유효하지 않은 상품이 있습니다.');
      }

      /** Toss 결제 승인 요청 */
      const secret = Buffer.from(`${this.TOSS_API_SECRET_KEY}:`).toString('base64');
      let tossResponse: ITossPaymentApproveResponse;
      try {
        const resp = await axios.post(
          this.TOSS_END_POINT,
          {
            paymentKey,
            orderId: tossOrderId,
            amount,
          },
          {
            headers: {
              Authorization: `Basic ${secret}`,
              'Content-Type': 'application/json',
            },
          },
        );
        // Toss 응답 전문
        tossResponse = resp.data;
      } catch (e) {
        const message =
          e.response?.data?.message ?? '토스 결제 승인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
        throw new ErrorPayload(message);
      }

      // 주문 상품(order_product) 테이블에 저장할 데이터 구성 및 유효성 체크
      const shipment = checkout.shipment as unknown as IOCShipment;
      const orderProductParams = this.#makeOrderProductParams(list, shipment.items);

      /**
       * 주문, 결제, 배송 데이터 생성
       */
      await this.prismaService.$transaction(async (tx) => {
        // 주문 생성
        const order = await tx.order.create({
          select: { id: true },
          data: {
            no: this.#createOrderNo(),
            orderCheckoutId: checkoutId,
            userId: auth.id,
            totalMerchandise: subtotalMerchandise,
            totalShippingFee: subtotalShippingFee,
            totalAmount: subtotalMerchandise + subtotalShippingFee,
          },
        });

        // 주문 상품(배송요청포함) 생성
        await tx.orderProduct.createMany({
          data: orderProductParams.map((v) => ({
            ...v,
            orderId: order.id,
            status: tossResponse.status,
          })),
        });

        // 결제 생성
        await tx.payment.create({
          data: {
            orderId: order.id,
            status: tossResponse.status,
            paymentKey: tossResponse.paymentKey,
            method: tossResponse.method,
            totalAmount: tossResponse.totalAmount,
            balanceAmount: tossResponse.balanceAmount,
            currency: tossResponse.currency,
            requestedAt: tossResponse.requestedAt,
            approvedAt: tossResponse.approvedAt,
            receiptUrl: tossResponse.receipt.url,
            issuerCode: tossResponse?.card?.issuerCode,
            acquirerCode: tossResponse?.card?.acquirerCode,
            cardNumber: tossResponse?.card?.number,
            installmentMonths: tossResponse?.card?.installmentPlanMonths,
            isInterestFree: tossResponse?.card?.isInterestFree,
            rawApprovePayload: tossResponse as unknown as Prisma.InputJsonValue,
          },
        });

        // 주문 배송지 생성
        await tx.shipment.create({
          data: {
            orderId: order.id,
            receiverName: shipment.receiverName,
            phone: shipment.phone,
            address: shipment.address,
            addressDetail: shipment.addressDetail,
            postcode: shipment.postcode,
          },
        });

        // 장바구니 상품이었다면 구매처리
        if (checkout.source == OCSourceEnum.CART) {
          const cartIds = checkout.cartIds.split(',').map((v) => Number(v));

          await tx.cart.updateMany({
            data: { orderedAt: new Date() },
            where: { id: { in: cartIds }, userId: auth.id },
          });
        }
      });

      return {
        subtotalMerchandise,
        subtotalShippingFee,
        list,
      };
    } catch (e) {
      throw e;
    }
  }

  /**
   * 주문 no 생성
   */
  #createOrderNo(): string {
    const today = new Date();
    const yyyy = today.getFullYear().toString();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const dateStr = `${yyyy}${mm}${dd}`;
    const randStr = this.cryptoService.generateRandomInt(10);

    return dateStr + randStr;
  }

  /**
   * 상품의 아이디와 선택한 옵션 값들로 key 생성
   * cartId가 없는 바로구매 때문에 구매할 상품을 유니크하게 특정하기 위함
   */
  #makeItemKey(productId: number, optValueIds: number[]): string {
    if (!optValueIds || optValueIds.length === 0) return `${productId}:-`;

    const sorted = optValueIds.map(Number).filter((v) => Number.isFinite(v));
    sorted.sort((a, b) => a - b);

    return `${productId}:${sorted.join(',')}`;
  }

  /**
   * order_product 테이블에 insert 할 데이터 배열 만들어서 반환
   * checkout.shipment에 저장된 값은 형태 및 유효성 검증을 마친 후 저장되었기 때문에 바로 사용
   */
  #makeOrderProductParams(
    quoteList: SellerSubtotalWithProduct[],
    shipmentItems: IOCShipmentItem[],
  ): IOrderProduct[] {
    const allItems = quoteList.flatMap((v) => v.items);

    const shipmentItemsMap = new Map<string, string | undefined | null>(
      shipmentItems.map((v) => [v.key, v.shipmentReqMsg]),
    );

    return allItems.map((v) => {
      const key = this.#makeItemKey(v.productId, v.optionValueIdList);
      const shipmentReqMsg = shipmentItemsMap.get(key) ?? undefined;

      return {
        productId: v.productId,
        qty: v.qty,
        optionValueIds: v.optionValueIdList.join(','),
        price: v.unitPrice,
        totalPrice: v.totalPrice,
        shipmentReqMsg,
      };
    });
  }
}
