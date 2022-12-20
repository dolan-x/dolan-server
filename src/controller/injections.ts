import * as log from "$log";
import { RouterMiddleware, Status } from "oak";
import { getStorage } from "../lib/mod.ts";
import { ensureRequestBody } from "../utils/api_utils.ts";
import { checkExists } from "../utils/check_exists.ts";
import { cr, prettyJSON } from "../utils/mod.ts";

const storage = getStorage("Injections");

function processInjections(injections: any[]) {
  return injections.reduce((a, b) => ({
    ...a,
    [b.name]: b.value,
  }), {} as any);
}

/** GET /injections */
export const getInjections: RouterMiddleware<"/injections"> = async (ctx) => {
  log.info("Injections: List injections");
  const injections = await storage.select(
    {},
    {
      fields: [
        "name",
        "value",
      ],
    },
  );

  ctx.response.body = cr.success({ data: processInjections(injections) });
  log.info("Injections: List injections - success");
};

/** GET /injections/{name} */
export const getInjection: RouterMiddleware<"/injections/:name"> = async (
  ctx,
) => {
  const { name } = ctx.params;
  log.info("Injections: Getting injection - " + name);
  const injection = (await storage.select(
    { name },
    {
      fields: [
        "name",
        "value",
      ],
    },
  ))[0];
  if (!injection) {
    log.error(
      `Injections: Getting injection - Injection(Name: ${name}) does not exist`,
    );
    ctx.throw(Status.NotFound, `Injection(Name: ${name}) does not exist`);
    return;
  }
  ctx.response.body = cr.success({ data: injection });
  log.info("Injections: Getting injection - success");
};

/** POST /injections */
export const createInjection: RouterMiddleware<"/injections"> = async (
  ctx,
) => {
  log.info("Injections: Creating injection");
  const requestBody = await ensureRequestBody(ctx);
  log.info("Injections: Creating injection - body " + prettyJSON(requestBody));
  const {
    name,
    value,
  } = requestBody;
  log.info("Injections: Creating injection - " + name);

  if (!name) {
    log.error("Injections: Creating injection - Name is required");
    ctx.throw(Status.BadRequest, "Name is required");
    return;
  }

  const exists = await checkExists(storage, { name });

  if (exists) {
    ctx.throw(Status.Conflict, `Injection(Name: ${name}) already exists`);
    return;
  }

  const result = await storage.add({
    name,
    value,
  });

  ctx.response.body = cr.success({ data: result });
  log.info("Injections: Creating injection - success");
};

/** PUT /injections */

export const updateInjections: RouterMiddleware<"/injections"> = async (
  ctx,
) => {
  log.info("Injections: Updating injections");
  const requestBody = await ensureRequestBody(ctx);
  log.info("Injections: Updating injections - body " + prettyJSON(requestBody));

  if (!requestBody) {
    log.error("Injections: Updating injections - Injections is required");
    ctx.throw(Status.BadRequest, "Injections is required");
    return;
  }

  const result = await Promise.all(requestBody.map(async (injection: any) => {
    const { name, value } = injection;
    if (!await checkExists(storage, { name })) {
      log.error(
        `Injections: Updating injections - Injection(Name: ${name}) does not exist`,
      );
      ctx.throw(Status.NotFound, `Injection(Name: ${name}) does not exist`);
      return;
    }

    return await storage.update(
      { name, value },
      { name },
    );
  }));

  ctx.response.body = cr.success({ data: result });
  log.info("Injections: Updating injections - success");
};

/** PUT /injections/{name} */
export const updateInjection: RouterMiddleware<"/injections/:name"> = async (
  ctx,
) => {
  const { name } = ctx.params;
  log.info("Injections: Updating injection - " + name);
  const requestBody = await ensureRequestBody(ctx);
  log.info("Injections: Updating injection - body " + prettyJSON(requestBody));
  const { value } = requestBody;

  if (!await checkExists(storage, { name })) {
    log.error(
      `Injections: Updating injections - Injection(Name: ${name}) does not exist`,
    );
    ctx.throw(Status.NotFound, `Injection(Name: ${name}) does not exist`);
    return;
  }

  const result = await storage.update(
    { name, value },
    { name },
  );
  ctx.response.body = cr.success({ data: result });
  log.info("Injections: Updating injection - success");
};

/** DELETE /injections/{name} */
export const deleteInjection: RouterMiddleware<"/injections/:name"> = async (
  ctx,
) => {
  const { name } = ctx.params;
  log.info("Injections: Deleting injection - " + name);
  await storage.delete({ name });

  ctx.response.body = cr.success();
  log.info("Injections: Deleting injection - success");
};
