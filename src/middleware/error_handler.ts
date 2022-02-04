import { jsonErrorMiddleware, Middleware, status } from "../../deps.ts";

import { createResponse } from "../lib/mod.ts";

const errorHandler = jsonErrorMiddleware<Middleware>({
  format(err: Error & { status?: number }) {
    return createResponse({
      code: err.status,
      error: status((err.status as number) || 500).toString(),
      message: err.message,
    });
  },
});

export { errorHandler };
