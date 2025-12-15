/**
 * validators에서 사용하는 정책 기본값/병합 유틸을 모듈
 */

import { ValidationPolicies, AvailabilityPolicy, OptionPolicy, QuantityPolicy } from '../../types';

/** 실행 시점 now를 반영한 기본 정책 생성 */
export function defaultPolicies(now: number = Date.now()): ValidationPolicies {
  return {
    quantity: { min: 1, max: 99 },
    availability: { now },
    option: { oneValuePerOption: true },
  };
}

/**
 * 얕은 Partial 병합 유틸(중첩 프로퍼티까지 안전 병합)
 * - 필요할 때만 일부 정책을 덮어쓸 수 있음
 */
export function mergePolicies(
  base: ValidationPolicies,
  override?: Partial<ValidationPolicies>,
): ValidationPolicies {
  if (!override) return base;
  return {
    quantity: { ...base.quantity, ...(override.quantity ?? {}) },
    availability: { ...base.availability, ...(override.availability ?? {}) },
    option: { ...base.option, ...(override.option ?? {}) },
  };
}
