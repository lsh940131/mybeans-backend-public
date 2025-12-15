/**
 * 선택된 옵션값의 추가금을 합산하여 단가(unitPrice)에 가산
 * 옵션 선택 유효성은 사전 validator에서 통과됨을 전제
 */
import { PricingData, PricedItem } from '../../types';

export function applyOptionExtras(priced: PricedItem[], data: PricingData): PricedItem[] {
  return priced.map((v): PricedItem => {
    if (v.purchasable) {
      const extras = v.optionValueIdList.reduce((acc, cur) => {
        return acc + (data.extraChargeMap.get(cur) ?? 0);
      }, 0);

      const unit = v.unitPrice + extras;
      const total = unit * v.qty;

      return {
        ...v,
        unitPrice: unit,
        totalPrice: total,
      };
    } else {
      return v;
    }
  });
}
