import { MypageShipmentProductStatusEnum, MypageOrderProductStatusEnum } from '../enum/mypage.enum';

export interface IMypageProductOption {
  readonly optionNameKr: string;
  readonly optionNameEn: string;
  readonly optionValueKr: string;
  readonly optionValueEn: string;
}

export interface IMypageProduct {
  readonly id: number;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly thumbnailUrl: string;
  readonly selectedOptionList: IMypageProductOption[];
}

export interface IMypageShipmentProduct {
  readonly id: number;
  readonly status: string | MypageShipmentProductStatusEnum;
  readonly shippedAt: Date;
  readonly deliveredAt: Date;
  readonly createdAt: Date;
}

export interface IMypageOrderProduct {
  readonly id: number;
  readonly status: string | MypageOrderProductStatusEnum;
  readonly qty: number;
  readonly price: number;
  readonly totalPrice: number;
  readonly createdAt: Date;
  readonly product: IMypageProduct;
  readonly shipment: IMypageShipmentProduct;
}

export interface IMypageOrderList {
  readonly id: number;
  readonly no: string;
  readonly totalMerchandise: number;
  readonly totalShippingFee: number;
  readonly totalAmount: number;
  readonly orderProductList: IMypageOrderProduct[];
}
