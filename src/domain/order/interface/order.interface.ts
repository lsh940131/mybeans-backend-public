// https://docs.tosspayments.com/reference#payment-%EA%B0%9D%EC%B2%B4 기반 요약
export interface ITossPaymentApproveResponse {
  // 공통 메타
  version: string; // 응답 버전
  paymentKey: string; // 결제 키 (토스 고유 ID)
  orderId: string; // 우리가 넘긴 orderId
  orderName: string;
  status:
    | 'READY'
    | 'IN_PROGRESS'
    | 'WAITING_FOR_DEPOSIT'
    | 'DONE'
    | 'CANCELED'
    | 'PARTIAL_CANCELED'
    | 'EXPIRED'
    | 'ABORTED';
  requestedAt: string; // ISO8601
  approvedAt: string | null; // 결제 승인일시

  // 금액 정보
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number | null;
  taxFreeAmount: number;
  taxExemptionAmount: number;

  // 통화
  currency: string; // "KRW" 등

  // 결제수단
  method: '카드' | '가상계좌' | '간편결제' | '휴대폰' | '계좌이체' | '상품권' | string;

  // 카드 결제일 경우
  card?: {
    issuerCode: string; // 카드 발급사 코드
    acquirerCode: string; // 카드 매입사 코드
    number: string; // 카드 번호 (마스킹)
    installmentPlanMonths: number;
    isInterestFree: boolean;
    approveNo: string;
    cardType: string | null;
    ownerType: string | null;
  };

  // 계좌이체, 간편결제 등은 생략 가능
  // transfer?: { ... }
  // virtualAccount?: { ... }
  // mobilePhone?: { ... }
  // giftCertificate?: { ... }
  // easyPay?: { ... }

  // 영수증
  receipt?: {
    url: string;
  };

  // 취소 내역들
  cancels?: {
    cancelAmount: number;
    taxFreeAmount: number;
    taxExemptionAmount: number;
    refundableAmount: number;
    canceledAt: string; // ISO
    cancelReason: string | null;
    // 기타 필드는 필요시 raw에 넣어도 됨
  }[];

  // 그 외 필드들 (need 시 통째로 rawApprovePayload에 저장)
  // [key: string]: any;
}

export interface IOrderProduct {
  productId: number;
  qty: number;
  optionValueIds: string;
  price: number;
  totalPrice: number;
  shipmentReqMsg: string | null;
}

export interface IOCShipmentItem {
  key: string;
  shipmentReqMsg?: string | null;
}

export interface IOCShipment {
  receiverName: string;
  phone: string;
  address: string;
  addressDetail?: string | null;
  postcode?: string | null;
  items: IOCShipmentItem[];
}
