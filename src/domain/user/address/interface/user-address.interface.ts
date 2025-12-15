export interface IUAListItem {
  readonly id: number;
  readonly name: string;
  readonly receiverName: string;
  readonly phone: string;
  readonly address: string;
  readonly addressDetail: string;
  readonly postcode: string;
  readonly isDefault: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
