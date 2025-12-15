export interface IUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly signupType: string;
  readonly image: string;
  readonly isSeller: boolean;
  readonly pwdLastUpdatedAt: Date | null;
}

export interface IUpdateUserByEmail {
  name?: string;
  pwd?: string;
  image?: string | null;
}

export interface IUpdateUserBySns {
  name?: string;
  image?: string | null;
}

export interface ISignTokens {
  readonly refreshToken: string;
  readonly refreshTokenExpiredAt: Date;
  readonly accessToken: string;
  readonly accessTokenExpiredAt: Date;
}

export interface IAccessToken {
  readonly accessToken: string;
  readonly accessTokenExpiredAt: Date;
}
