export enum SPMManipActionEnum {
  CREATE = 'C',
  UPDATE = 'U',
  DELETE = 'D',
}

export enum SPMManipStatusEnum {
  TEMP = 'A', // 임시저장
  SUBMIT = 'B', // 제출완료
  REVISE = 'C', // 수정요청
  APPROVAL = 'D', // 승인
  REJECT = 'E', // 거절
}

export enum SPMManipStatusHangulEnum {
  'A' = '임시저장',
  'B' = '제출완료',
  'C' = '수정요청',
  'D' = '승인',
  'E' = '거절',
}

export enum SPMManipStatusMgmtEnum {
  REVISE = 'C', // 수정요청
  APPROVAL = 'D', // 승인
  REJECT = 'E', // 거절
}

export enum SPMProductStatusEnum {
  ON = 'A', // 판매중
  OFF = 'B', // 판매중단
}
