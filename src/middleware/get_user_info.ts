import { RouterMiddleware, verifyJwt } from "../../deps.ts";

import { jwtKey } from "../lib/mod.ts";
import { getStorage } from "../service/storage/mod.ts";

const storage = getStorage({ tableName: "Users" })!;

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
    console.log(payload);
    const user = (await storage.select({ username: payload.username }))[0];
    ctx.state.userInfo = user;
  } catch {}
  await next();
};
