/**
 * 배치 검증 orchestrator
 * - 제품 스냅샷 맵과 정책을 받아 items[]를 일괄 유효성 검사
 */

import {
  BatchValidationResult,
  invalidItem,
  Item,
  ProductSnapshot,
  ValidationPolicies,
} from '../../types';
import { validateAvailability } from './availability';
import { validateQuantity } from './quantity';
import { validateOptionSelection } from './option-selection';
import { defaultPolicies, mergePolicies } from './policies';

/**
 * 유효성 검사
 * @param items   장바구니/결제 후보 아이템 목록
 * @param productMap  productId -> ProductSnapshot
 * @param policies    수량/가용성/옵션 정책
 */
export function validateItems(
  items: Item[],
  productMap: Map<number, ProductSnapshot>,
  policiesOpt?: Partial<ValidationPolicies>,
): BatchValidationResult {
  const base = defaultPolicies();
  const policies = mergePolicies(base, policiesOpt);

  const validItems: Item[] = [];
  const invalidItems: invalidItem[] = [];

  for (const it of items) {
    const product = productMap.get(it.productId);

    const r1 = validateAvailability(product, policies.availability);
    if (r1.valid == false) {
      invalidItems.push({ ...it, reasons: r1.reasons });
      continue;
    }

    const r2 = validateQuantity(it.qty, policies.quantity);
    if (r2.valid == false) {
      invalidItems.push({ ...it, reasons: r2.reasons });
      continue;
    }

    const r3 = validateOptionSelection(product!, it.optionValueIdList, policies.option);
    if (r3.valid == false) {
      invalidItems.push({ ...it, reasons: r3.reasons });
      continue;
    }

    validItems.push(it);
  }

  return { validItems, invalidItems };
}
