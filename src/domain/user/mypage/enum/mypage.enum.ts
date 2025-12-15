// 주문 상품의 결제 상태 (toss 응답 + 커스텀)
export enum MypageOrderProductStatusEnum {
  'READY' = 'READY',
  'IN_PROGRESS' = 'IN_PROGRESS',
  'WAITING_FOR_DEPOSIT' = 'WAITING_FOR_DEPOSIT',
  'DONE' = 'DONE',
  'CANCELED' = 'CANCELED',
  'RETURNED' = 'RETURNED', // 커스텀 = 취소 이후 시나리오
  'EXCHANGED' = 'EXCHANGED', // 커스텀 = 취소 이후 시나리오
  'PARTIAL_CANCELED' = 'PARTIAL_CANCELED',
  'EXPIRED' = 'EXPIRED',
  'ABORTED' = 'ABORTED',
}

export enum MypageOrderMethodEnum {
  'CARD' = '카드',
  'VIRTUAL_ACCOUNT' = '가상계좌',
  'SIMPLE_PAY' = '간편결제',
  'PHONE' = '휴대폰',
  'ACCOUNT' = '계좌이체',
  'GIFT_CARD' = '상품권',
}

// shipment_product.status 값
export enum MypageShipmentProductStatusEnum {
  'DELIVERY_PREPARING' = 'A',
  'SHIPPED' = 'B',
  'DELIVERY_IN_PROGRESS' = 'C',
  'DELIVERY_COMPLETED' = 'D',
}
