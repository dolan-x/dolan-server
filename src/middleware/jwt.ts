import {
  jwtMiddleware,
  OnSuccessHandler,
  RouterMiddleware,
} from "../../deps.ts";
import { jwtKey } from "../lib/mod.ts";

const onSuccess: OnSuccessHandler = (ctx, jwtPayload) => {
  ctx.state.userInfo = jwtPayload;
};

const jwt = jwtMiddleware<RouterMiddleware<string>>({ key: jwtKey, onSuccess });
export { jwt };
