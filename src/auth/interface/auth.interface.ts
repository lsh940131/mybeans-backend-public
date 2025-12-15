import { RoleEnum } from '../enum/auth.enum';

export interface IAuth {
  readonly id: number;
  readonly jwt: string;
  readonly roles: RoleEnum[];
  readonly sellerId: number | undefined;
}

export interface IAuthGoogle {
  readonly provider: string;
  readonly sub: string;
  readonly email: string;
  readonly name: string;
  readonly image: string;
  readonly rememberMe: boolean;
  readonly redirectTo: string;
}

export interface IAuthNaver {
  readonly provider: string;
  readonly sub: string;
  readonly email: string;
  readonly name: string;
  readonly image?: string;
  readonly rememberMe: boolean;
  readonly redirectTo: string;
}

export interface IAuthKakao {
  readonly provider: string;
  readonly sub: string;
  readonly email?: string;
  readonly name: string;
  readonly image?: string;
  readonly rememberMe: boolean;
  readonly redirectTo: string;
}
