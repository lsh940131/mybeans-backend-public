import { QuantityPolicy, ValidationResult } from '../../types';

/**
 * 수량 유효성 검증 (최소/최대)
 */
export function validateQuantity(qty: number, policy: QuantityPolicy): ValidationResult {
  const q = Number.isFinite(qty) ? qty : NaN;
  if (!Number.isFinite(q) || q < policy.min || q > policy.max) {
    return { valid: false, reasons: ['QTY_OUT_OF_RANGE'] };
  }

  return { valid: true };
}
