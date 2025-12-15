export type Item = {
  productId: number;
  qty: number;
  optionValueIdList: number[];
};

export enum ProductStatusEnum {
  ON = 'A', // 판매중
  OFF = 'B', // 판매중단
}

export type OptionValueSnapshot = {
  id: number;
};

export type OptionSnapshot = {
  id: number;
  isRequired: boolean;
  productOptionValue: OptionValueSnapshot[];
};

export type ProductSnapshot = {
  id: number;
  status: ProductStatusEnum | string;
  deletedAt: Date | null;
  productOption: OptionSnapshot[];
};

export type ValidationIssue =
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_OFF'
  | 'PRODUCT_DELETED'
  | 'SALE_WINDOW_CLOSED'
  | 'QTY_OUT_OF_RANGE'
  | 'DUPLICATE_OPTION_VALUE'
  | 'REQUIRED_OPTION_MISSING'
  | 'REQUIRED_OPTION_TOO_MANY'
  | 'OPTION_VALUE_NOT_BELONGS';

export type ValidationResult =
  | { valid: true }
  | { valid: false; reasons?: ValidationIssue[]; message?: string };

export type invalidReasons = {
  reasons: ValidationIssue[];
};
export type invalidItem = Item & invalidReasons;

export type BatchValidationResult = {
  validItems: Item[];
  invalidItems: invalidItem[];
};

/** 수량 정책(필요 시 확장) */
export type QuantityPolicy = {
  min: number; // 기본 1
  max: number; // 기본 99
};

/** 가용성 정책(판매기간 등 필요 시 확장) */
export type AvailabilityPolicy = {
  now: number; // Date.now()
};

/** 옵션 검증 정책(확장 포인트) */
export type OptionPolicy = {
  // 옵션 1개에 값 1개만 허용(복수 선택 옵션을 도입하면 false로)
  oneValuePerOption: boolean; // 기본 true
};

export type ValidationPolicies = {
  quantity: QuantityPolicy;
  availability: AvailabilityPolicy;
  option: OptionPolicy;
};

export type PricingContext = {
  /** 게스트/회원 등 정책 구분이 필요할 때 사용 */
  userType?: 'guest' | 'member';
  /** 통화 (초기엔 KRW 고정) */
  currency?: 'KRW';
  /** 서버 시각(밀리초) — 라운딩/정책 버전 스탬핑용 */
  now: number;
  /** (미래 확장) 쿠폰 코드, 배송방법, 지역 등 */
  couponCodes?: string[];
  shippingMethod?: string;
  region?: string;
};

export type PricingData = {
  // productId -> product.price
  basePriceMap: Map<number, number>;
  // optionValueId -> product_option_value.extra_charge
  extraChargeMap: Map<number, number>;
  // productId -> product.shipping_fee
  shippingFeeMap: Map<number, number>;
  // productId -> {seller.id, seller.free_shipping_threshold}
  sellerFreeShippingMap: Map<number, { id: number; name: string; freeShippingThreshold: number }>;
};

export type PricedItem = {
  productId: number;
  qty: number;
  optionValueIdList: number[];
  // 옵션가 포함 단가
  unitPrice: number;
  // 총액(unitPrice * qty)
  totalPrice: number;
  // 배송비
  shippingFee: number;
  // 구매 가능 여부 (사전 검증을 통과한 경우 일반적으로 true)
  purchasable: boolean;
  // 경고/안내 메시지 (옵션)
  message?: string[];
  // (미래 확장) 할인 브레이크다운 등
  discounts?: Array<{ key: string; amount: number }>;
};

export type RoundingPolicy = {
  /** KRW 정수 라운딩 여부 (기본 true) */
  krwInteger: boolean;
};

export type DiscountPolicy = {
  /** (미래) 스태킹/우선순위 등 */
};

export type ShippingPolicy = {
  /** (미래) 기본 배송비/무료 조건 등 */
};

export type PricingPolicies = {
  rounding: RoundingPolicy;
  discount?: DiscountPolicy;
  shipping?: ShippingPolicy;
};

export type SellerSubtotal = {
  sellerId: number;
  sellerName: string;
  merchandiseSubtotal: number; // 주문금액 합계
  freeShippingThreshold: number | null; // 판매자 무료배송충족금액
  shippingFeeSubtotal: number; // 최종 청구 배송비
  freeApplied: boolean; // 무료배송 적용 여부
  items: PricedItem[]; // 판매자의 상품들
};

export type SellerSubtotalResult = {
  subtotalMerchandise: number; // 전체 상품주문금액 합계
  subtotalShippingFee: number; // 전체 상품배송비 합계
  list: SellerSubtotal[];
};

export type ProductAdditionalInfo = {
  id: number;
  status: string;
  nameKr: string;
  nameEn: string;
  thumbnailUrl: string;
  price: number;
  shippingFee: number;
  productOption: {
    id: number;
    isRequired: boolean;
    categoryOption: {
      nameKr: string;
      nameEn: string;
    };
    productOptionValue: {
      id: number;
      extraCharge: number;
      categoryOptionValue: {
        valueKr: string;
        valueEn: string;
      };
    }[];
  }[];
};

export type PricedItemWithProduct = PricedItem & { product: ProductAdditionalInfo };

// SellerSubtotal의 items만 교체
export type SellerSubtotalWithProduct = Omit<SellerSubtotal, 'items'> & {
  items: PricedItemWithProduct[];
};

// 결과 타입도 list만 교체
export type SellerSubtotalResultWithProduct = Omit<SellerSubtotalResult, 'list'> & {
  invalidItems: invalidItem[];
  list: SellerSubtotalWithProduct[];
};
