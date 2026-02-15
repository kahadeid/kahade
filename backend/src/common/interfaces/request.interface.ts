
import { IAuthUser } from "./user.interface";
import { Request } from "express";

export interface IAuthRequest extends Request {
  user: IAuthUser;
}
