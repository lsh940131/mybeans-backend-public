/**
 * 규칙들을 순서대로 적용하여 견적 생성
 * - 프레임워크/DB 의존 없음 (순수 함수)
 * - 사전 조건: 라인아이템 유효성은 validators에서 통과된 것만 입력
 * - 향후 할인룰을 중간 단계에 추가
 */

import {
  Item,
  PricingContext,
  PricingData,
  PricingPolicies,
  SellerSubtotalResult,
} from '../../types';
import { applyBasePrice } from './10-base.rule';
import { applyOptionExtras } from './20-options.rule';
import { applyRounding } from './90-rounding.rule';
import { applySubtotal } from './99-subtotal.rule';
import { defaultPricingPolicies, mergePricingPolicies } from './policies';

export function buildQuote(
  items: Item[],
  ctx: PricingContext,
  data: PricingData,
  policiesOpt?: Partial<PricingPolicies>,
): SellerSubtotalResult {
  // 0. 정책 병합: 기본값 + 부분 오버라이드
  const policies = mergePricingPolicies(defaultPricingPolicies(), policiesOpt);

  // 1. 기본가
  let priced = applyBasePrice(items, data);

  // 2. 옵션 추가금
  priced = applyOptionExtras(priced, data);

  // 9. 라운딩
  priced = applyRounding(priced);

  // 99. 최종 합계
  return applySubtotal(priced, data);
}
