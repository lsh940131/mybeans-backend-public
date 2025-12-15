import { ProductStatusEnum } from '../enum/product.enum';

export interface IProductCoffeeProfile {
  readonly isSingle: boolean;
  readonly isBlend: boolean;
  readonly isSpecialty: boolean;
  readonly isDecaf: boolean;
}

export interface IProductCategory {
  readonly id: number;
  readonly parentId: number;
  readonly nameKr: string;
  readonly nameEn: string;
}

export interface IProductSeller {
  readonly id: number;
  readonly name: string;
}

export interface IProductListItem {
  readonly id: number;
  readonly status: string | ProductStatusEnum;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly thumbnailUrl: string;
  readonly price: number;
  readonly productCoffeeProfile: IProductCoffeeProfile;
  readonly category: IProductCategory;
  readonly seller: IProductSeller;
}

export interface IProductOptionValueSql {
  readonly optionId: number;
  readonly isRequired: boolean;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly optionValueId: number;
  readonly extraCharge: number;
  readonly valueKr: string;
  readonly valueEn: string;
}

export interface IProductImage {
  readonly id: number;
  readonly url: string;
}

export interface IProductGet {
  readonly id: number;
  readonly status: string;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly thumbnailUrl: string;
  readonly price: number;

  readonly category: IProductCategory;
  readonly seller: IProductSeller;
  readonly productImage: IProductImage[];
}

export interface IProductOptionValue {
  readonly id: number;
  readonly extraCharge: number;
  readonly valueKr: string;
  readonly valueEn: string;
}

export interface IProductOption {
  readonly id: number;
  readonly isRequired: boolean;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly valueList: IProductOptionValue[];
}

export interface IProductSearchKeyword {
  readonly id: number;
  readonly keyword: string;
  readonly createdAt: Date;
}
