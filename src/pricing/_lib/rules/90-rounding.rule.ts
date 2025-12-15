/**
 * 최종 금액 라운딩(KRW: 정수원) 및 하한 보정
 * - 모든 금액을 소수점 반올림하여 원단위 정수로 고정
 * - 음수 방지(0 미만인 경우 0으로 보정)
 */
import { PricedItem } from '../../types';

export function applyRounding(items: PricedItem[]): PricedItem[] {
  return items.map((v) => {
    const unit = Math.max(0, Math.round(v.unitPrice));
    const total = Math.max(0, Math.round(unit * v.qty));
    return { ...v, unitPrice: unit, totalPrice: total };
  });
}
