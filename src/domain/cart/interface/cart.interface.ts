import { CProductStatusEnum, ValidationIssueEnum } from '../enum/cart.enum';

export interface ICProductOptionValue {
  readonly id: number;
  readonly extraCharge: number;
  readonly categoryOptionValue: {
    readonly valueKr: string;
    readonly valueEn: string;
  };
}

export interface ICProductOption {
  readonly id: number;
  readonly isRequired: boolean;
  readonly categoryOption: {
    readonly nameKr: string;
    readonly nameEn: string;
  };
  readonly productOptionValue: ICProductOptionValue[];
}

export interface ICProduct {
  readonly id: number;
  readonly status: string | CProductStatusEnum;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly thumbnailUrl: string;
  readonly price: number;
  readonly shippingFee: number;
  readonly productOption: ICProductOption[];
}

export interface ICPricingItem {
  readonly productId: number;
  readonly qty: number;
  readonly optionValueIdList: number[];
}

export interface ICInvalidItem {
  readonly productId: number;
  readonly qty: number;
  readonly optionValueIdList: number[];
  readonly reasons: string[] | ValidationIssueEnum[];
}

export interface ICSellerItem {
  readonly cartId?: number;
  readonly productId: number;
  readonly qty: number;
  readonly optionValueIdList: number[];
  readonly unitPrice: number;
  readonly totalPrice: number;
  readonly shippingFee: number;
  readonly product: ICProduct;
}

export interface ICSellerSubtotal {
  readonly sellerId: number;
  readonly sellerName: string;
  readonly freeShippingThreshold: number;
  readonly merchandiseSubtotal: number;
  readonly shippingFeeSubtotal: number;
  readonly freeApplied: boolean;
  readonly items: ICSellerItem[];
}

export interface ICOuote {
  readonly subtotalMerchandise: number;
  readonly subtotalShippingFee: number;
  readonly invalidItems: ICInvalidItem[];
  readonly list: ICSellerSubtotal[];
}
