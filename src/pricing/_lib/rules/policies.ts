/**
 * 엔진 정책 기본값과 부분 오버라이드 병합 유틸
 */

import { PricingPolicies } from '../../types';

export function defaultPricingPolicies(): PricingPolicies {
  return {
    rounding: { krwInteger: true },
    // discount/shipping/tax는 지금은 비워둠 (추후 도입 시 here)
  };
}

/** 얕은 병합: 필요한 영역만 부분 오버라이드 */
export function mergePricingPolicies(
  base: PricingPolicies,
  override?: Partial<PricingPolicies>,
): PricingPolicies {
  if (!override) return base;
  return {
    rounding: { ...base.rounding, ...(override.rounding ?? {}) },
    discount: { ...(base.discount ?? {}), ...(override.discount ?? {}) },
    shipping: { ...(base.shipping ?? {}), ...(override.shipping ?? {}) },
  };
}
