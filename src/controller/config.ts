import { RouterMiddleware, Status } from "../../deps.ts";

import { getStorage } from "../lib/mod.ts";
import {
  CLOUD_CONFIG_NAMES,
  createResponse,
  validateRequestBody,
} from "../utils/mod.ts";

const storage = getStorage("Config");

/** GET /{VERSION}/config/{name} */
export const getConfig: RouterMiddleware<string> = async (ctx) => {
  const { name } = ctx.params;
  const config = (await storage.select(
    { name },
    {
      fields: [
        "name",
        "value",
      ],
    },
  ))[0];
  if (!config) {
    ctx.throw(Status.NotFound, `Config(Name: ${name}) does not exist`);
    return;
  }
  ctx.response.body = createResponse({ data: config.value });
};

// 没有新建的操作，新建应当在初始化时完成

/** PUT /{VERSION}/config/{name} */
export const updateConfig: RouterMiddleware<string> = async (ctx) => {
  const { name } = ctx.params;
  if (!CLOUD_CONFIG_NAMES.includes(name)) {
    ctx.throw(Status.BadRequest, `Config(Name: ${name}) is invalid`);
    return;
  }
  const requestBody = await validateRequestBody(ctx);
  const result = await storage.update(
    { name, value: requestBody },
    { name },
  );
  ctx.response.body = createResponse({ data: result });
};

// 也没有删除的操作
