import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  StatusEnum,
  BankCodeEnum,
  BusinessTypeEnum,
  GenderEnum,
  NationalityEnum,
  OwnerTypeEnum,
} from '../enum/seller-appl-mgmt.enum';
import { ISAM, ISAMFile, ISAMListItem, ISAMUser } from '../interface/seller-appl-mgmt.interface';
import { CommonListPayload } from '../../../../common/payload/list.payload';
import { ApiPropertyEnum } from '../../../../common/decorator/api-property-enum.decorator';

class SAMApplicant {
  constructor(data: ISAMUser) {
    this.id = data.id;
    this.name = data.name;
  }

  @ApiProperty({ description: '아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '이름' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}

export class SAMListItemPayload {
  constructor(data: ISAMListItem, applicant: ISAMUser) {
    this.id = data.id;
    this.status = data.status as StatusEnum;
    this.businessNumber = data.businessNumber;
    this.storeName = data.storeName;
    this.applicant = new SAMApplicant(applicant);
  }

  @ApiProperty({ description: '아이디' })
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @ApiPropertyEnum({ description: '상태', enums: [{ name: 'StatusEnum', enum: StatusEnum }] })
  @IsEnum(StatusEnum)
  readonly status: StatusEnum;

  @ApiProperty({ description: '사업자등록번호' })
  @IsNotEmpty()
  @IsString()
  readonly businessNumber: string;

  @ApiProperty({ description: '상호명' })
  @IsNotEmpty()
  @IsString()
  readonly storeName: string;

  @ApiProperty({ description: '판매자 자격 신청자' })
  readonly applicant: SAMApplicant;
}

export class SAMListPayload extends CommonListPayload<SAMListItemPayload> {
  constructor(count: number, list: SAMListItemPayload[]) {
    super(count, list);
  }
  @ApiProperty({ type: SAMListItemPayload, isArray: true })
  readonly list: SAMListItemPayload[];
}

class SAMFilePayload {
  constructor(data: ISAMFile) {
    this.id = data.id;
    this.url = data.url;
  }

  @ApiProperty({ description: '첨부파일 아이디', default: 1 })
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: '첨부파일 링크', default: 'http://localhost:9001/path' })
  @IsString()
  readonly url: string;
}

export class SAMPayload {
  constructor(data: ISAM) {
    this.status = data.status as StatusEnum;
    this.step = data.step;
    this.businessNumber = data.businessNumber;
    this.storeName = data.storeName;
    this.businessType = data.businessType as BusinessTypeEnum;
    this.businessAddress = data.businessAddress;
    this.businessCategory = data.businessCategory;
    this.businessItem = data.businessItem;
    this.mailOrderSalesNumber = data.mailOrderSalesNumber;
    this.ownerType = data.ownerType as OwnerTypeEnum;
    this.ownerName = data.ownerName;
    this.ownerBirth = data.ownerBirth;
    this.ownerGender = data.ownerGender as GenderEnum;
    this.ownerNationality = data.ownerNationality as NationalityEnum;
    this.ownerPhone = data.ownerPhone;
    this.ownerAddress = data.ownerAddress;
    this.ownerEmail = data.ownerEmail;
    this.ownerBankCode = data.ownerBankCode as BankCodeEnum;
    this.ownerAccount = data.ownerAccount;
    this.ownerJob = data.ownerJob;
    this.shippingName = data.shippingName;
    this.shippingAddress = data.shippingAddress;
    this.shippingPhone1 = data.shippingPhone1;
    this.shippingPhone2 = data.shippingPhone2;
    this.returnName = data.returnName;
    this.returnAddress = data.returnAddress;
    this.returnPhone1 = data.returnPhone1;
    this.returnPhone2 = data.returnPhone2;
    this.bankCode = data.bankCode as BankCodeEnum;
    this.accountHolder = data.accountHolder;
    this.accountNumber = data.accountNumber;
    this.contactName = data.contactName;
    this.contactPhone = data.contactPhone;
    this.contactEmail = data.contactEmail;
    this.applicant = new SAMApplicant(data.user);
    this.fileList = data.sellerApplicationFile?.length
      ? data.sellerApplicationFile.map((v) => new SAMFilePayload(v))
      : [];
  }

  @ApiPropertyEnum({
    description: '상태',
    enums: [{ name: 'StatusEnum', enum: StatusEnum }],
    default: StatusEnum.TEMP,
  })
  @IsEnum(StatusEnum)
  readonly status: StatusEnum;

  @ApiProperty({ description: '데이터 입력 단계', default: 1 })
  @IsNotEmpty()
  @IsNumber()
  readonly step: number;

  // 사업장
  @ApiProperty({
    description: '사업자등록번호 (-) 없이 숫자만 입력',
    default: '0123456789',
  })
  @IsString()
  readonly businessNumber: string;
  @ApiProperty({ description: '상호명', default: 'mybeans' })
  @IsString()
  readonly storeName: string;
  @ApiPropertyEnum({
    description: '법인타입',
    enums: [{ name: 'BusinessTypeEnum', enum: BusinessTypeEnum }],
    default: BusinessTypeEnum.PERSONAL,
  })
  @IsEnum(BusinessTypeEnum)
  readonly businessType: BusinessTypeEnum;
  @ApiProperty({
    description: '사업장 소재지',
    default: '경기도 성남시 분당구 새나리로 25',
  })
  @IsString()
  readonly businessAddress: string;
  @ApiProperty({
    description: '업태, 한국표준산업분류의 대분류(2자리)',
    default: '식료품제조업(10)',
  })
  @IsString()
  readonly businessCategory: string;
  @ApiProperty({
    description: '업종, 국표준산업분류의 세세분류(5자리)',
    default: '커피가공업(10891)',
  })
  @IsString()
  readonly businessItem: string;
  @ApiProperty({
    description: '통신판매업 신고번호 (예: yyyy-지역명-신고순번)',
    default: '2025-서울-1234',
  })
  @IsString()
  readonly mailOrderSalesNumber: string;

  // 대표자
  @ApiPropertyEnum({
    description: '대표자 구성',
    enums: [{ name: 'OwnerTypeEnum', enum: OwnerTypeEnum }],
    default: OwnerTypeEnum.ONE,
  })
  @IsEnum(OwnerTypeEnum)
  readonly ownerType: OwnerTypeEnum;
  @ApiProperty({
    description: '대표자 이름 (휴대폰 본인인증 / 수기 입력 + 인감증명서 필수)',
    default: 'mybeansOwnerName',
  })
  @IsString()
  readonly ownerName: string;
  @ApiProperty({ description: '대표자 생년월일 (예: yyyy-MM-dd)', default: '1994-01-31' })
  @IsDate()
  readonly ownerBirth: Date;
  @ApiPropertyEnum({
    description: '대표자 성별',
    enums: [{ name: 'GenderEnum', enum: GenderEnum }],
    default: GenderEnum.MAN,
  })
  @IsEnum(GenderEnum)
  readonly ownerGender: GenderEnum;
  @ApiPropertyEnum({
    description: '대표자 국적',
    enums: [{ name: 'NationalityEnum', enum: NationalityEnum }],
    default: NationalityEnum.KR,
  })
  @IsEnum(NationalityEnum)
  readonly ownerNationality: NationalityEnum;
  @ApiProperty({
    description:
      '대표자 연락처 (휴대폰 본인인증 / 수기 입력 + 신분증 제출) (- 하이픈 없이 숫자만 입력)',
    default: '01050630131',
  })
  @IsString()
  readonly ownerPhone: string;
  @ApiProperty({ description: '대표자 실거주지', default: '경기도 광주시 고불로 453' })
  @IsString()
  readonly ownerAddress: string;
  @ApiProperty({ description: '대표자 이메일', default: 'ls940131@naver.com' })
  @IsEmail()
  readonly ownerEmail: string;
  @ApiPropertyEnum({
    description: '대표자 은행 코드',
    enums: [{ name: 'BankCodeEnum', enum: BankCodeEnum }],
    default: BankCodeEnum.KBANK,
  })
  @IsEnum(BankCodeEnum)
  readonly ownerBankCode: BankCodeEnum;
  @ApiProperty({
    description: '대표자 계좌번호 (- 하이픈 없이 숫자만 입력)',
    default: '87290104082871',
  })
  @IsString()
  readonly ownerAccount: string;
  @ApiProperty({ description: '대표자 직업', default: '개발자' })
  @IsString()
  readonly ownerJob: string;

  // 출고지
  @ApiProperty({ description: '출고지 이름', default: '출고지_집' })
  @IsString()
  readonly shippingName: string;
  @ApiProperty({ description: '출고지 주소', default: '경기도 광주시 고불로 453' })
  @IsString()
  readonly shippingAddress: string;
  @ApiProperty({ description: '출고지 연락처1', default: '01050630131' })
  @IsString()
  readonly shippingPhone1: string;
  @ApiProperty({ description: '출고지 연락처2', default: null })
  @IsString()
  readonly shippingPhone2: string;

  // 반품/교환지
  @ApiProperty({ description: '반품/교환지 이름', default: '반품/교환지_집' })
  @IsString()
  readonly returnName: string;
  @ApiProperty({ description: '반품/교환지 주소', default: '경기도 광주시 고불로 453' })
  @IsString()
  readonly returnAddress: string;
  @ApiProperty({ description: '반품/교환지 연락처1', default: '01050630131' })
  @IsString()
  readonly returnPhone1: string;
  @ApiProperty({ description: '반품/교환지 연락처2', default: null })
  @IsString()
  readonly returnPhone2: string;

  // 정산
  @ApiPropertyEnum({
    description: '정산 계좌 은행 코드',
    enums: [{ name: 'BankCodeEnum', enum: BankCodeEnum }],
    default: BankCodeEnum.KBANK,
  })
  @IsEnum(BankCodeEnum)
  readonly bankCode: BankCodeEnum;
  @ApiProperty({ description: '계좌주', default: '이상헌' })
  @IsString()
  readonly accountHolder: string;
  @ApiProperty({
    description: '계좌번호 (- 하이픈 없이 숫자만 입력)',
    default: '87290104082871',
  })
  @IsString()
  readonly accountNumber: string;

  // 담당자
  @ApiProperty({ description: '담당자 이름', default: '이상헌' })
  @IsString()
  readonly contactName: string;
  @ApiProperty({ description: '담당자 연락처', default: '01050630131' })
  @IsString()
  readonly contactPhone: string;
  @ApiProperty({ description: '담당자 이메일', default: 'ls940131@naver.com' })
  @IsEmail()
  readonly contactEmail: string;

  // 첨부파일
  @ApiProperty({ description: '첨부파일 리스트', isArray: true, type: SAMFilePayload })
  readonly fileList: SAMFilePayload[];

  // 자격 신청자
  @ApiProperty({ description: '판매자 자격 신청자' })
  readonly applicant: SAMApplicant;
}
