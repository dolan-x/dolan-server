import { RouterMiddleware } from "oak";
import { jwtMiddleware, OnSuccessHandler } from "oak-middleware-jwt";
import { jwtKey } from "../lib/mod.ts";

const onSuccess: OnSuccessHandler = (ctx, jwtPayload) => {
  ctx.state.userInfo = jwtPayload;
};

// @ts-ignore: .
const jwt = jwtMiddleware<RouterMiddleware<string>>({
  key: jwtKey,
  onSuccess,
});
export { jwt };
