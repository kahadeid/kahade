import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { IAuthUser } from "@common/interfaces/user.interface";

export const CurrentUser = createParamDecorator(
  (
    data: keyof IAuthUser | undefined,
    ctx: ExecutionContext,
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): IAuthUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as IAuthUser;

    return data ? user?.[data] : user;
  },
);
