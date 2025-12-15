import {
  AvailabilityPolicy,
  ProductSnapshot,
  ProductStatusEnum,
  ValidationResult,
} from '../../types';

/**
 * 상품이 구매 가능한 상태인지 검사
 * - 유효 여부
 * - 삭제 여부
 * - 판매 상태 체크
 */
export function validateAvailability(
  product: ProductSnapshot | undefined,
  policy: AvailabilityPolicy,
): ValidationResult {
  if (!product) return { valid: false, reasons: ['PRODUCT_NOT_FOUND'] };
  if (product.deletedAt) return { valid: false, reasons: ['PRODUCT_DELETED'] };
  if (product.status !== ProductStatusEnum.ON) return { valid: false, reasons: ['PRODUCT_OFF'] };

  return { valid: true };
}
