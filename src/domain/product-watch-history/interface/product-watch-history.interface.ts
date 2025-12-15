export interface IPwhProduct {
  readonly id: number;
  readonly nameKr: string;
  readonly nameEn: string;
  readonly thumbnailUrl: string;
}

export interface IPwhListItem {
  readonly id: number;
  readonly createdAt: Date;
  readonly product: IPwhProduct;
}
