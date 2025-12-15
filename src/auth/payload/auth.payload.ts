export class AuthJwtPayload {
  constructor(value: string, expiredAt: Date | undefined) {
    this.value = value;
    this.expiredAt = expiredAt;
  }

  readonly value: string;
  readonly expiredAt: Date | undefined;
}
