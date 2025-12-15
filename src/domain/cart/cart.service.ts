import { Injectable } from '@nestjs/common';
import { IAuth } from '../../auth/interface/auth.interface';
import {
  CAddItemDto,
  CDeleteItemDto,
  CGuestItemListDto,
  CUpdateItemDto,
  CMergeDto,
} from './dto/cart.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorPayload } from 'src/common/payload/error.payload';
import { CAddPayload, CQuotePayload } from './payload/cart.payload';
import { CProductStatusEnum } from './enum/cart.enum';
import { PricingService } from '../../pricing/pricing.service';
import { ICPricingItem } from './interface/cart.interface';

@Injectable()
export class CartService {
  private readonly CART_ITEMS_LIMIT = 50;
  private readonly CART_ITEM_QTY_LIMIT = 99;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  /**
   * 상품 key 생성
   * productId와 선택한 옵션으로 게스트의 상품을 구분할 아이디로 사용
   */
  #makeItemKey(productId: number, optionValueIdList: number[] = []) {
    const opts = [...optionValueIdList].sort((a, b) => a - b);
    return `${productId}_${opts.join(',')}`;
  }

  /**
   * 장바구니 상품 추가
   */
  async addItem(auth: IAuth, data: CAddItemDto): Promise<CAddPayload> {
    try {
      const { productId, qty, optionValueIdList = [] } = data;

      const cartProductCount = await this.prismaService.cart.count({
        where: {
          userId: auth.id,
          deletedAt: null,
        },
      });
      if (this.CART_ITEMS_LIMIT <= cartProductCount) {
        throw new ErrorPayload('장바구니에는 최대 50개의 상품만 담을 수 있습니다.');
      }

      const product = await this.prismaService.product.findUnique({
        select: {
          id: true,
          status: true,
          deletedAt: true,
          productOption: {
            select: {
              id: true,
              isRequired: true,
              productOptionValue: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
        where: {
          id: productId,
        },
      });

      if (!product) {
        throw new ErrorPayload('유효하지 않은 상품입니다.');
      }

      // 옵션 유효성 검사
      const { invalidItems } = await this.pricingService.validateProducts([data]);
      if (invalidItems.length) {
        const invalid = invalidItems[0];
        throw new ErrorPayload(invalid.reasons.join(', '));
      }

      /* 장바구니에 같은 productId & options 이 있으면 qty 더하기 */
      const cartProducts = await this.prismaService.cart.findMany({
        select: {
          id: true,
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
          productId,
        },
      });
      // 장바구니에 같은 옵션을 선택한 상품이 있는지 확인
      let dupItem: { cartId: number; qty: number };
      if (cartProducts) {
        for (const cp of cartProducts) {
          const cpOptionValue = cp.cartProductOptionValue;
          const cpOptionValueIdList = cpOptionValue.map((v) => v.productOptionValueId);
          // 선택한 옵션 개수가 같으며
          if (optionValueIdList.length == cpOptionValueIdList.length) {
            {
              // 옵션 값의 아이디들이 전부 일치하는지 확인
              if (optionValueIdList.every((v) => cpOptionValueIdList.includes(v)))
                dupItem = { cartId: cp.id, qty: cp.qty };
            }
          }
        }
      }

      let cartId: number;
      // 장바구니에 같은 옵션을 선택한 상품이 존재할 경우 qty 증가 & createdAt 갱신
      if (dupItem) {
        cartId = dupItem.cartId;
        if (dupItem.qty + qty < this.CART_ITEM_QTY_LIMIT) {
          await this.prismaService.cart.update({
            data: {
              qty: dupItem.qty + qty,
              createdAt: new Date(),
            },
            where: {
              id: cartId,
            },
          });
        } else {
          throw new ErrorPayload('같은 상품은 최대 99개까지 장바구니에 저장할 수 있습니다.');
        }
      }
      // 장바구니에 상품 추가
      else {
        cartId = await this.prismaService.$transaction(async (tx) => {
          // cart에 product 추가
          const cart = await tx.cart.create({
            select: { id: true },
            data: {
              userId: auth.id,
              productId: product.id,
              qty: qty,
            },
          });

          // 유효한 옵션일 경우, 옵션 값 저장
          if (optionValueIdList.length) {
            await tx.cartProductOptionValue.createMany({
              data: optionValueIdList.map((v) => ({ cartId: cart.id, productOptionValueId: v })),
            });
          }

          return cart.id;
        });
      }

      return new CAddPayload(cartId);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 장바구니 조회
   */
  async get(auth: IAuth): Promise<CQuotePayload> {
    try {
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      if (cartItems.length === 0) {
        return new CQuotePayload({
          subtotalMerchandise: 0,
          subtotalShippingFee: 0,
          invalidItems: [],
          list: [],
        });
      }

      const quoteItems: ICPricingItem[] = cartItems.map((v) => ({
        productId: v.productId,
        qty: v.qty,
        optionValueIdList: v.cartProductOptionValue?.map((w) => w.productOptionValueId) ?? [],
      }));
      const { subtotalMerchandise, subtotalShippingFee, invalidItems, list } =
        await this.pricingService.getQuoteOfProducts(quoteItems);

      /* 견적받은 아이템 리스트에 cartId 추가하기 */
      // productId_qty_optionIdList -> cartId
      const cartIdMap = new Map<string, number>();
      for (const cartItem of cartItems) {
        const key = this.#makeItemKey(
          cartItem.productId,
          cartItem.cartProductOptionValue?.map((v) => v.productOptionValueId),
        );
        cartIdMap.set(key, cartItem.id);
      }

      const enriched = list.map((v) => {
        for (let item of v.items) {
          const key = this.#makeItemKey(item.productId, item.optionValueIdList);
          const cartId = cartIdMap.get(key);
          item = Object.assign(item, { cartId });
        }
        return v;
      });

      return new CQuotePayload({
        subtotalMerchandise,
        subtotalShippingFee,
        invalidItems,
        list: enriched,
      });
    } catch (e) {
      throw e;
    }
  }

  /**
   * 장바구니에 담긴 상품 수정
   */
  async updateItem(auth: IAuth, data: CUpdateItemDto): Promise<boolean> {
    try {
      const { cartId, qty } = data;

      const cartProduct = await this.prismaService.cart.findUnique({
        select: {
          id: true,
          qty: true,
          product: {
            select: {
              id: true,
              status: true,
              deletedAt: true,
            },
          },
        },
        where: {
          userId: auth.id,
          orderedAt: null,
          deletedAt: null,
          id: cartId,
        },
      });

      if (!cartProduct || cartProduct.product.deletedAt) {
        throw new ErrorPayload('유효하지 않은 상품입니다.');
      }

      if (cartProduct.product.status !== CProductStatusEnum.ON) {
        throw new ErrorPayload('수정할 수 없는 상품입니다.');
      }

      await this.prismaService.cart.update({
        data: { qty },
        where: {
          userId: auth.id,
          id: cartId,
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 장바구니 상품 삭제
   */
  async deleteItem(auth: IAuth, data: CDeleteItemDto): Promise<boolean> {
    try {
      const { cartIdList } = data;

      await this.prismaService.cart.updateMany({
        data: { deletedAt: new Date() },
        where: {
          userId: auth.id,
          id: {
            in: cartIdList,
          },
        },
      });

      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 게스트 장바구니 조회
   */
  async guest(data: CGuestItemListDto): Promise<CQuotePayload> {
    try {
      const { items } = data;

      const { subtotalMerchandise, subtotalShippingFee, invalidItems, list } =
        await this.pricingService.getQuoteOfProducts(items);

      return new CQuotePayload({ subtotalMerchandise, subtotalShippingFee, invalidItems, list });
    } catch (e) {
      throw e;
    }
  }

  /**
   * guest 사용자가 로그인함으로써 sessionStorage에 저장된 장바구니 상품 리스트 병합
   * 최대 qty = 99
   * 장바구니 상품 제한 개수 기본 50이지만, 여기선 무시
   */
  async mergeGuestToMember(auth: IAuth, data: CMergeDto): Promise<boolean> {
    try {
      const { items } = data;

      if (items.length < 1) return true;

      // 옵션 유효성 검사
      const { invalidItems } = await this.pricingService.validateProducts(items);
      if (invalidItems.length) {
        const invalid = invalidItems[0];
        throw new ErrorPayload(invalid.reasons.join(', '));
      }

      // 현재 장바구니 조회
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
          orderedAt: null,
          deletedAt: null,
          userId: auth.id,
        },
      });

      // 장바구니 상품 맵 key: {...} (중복 상품 업데이트를 위함)
      const cartItemMap = new Map<
        string,
        { cartId: number; productId: number; qty: number; optionValueIdList: number[] }
      >(
        cartItems.map((v) => {
          const optionValueIdList =
            v.cartProductOptionValue?.map((w) => w.productOptionValueId) ?? [];

          const key = this.#makeItemKey(v.productId, optionValueIdList);

          return [
            key,
            {
              cartId: v.id,
              productId: v.productId,
              qty: v.qty,
              optionValueIdList,
            },
          ];
        }),
      );

      const updateParams: { cartId: number; qty: number }[] = [];
      const createParams: { productId: number; qty: number; optionValueIdList?: number[] }[] = [];
      for (const item of items) {
        const key = this.#makeItemKey(item.productId, item.optionValueIdList);

        // 같은 상품 존재
        const exist = cartItemMap.get(key);
        if (exist) {
          updateParams.push({
            cartId: exist.cartId,
            qty: Math.max(99, exist.qty + item.qty),
          });
        } else {
          createParams.push({
            productId: item.productId,
            qty: item.qty,
            optionValueIdList: item.optionValueIdList,
          });
        }
      }

      await this.prismaService.$transaction(async (tx) => {
        const now = new Date();
        // 업데이트
        for (const u of updateParams) {
          await tx.cart.update({
            where: { id: u.cartId },
            data: { qty: u.qty, createdAt: now, updatedAt: now },
          });
        }

        // 생성
        for (const c of createParams) {
          // 장바구니 raw 생성
          const cart = await tx.cart.create({
            select: { id: true },
            data: { userId: auth.id, productId: c.productId, qty: c.qty, createdAt: now },
          });

          // 장바구니 상품 옵션 생성
          if (c.optionValueIdList.length) {
            await tx.cartProductOptionValue.createMany({
              data: c.optionValueIdList.map((v: number) => ({
                cartId: cart.id,
                productOptionValueId: v,
              })),
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
