import { jsonErrorMiddleware, Middleware, STATUS_TEXT } from "../../deps.ts";

import { cr } from "../utils/mod.ts";

const errorHandler: Middleware = jsonErrorMiddleware<Middleware>({
  // @ts-ignore .
  format: (err: Error & { status: number }) => {
    const code = err.status || 500;
    return cr.fail({
      code,
      message: err.message || STATUS_TEXT.get(code),
      error: err.message || STATUS_TEXT.get(code),
    });
  },
});

export { errorHandler };
