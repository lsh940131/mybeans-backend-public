import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  IsNumber,
  Matches,
  IsDate,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';
import {
  BusinessTypeEnum,
  GenderEnum,
  OwnerTypeEnum,
  NationalityEnum,
  BankCodeEnum,
} from '../enum/seller-appl.enum';

export class ApplyTempDto {
  @ApiProperty({ description: '데이터 입력 단계', default: 1 })
  @IsNotEmpty()
  @IsNumber()
  readonly step: number;

  // 사업장
  @ApiPropertyOptional({
    description: '사업자등록번호 (-) 없이 숫자만 입력',
    default: '0123456789',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, {
    message: '사업자등록번호는 숫자만 10자리여야 합니다.',
  })
  readonly businessNumber: string;
  @ApiPropertyOptional({ description: '상호명', default: 'mybeans' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly storeName: string;
  @ApiPropertyOptional({
    description: '법인타입',
    enum: BusinessTypeEnum,
    default: BusinessTypeEnum.PERSONAL,
  })
  @IsOptional()
  @IsString()
  @IsEnum(BusinessTypeEnum)
  readonly businessType: BusinessTypeEnum;
  @ApiPropertyOptional({
    description: '사업장 소재지',
    default: '경기도 성남시 분당구 새나리로 25',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly businessAddress: string;
  @ApiPropertyOptional({
    description: '업태, 한국표준산업분류의 대분류(2자리)',
    default: '식료품제조업(10)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly businessCategory: string;
  @ApiPropertyOptional({
    description: '업종, 국표준산업분류의 세세분류(5자리)',
    default: '커피가공업(10891)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly businessItem: string;
  @ApiPropertyOptional({
    description: '통신판매업 신고번호 (예: yyyy-지역명-신고순번)',
    default: '2025-서울-1234',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^\d{4}-[가-힣A-Za-z]+-\d+$/, {
    message: '통신판매업 신고번호는 yyyy-지역명-숫자 형식이어야 합니다.',
  })
  readonly mailOrderSalesNumber: string;

  // 대표자
  @ApiPropertyOptional({
    description: '대표자 구성',
    enum: OwnerTypeEnum,
    default: OwnerTypeEnum.ONE,
  })
  @IsOptional()
  @IsString()
  @IsEnum(OwnerTypeEnum)
  readonly ownerType: OwnerTypeEnum;
  @ApiPropertyOptional({
    description: '대표자 이름 (휴대폰 본인인증 / 수기 입력 + 인감증명서 필수)',
    default: 'mybeansOwnerName',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly ownerName: string;
  @ApiPropertyOptional({ description: '대표자 생년월일 (예: yyyy-MM-dd)', default: '1994-01-31' })
  @IsOptional()
  @IsDate()
  readonly ownerBirth: Date;
  @ApiPropertyOptional({ description: '대표자 성별', enum: GenderEnum, default: GenderEnum.MAN })
  @IsOptional()
  @IsString()
  @IsEnum(GenderEnum)
  readonly ownerGender: GenderEnum;
  @ApiPropertyOptional({
    description: '대표자 국적',
    enum: NationalityEnum,
    default: NationalityEnum.KR,
  })
  @IsOptional()
  @IsString()
  @IsEnum(NationalityEnum)
  readonly ownerNationality: NationalityEnum;
  // 아래 owner 정보는 마지막에 추가 입력하도록 구성
  @ApiPropertyOptional({
    description:
      '대표자 연락처 (휴대폰 본인인증 / 수기 입력 + 신분증 제출) (- 하이픈 없이 숫자만 입력)',
    default: '01050630131',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\d+$/, {
    message: '연락처는 숫자만 입력해야 합니다.',
  })
  readonly ownerPhone: string;
  @ApiPropertyOptional({ description: '대표자 실거주지', default: '경기도 광주시 고불로 453' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly ownerAddress: string;
  @ApiPropertyOptional({ description: '대표자 이메일', default: 'ls940131@naver.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(300)
  readonly ownerEmail: string;
  @ApiPropertyOptional({
    description: '대표자 은행 코드',
    enum: BankCodeEnum,
    default: BankCodeEnum.KBANK,
  })
  @IsOptional()
  @IsString()
  @IsEnum(BankCodeEnum)
  readonly ownerBankCode: BankCodeEnum;
  @ApiPropertyOptional({
    description: '대표자 계좌번호 (- 하이픈 없이 숫자만 입력)',
    default: '87290104082871',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^\d+$/, {
    message: '계좌번호는 숫자만 입력해야 합니다.',
  })
  readonly ownerAccount: string;
  @ApiPropertyOptional({ description: '대표자 직업', default: '개발자' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly ownerJob: string;

  // 출고지
  @ApiPropertyOptional({ description: '출고지 이름', default: '출고지_집' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly shippingName: string;
  @ApiPropertyOptional({ description: '출고지 주소', default: '경기도 광주시 고불로 453' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly shippingAddress: string;
  @ApiPropertyOptional({ description: '출고지 연락처1', default: '01050630131' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\d+$/, {
    message: '연락처는 숫자만 입력해야 합니다.',
  })
  readonly shippingPhone1: string;
  @ApiPropertyOptional({ description: '출고지 연락처2', default: null })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\d+$/, {
    message: '연락처는 숫자만 입력해야 합니다.',
  })
  readonly shippingPhone2: string;

  // 반품/교환지
  @ApiPropertyOptional({ description: '반품/교환지 이름', default: '반품/교환지_집' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly returnName: string;
  @ApiPropertyOptional({ description: '반품/교환지 주소', default: '경기도 광주시 고불로 453' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly returnAddress: string;
  @ApiPropertyOptional({ description: '반품/교환지 연락처1', default: '01050630131' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\d+$/, {
    message: '연락처는 숫자만 입력해야 합니다.',
  })
  readonly returnPhone1: string;
  @ApiPropertyOptional({ description: '반품/교환지 연락처2', default: null })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\d+$/, {
    message: '연락처는 숫자만 입력해야 합니다.',
  })
  readonly returnPhone2: string;

  // 정산
  @ApiPropertyOptional({
    description: '정산 계좌 은행 코드',
    enum: BankCodeEnum,
    default: BankCodeEnum.KBANK,
  })
  @IsOptional()
  @IsString()
  @IsEnum(BankCodeEnum)
  readonly bankCode: BankCodeEnum;
  @ApiPropertyOptional({ description: '계좌주', default: '이상헌' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly accountHolder: string;
  @ApiPropertyOptional({
    description: '계좌번호 (- 하이픈 없이 숫자만 입력)',
    default: '87290104082871',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^\d+$/, {
    message: '계좌번호는 숫자만 입력해야 합니다.',
  })
  readonly accountNumber: string;

  // 담당자
  @ApiPropertyOptional({ description: '담당자 이름', default: '이상헌' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly contactName: string;
  @ApiPropertyOptional({ description: '담당자 연락처', default: '01050630131' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\d+$/, {
    message: '연락처는 숫자만 입력해야 합니다.',
  })
  readonly contactPhone: string;
  @ApiPropertyOptional({ description: '담당자 이메일', default: 'ls940131@naver.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(300)
  readonly contactEmail: string;

  // 첨부파일
  @ApiPropertyOptional({ description: '첨부파일 업로드 URL 리스트' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  readonly uploadFileList: string[];
  @ApiPropertyOptional({ description: '첨부파일 삭제 아이디 리스트' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly deleteFileList: number[];
}
