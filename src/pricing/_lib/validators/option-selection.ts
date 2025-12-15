import { OptionPolicy, ProductSnapshot, ValidationResult, ValidationIssue } from '../../types';

/**
 * 단일 상품에 대한 옵션 선택 유효성 검증
 * @param product 스냅샷(옵션/옵션값 트리)
 * @param selectedOptionValueIds 사용자가 선택한 옵션값 ID 목록
 * @param policy 옵션 검증 정책(oneValuePerOption 등)
 */
export function validateOptionSelection(
  product: ProductSnapshot | undefined,
  selectedOptionValueIds: number[],
  policy: OptionPolicy,
): ValidationResult {
  if (!product) {
    return { valid: false, reasons: ['PRODUCT_NOT_FOUND'] };
  }

  const reasons: ValidationIssue[] = [];

  // 1) 중복 값 방지
  const unique = new Set(selectedOptionValueIds);
  if (unique.size !== selectedOptionValueIds.length) {
    reasons.push('DUPLICATE_OPTION_VALUE');
  }

  // 2) 빠른 조회를 위한 맵 구성: valueId -> optionId
  const valueToOption = new Map<number, number>();
  for (const opt of product.productOption) {
    for (const v of opt.productOptionValue) {
      valueToOption.set(v.id, opt.id);
    }
  }

  // 3) 존재하지 않는 옵션값(소속 아님)
  for (const id of selectedOptionValueIds) {
    if (!valueToOption.has(id)) {
      reasons.push('OPTION_VALUE_NOT_BELONGS');
      break;
    }
  }

  // 4) 필수 옵션 충족 & 옵션당 허용 선택 수 검사
  //    (oneValuePerOption=true 일 때 각 옵션별 선택 최대 1개)
  const optionIdToCount = new Map<number, number>();
  for (const id of unique) {
    const optionId = valueToOption.get(id);
    if (optionId != null) {
      optionIdToCount.set(optionId, (optionIdToCount.get(optionId) ?? 0) + 1);
    }
  }

  for (const opt of product.productOption) {
    const count = optionIdToCount.get(opt.id) ?? 0;

    if (opt.isRequired && count === 0) {
      reasons.push('REQUIRED_OPTION_MISSING');
    }
    if (policy.oneValuePerOption && count > 1) {
      reasons.push('REQUIRED_OPTION_TOO_MANY');
    }
  }

  if (reasons.length > 0) return { valid: false, reasons };
  return { valid: true };
}
