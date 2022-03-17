import { jsonErrorMiddleware, Middleware, STATUS_TEXT } from "../../deps.ts";

import { createResponse } from "../utils/mod.ts";

const errorHandler: Middleware = jsonErrorMiddleware<Middleware>({
  // @ts-ignore .
  format: (err: Error & { status: number }) => {
    return createResponse({
      code: err.status,
      message: err.message || STATUS_TEXT.get(err.status),
      error: STATUS_TEXT.get(err.status) || null,
    });
  },
});

export { errorHandler };
