import { RouterMiddleware, verifyJwt } from "../../deps.ts";

import { jwtKey } from "../lib/mod.ts";

export const getUserInfo: RouterMiddleware<string> = async (ctx, next) => {
  const authHeader = ctx.request.headers.get("Authorization")!;
  if (!authHeader) {
    ctx.state.userInfo = {};
    await next();
    return;
  }
  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyJwt(token, jwtKey);
    ctx.state.userInfo = payload;
  } catch {}
  await next();
};
