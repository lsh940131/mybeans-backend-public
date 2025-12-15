/**
 * 각 아이템의 unitPrice와 shippingFee를 기본가로 초기화
 */

import { Item, PricingData, PricedItem } from '../../types';

export function applyBasePrice(items: Item[], data: PricingData): PricedItem[] {
  return items.map((v) => {
    const base = data.basePriceMap.get(v.productId) ?? 0;
    const unit = base; // 기본값

    const shippingFee = data.shippingFeeMap.get(v.productId) ?? 0;
    return {
      productId: v.productId,
      qty: v.qty,
      optionValueIdList: v.optionValueIdList,
      unitPrice: unit,
      totalPrice: unit * v.qty,
      shippingFee: shippingFee,
      purchasable: base >= 0,
      messages: base >= 0 ? [] : ['기본가가 유효하지 않습니다.'],
      discounts: [],
    };
  });
}
