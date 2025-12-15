import {
  BankCodeEnum,
  BusinessTypeEnum,
  GenderEnum,
  NationalityEnum,
  OwnerTypeEnum,
  StatusEnum,
} from '../enum/seller-appl-mgmt.enum';

export interface ISAMUser {
  readonly id: number;
  readonly name: string;
}

export interface ISAMListItem {
  readonly id: number;
  readonly status: string | StatusEnum;
  readonly businessNumber: string;
  readonly storeName: string;
}

export interface ISAM {
  readonly status: string | StatusEnum;
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
  readonly user: ISAMUser;
  readonly sellerApplicationFile: ISAMFile[];
}

export interface ISAMFile {
  readonly id: number;
  readonly url: string;
}
