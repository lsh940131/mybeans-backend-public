export interface ICategoryNode {
  readonly id: number;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly children: ICategoryNode[];
}

export interface ICategoryOptionValue {
  readonly id: number;
  readonly valueKr: string;
  readonly valueEn: string;
}

export interface ICategoryOption {
  readonly id: number;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly categoryOptionValue: ICategoryOptionValue[];
}

export interface ICategory {
  readonly id: number;
  readonly parentId: number | null;
  readonly nameKr: string;
  readonly nameEn: string;
}
