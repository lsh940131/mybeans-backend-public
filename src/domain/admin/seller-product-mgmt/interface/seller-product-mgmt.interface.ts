import {
  SPMManipActionEnum,
  SPMManipStatusEnum,
  SPMProductStatusEnum,
} from '../enum/seller-product-mgmt.enum';

export interface ISPMSeller {
  readonly id: number;
  readonly name: string;
}

export interface ISPMCategory {
  readonly id: number;
  readonly nameKr: string;
  readonly nameEn: string;
}

export interface ISPMManipListItem {
  readonly id: number;
  readonly action: string | SPMManipActionEnum;
  readonly status: string | SPMManipStatusEnum;
  readonly seller: ISPMSeller;
  readonly category: ISPMCategory;
}

export interface ISPMCategoryOptionValue {
  readonly categoryOptionValueId: number;
  readonly extraCharge: number;
}

export interface ISPMCategoryOption {
  readonly categoryOptionId: number;
  readonly categoryOptionValueList: ISPMCategoryOptionValue[];
}

export interface ISPMManipValue {
  readonly status: string | SPMProductStatusEnum;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly thumbnailUrl: string;
  readonly price: number;
  readonly shippingFee: number;
  readonly optionList: ISPMCategoryOption[];
  readonly imageList: string[];
}

export interface ISPMEvaluator {
  readonly id: number;
  readonly name: string;
}

export interface ISPMManip {
  readonly id: number;
  readonly action: string | SPMManipActionEnum;
  readonly status: string | SPMManipStatusEnum;
  readonly sellerId: number;
  readonly categoryId: number;
  readonly productId: number;
  readonly value: any | ISPMManipValue;
  readonly reviseReason: string;
  readonly rejectReason: string;
  readonly submitedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  readonly user: ISPMEvaluator;
  readonly evaluatedAt: Date;
}

export interface ISPMEvaluateApprovalCreation {
  readonly categoryId: number;
  readonly sellerId: number;
  readonly value: ISPMManipValue;
}

export interface ISPMEvaluateApprovalUpdate {
  readonly productId: number;
  readonly categoryId: number;
  readonly value: ISPMManipValue;
}

export interface ISPMEvaluateApprovalDeletion {
  readonly productId: number;
}
