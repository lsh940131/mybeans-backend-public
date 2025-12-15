import {
  SellerApplStatusEnum,
  BankCodeEnum,
  BusinessTypeEnum,
  GenderEnum,
  NationalityEnum,
  OwnerTypeEnum,
} from '../enum/seller-appl.enum';

export interface ISATemp {
  userId: number;
  status: SellerApplStatusEnum;
  step?: number;
  businessNumber?: string;
  storeName?: string;
  businessType?: BusinessTypeEnum;
  businessAddress?: string;
  businessCategory?: string;
  businessItem?: string;
  mailOrderSalesNumber?: string;
  ownerType?: OwnerTypeEnum;
  ownerName?: string;
  ownerBirth?: Date;
  ownerGender?: GenderEnum;
  ownerNationality?: NationalityEnum;
  ownerPhone?: string;
  ownerAddress?: string;
  ownerEmail?: string;
  ownerBankCode?: BankCodeEnum;
  ownerAccount?: string;
  ownerJob?: string;
  shippingName?: string;
  shippingAddress?: string;
  shippingPhone1?: string;
  shippingPhone2?: string;
  returnName?: string;
  returnAddress?: string;
  returnPhone1?: string;
  returnPhone2?: string;
  bankCode?: BankCodeEnum;
  accountHolder?: string;
  accountNumber?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface ISA {
  readonly status: string | SellerApplStatusEnum;
  readonly step: number;
  readonly businessNumber: string;
  readonly storeName: string;
  readonly businessType: string | BusinessTypeEnum;
  readonly businessAddress: string;
  readonly businessCategory: string;
  readonly businessItem: string;
  readonly mailOrderSalesNumber: string;
  readonly ownerType: string | OwnerTypeEnum;
  readonly ownerName: string;
  readonly ownerBirth: Date;
  readonly ownerGender: string | GenderEnum;
  readonly ownerNationality: string | NationalityEnum;
  readonly ownerPhone: string;
  readonly ownerAddress: string;
  readonly ownerEmail: string;
  readonly ownerBankCode: string | BankCodeEnum;
  readonly ownerAccount: string;
  readonly ownerJob: string;
  readonly shippingName: string;
  readonly shippingAddress: string;
  readonly shippingPhone1: string;
  readonly shippingPhone2: string;
  readonly returnName: string;
  readonly returnAddress: string;
  readonly returnPhone1: string;
  readonly returnPhone2: string;
  readonly bankCode: string | BankCodeEnum;
  readonly accountHolder: string;
  readonly accountNumber: string;
  readonly contactName: string;
  readonly contactPhone: string;
  readonly contactEmail: string;
  readonly sellerApplicationFile: ISAFile[];
}

export interface ISAFile {
  readonly id: number;
  readonly url: string;
}
