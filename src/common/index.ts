/**
 * 생성일(createdAt), 수정일(updatedAt) 중 큰 값으로 정렬
 */
type OrderDirection = 'asc' | 'desc';
type HasTimestamps = {
  createdAt: Date | string;
  updatedAt?: Date | string | null;
};
export function orderByLatestTimestamp<T extends HasTimestamps>(
  list: readonly T[],
  direction: OrderDirection = 'desc',
): T[] {
  if (list.length == 0) return [];

  const dir = direction === 'asc' ? 1 : -1;

  const toTime = (value: Date | string | null | undefined): number => {
    if (!value) return 0;
    return value instanceof Date ? value.getTime() : new Date(value).getTime();
  };

  return [...list].sort((a, b) => {
    const aLatest = Math.max(toTime(a.createdAt), toTime(a.updatedAt ?? null));
    const bLatest = Math.max(toTime(b.createdAt), toTime(b.updatedAt ?? null));

    if (aLatest === bLatest) return 0;
    return aLatest > bLatest ? dir : -dir;
  });
}

/**
 * 두 배열의 요소들이 같은 집합인지 비교
 * - 순서는 무시
 * - 길이와 요소가 모두 같아야 true
 */
export function isSameArray(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;

  const setA = new Set(a);
  if (setA.size !== a.length) {
    return false;
  }

  for (const id of b) {
    if (!setA.has(id)) return false;
  }
  return true;
}

/**
 * mysql 시간 조회를 위한 시작시간 반환
 */
export function convertStartDate(startDate: Date): Date {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  return start;
}

/**
 * mysql 시간 조회를 위한 종료시간 반환
 */
export function convertEndDate(endDate: Date): Date {
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);

  return end;
}
