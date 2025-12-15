import {
  SPManipActionEnum,
  SPManipStatusEnum,
  SPProductStatusEnum,
} from '../enum/seller-product.enum';

export interface ISPManipOptionValue {
  readonly categoryOptionValueId: number;
  readonly extraCharge: number;
}

export interface ISPManipOption {
  readonly categoryOptionId: number;
  readonly categoryOptionValueList: ISPManipOptionValue[];
}

export interface ISPManipValue {
  readonly status: string | SPProductStatusEnum;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly thumbnailUrl: string;
  readonly price: number;
  readonly optionList: ISPManipOption[];
  readonly imageList: string[];
}

export interface ISPManip {
  readonly id: number;
  readonly action: string | SPManipActionEnum;
  readonly status: string | SPManipStatusEnum;
  readonly sellerId: number;
  readonly categoryId: number;
  readonly productId: number;
  readonly value: any | ISPManipValue;
  readonly reviseReason: string;
  readonly rejectReason: string;
  readonly submitedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ISPCategoryOptionValue {
  readonly id: number;
  readonly valueKr: string;
  readonly valueEn: string;
}

export interface ISPCategoryOption {
  readonly id: number;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly categoryOptionValue: ISPCategoryOptionValue[];
}

export interface ISPCategory {
  readonly id: number;
  readonly parentId: number | null;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly optionList: ISPCategoryOption[];
}

export interface ISPManipCategory {
  readonly id: number;
  readonly nameKr: string;
  readonly nameEn: string;
}

export interface ISPListOfManip {
  readonly id: number;
  readonly action: string | SPManipActionEnum;
  readonly status: string | SPManipStatusEnum;
  readonly category: ISPManipCategory;

  readonly value: any | ISPManipValue;

  readonly submitedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ISPListOfProduct {
  readonly id: number;
  readonly category: ISPManipCategory;
  readonly status: string | SPProductStatusEnum;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly thumbnailUrl: string;
  readonly createdAt: Date;
}

export interface ISProductOptionValue {
  readonly id: number;
  readonly categoryOptionValueId: number;
  readonly extraCharge: number;
}

export interface ISProductOption {
  readonly id: number;
  readonly categoryOptionId: number;
  readonly productOptionValue: ISProductOptionValue[];
}

export interface ISPProductImage {
  readonly id: number;
  readonly url: string;
}

export interface ISPGetProduct {
  readonly id: number;
  readonly categoryId: number;
  readonly status: string | SPProductStatusEnum;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly thumbnailUrl: string;
  readonly price: number;
  readonly createdAt: Date;
  readonly productOption: ISProductOption[];
  readonly productImage: ISPProductImage[];
}
