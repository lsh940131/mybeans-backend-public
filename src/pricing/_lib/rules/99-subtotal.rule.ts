import { PricedItem, PricingData, SellerSubtotal, SellerSubtotalResult } from '../../types';

type SellerId = number;

/**
 * 판매자 별로 상품 및 배송비 합계
 * - 배송비 합계 시 주문금액합계가 무료배송금액 미만이라면 가장 비싼 배송비 한 건만 적용, 초과한다면 배송비합계는 0원
 * - TODO: 가장 비싼 배송비 한 건만 적용하고 item의 shippingFee는 값을 건들지 말고, sellerSubtotal에 필드 하나 추가해서 해당 판매자의 상품들의 배송비를 반환 -> 이 값과 freeApplied 값을 참조해서 front에서 처리할 것
 */
export function applySubtotal(priced: PricedItem[], data: PricingData): SellerSubtotalResult {
  // 판매자별 상품 및 정보맵 구성
  const sellerMap = new Map<
    SellerId,
    {
      sellerName: string;
      threshold: number | null;
      entries: Array<{ idx: number; ref: PricedItem }>;
    }
  >();

  for (let idx = 0, len = priced.length; idx < len; idx++) {
    const ref = priced[idx];
    const sellerInfo = data.sellerFreeShippingMap.get(ref.productId);
    const sellerId = sellerInfo.id;
    const sellerName = sellerInfo.name;
    const threshold = sellerInfo?.freeShippingThreshold;

    const bucket = sellerMap.get(sellerId);
    if (bucket) {
      bucket.entries.push({ idx, ref });
    } else {
      sellerMap.set(sellerId, { sellerName, threshold, entries: [{ idx, ref }] });
    }
  }

  // 판매자별 주문금액, 배송비 합계
  const sellerSubtotal: SellerSubtotal[] = [];
  let subtotalMerchandise = 0;
  let subtotalShippingFee = 0;
  for (const [sellerId, bucket] of sellerMap) {
    const entries = bucket.entries;
    const merchandiseSubtotal = entries.reduce((acc, cur) => acc + cur.ref.totalPrice, 0);

    const sellerName = bucket.sellerName;
    const threshold = bucket.threshold;
    const freeApplied = threshold && threshold <= merchandiseSubtotal;

    let shippingFeeSubtotal = 0;
    let pickedIndex: number | null;

    // 청구 배송비가 가장 큰 1건 선택
    const pickedEntry = entries.reduce<{ idx: number; ref: PricedItem } | null>((best, cur) => {
      if (!best) return cur;
      return cur.ref.shippingFee > best.ref.shippingFee ? cur : best;
    }, null);

    const pickedShippingFee = Math.max(0, pickedEntry?.ref.shippingFee ?? 0);

    if (pickedEntry) {
      pickedEntry.ref.shippingFee = pickedShippingFee;
      shippingFeeSubtotal = pickedShippingFee;
      pickedIndex = pickedEntry.idx;
    }

    shippingFeeSubtotal = freeApplied ? 0 : shippingFeeSubtotal;
    sellerSubtotal.push({
      sellerId,
      sellerName,
      freeShippingThreshold: threshold,
      merchandiseSubtotal,
      shippingFeeSubtotal,
      freeApplied,
      items: entries.map((e) => e.ref),
    });

    subtotalMerchandise += merchandiseSubtotal;
    subtotalShippingFee += shippingFeeSubtotal;
  }

  return {
    subtotalMerchandise,
    subtotalShippingFee,
    list: sellerSubtotal,
  };
}
