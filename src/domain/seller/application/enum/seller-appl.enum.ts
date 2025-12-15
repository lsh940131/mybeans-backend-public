export enum SellerApplStatusEnum {
  TEMP = 'A', // 임시저장
  SUBMIT = 'B', // 제출완료
  REVISE = 'C', // 수정요청
  APPROVAL = 'D', // 승인
  REJECT = 'E', // 거절
}

export enum BusinessTypeEnum {
  PERSONAL = 'A', // 개인
  LEGAL = 'B', // 법인
}

export enum OwnerTypeEnum {
  ONE = 'A', // 1인
  JOIN = 'B', // 공동
}

export enum GenderEnum {
  MAN = 'M',
  WOMAN = 'W',
}

export enum NationalityEnum {
  KR = 'A',
  ETC = 'B',
}

// 토스페이먼츠 은행코드 https://docs.tosspayments.com/codes/org-codes#%EC%9D%80%ED%96%89-%EC%BD%94%EB%93%9C 참조
// 금융결제원 공식 코드값 사용
export enum BankCodeEnum {
  KYONGNAMBANK = '039', // 경남
  GWANGJUBANK = '034', // 광주
  LOCALNONGHYEOP = '012', // 단위농협
  BUSANBANK = '032', // 부산
  SAEMAUL = '045', // 새마을
  SANLIM = '064', // 산림
  SHINHAN = '088', // 신한
  SHINHYEOP = '048', // 신협
  CITI = '027', // 씨티
  WOORI = '020', // 우리
  POST = '071', // 우체국
  SAVINGBANK = '050', // 저축
  JEONBUKBANK = '037', // 전북
  JEJUBANK = '035', // 제주
  KAKAOBANK = '090', // 카카오
  KBANK = '089', // 케이
  TOSSBANK = '092', // 토스
  HANA = '081', // 하나
  HSBC = '054', // 홍콩상하이은행
  IBK = '003', // 기업
  KOOKMIN = '004', // 국민
  DAEGUBANK = '031', // 대구
  KDBBANK = '002', // 산업
  NONGHYEOP = '011', // 농협
  SC = '023', // SC제일
  SUHYEOP = '007', // 수협
}
