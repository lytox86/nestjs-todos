import { JwtPayload } from 'jsonwebtoken';

export type MyJwtPayload = JwtPayload & {
  sub: string;
  username: string;
  role: string;
};

export type InjectedRequestUser = {
  userId: number;
  username: string;
  role: string;
};
