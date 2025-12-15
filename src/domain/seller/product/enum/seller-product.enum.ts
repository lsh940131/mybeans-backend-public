export enum SPManipActionEnum {
  CREATE = 'C',
  UPDATE = 'U',
  DELETE = 'D',
}

export enum SPManipStatusEnum {
  TEMP = 'A', // 임시저장
  SUBMIT = 'B', // 제출완료
  REVISE = 'C', // 수정요청
  APPROVAL = 'D', // 승인
  REJECT = 'E', // 거절
}

export enum SPManipStatusHangulEnum {
  'A' = '임시저장',
  'B' = '제출완료',
  'C' = '수정요청',
  'D' = '승인',
  'E' = '거절',
}

export enum SPProductStatusEnum {
  ON = 'A', // 판매중
  OFF = 'B', // 판매중단
}
