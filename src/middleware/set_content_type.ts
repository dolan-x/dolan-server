import { Middleware } from "../../deps.ts";

const setContentType: Middleware = (ctx) => {
  ctx.response.type = "json";
};

export { setContentType };
