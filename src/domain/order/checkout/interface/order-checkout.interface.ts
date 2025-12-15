import { OCProductStatusEnum } from '../enum/order-checkout.enum';

export interface IOCCreated {
  readonly id: number;
  readonly expiredAt: Date;
}

export interface IOCProductOptionValue {
  readonly id: number;
  readonly extraCharge: number;
  readonly categoryOptionValue: {
    readonly valueKr: string;
    readonly valueEn: string;
  };
}

export interface IOCProductOption {
  readonly id: number;
  readonly isRequired: boolean;
  readonly categoryOption: {
    readonly nameKr: string;
    readonly nameEn: string;
  };
  readonly productOptionValue: IOCProductOptionValue[];
}

export interface IOCProduct {
  readonly id: number;
  readonly status: string | OCProductStatusEnum;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly thumbnailUrl: string;
  readonly price: number;
  readonly shippingFee: number;
  readonly productOption: IOCProductOption[];
}

export interface IOCSellerItem {
  readonly cartId?: number;
  readonly productId: number;
  readonly qty: number;
  readonly optionValueIdList: number[];
  readonly unitPrice: number;
  readonly totalPrice: number;
  readonly shippingFee: number;
  readonly product: IOCProduct;
}

export interface IOCSellerSubtotal {
  readonly sellerId: number;
  readonly sellerName: string;
  readonly freeShippingThreshold: number;
  readonly merchandiseSubtotal: number;
  readonly shippingFeeSubtotal: number;
  readonly freeApplied: boolean;
  readonly items: IOCSellerItem[];
}

export interface IOCOuote {
  readonly subtotalMerchandise: number;
  readonly subtotalShippingFee: number;
  readonly list: IOCSellerSubtotal[];
}
