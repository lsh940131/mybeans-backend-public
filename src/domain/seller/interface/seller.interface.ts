export interface ISellerListItem {
  readonly id: number;
  readonly name: string;
  readonly image: string;
}

interface ISellerUser {
  readonly name: string;
}

export interface ISeller {
  readonly id: number;
  readonly name: string;
  readonly image: string;
  readonly user: ISellerUser;
}
