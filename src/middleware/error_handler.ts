import { Middleware, STATUS_TEXT } from "oak";
import * as log from "$log";
import { jsonErrorMiddleware } from "oak-json-error";

import { cr } from "../utils/mod.ts";

const errorHandler: Middleware = jsonErrorMiddleware<Middleware>({
  // @ts-ignore .
  format: (err: Error & { status: number }, ctx) => {
    log.error(err);
    log.error("Requesting url - " + ctx.request.url);
    const code = err.status || 500;
    return cr.fail({
      code,
      message: err.message || STATUS_TEXT.get(code),
      error: err.message || STATUS_TEXT.get(code),
    });
  },
});

export { errorHandler };
