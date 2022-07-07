// Copyright 2022 the Dolan authors. All rights reserved. MIT license.
import { Application, colors, logger, oakCors, parseFlags } from "../deps.ts";
import { unprotectedRouter } from "./unprotected_routes.ts";
import { protectedRouter } from "./protected_routes.ts";
import { errorHandler, logMiddleware } from "./middleware/mod.ts";
import { User } from "./types/mod.ts";

const parsedArgs = parseFlags(Deno.args);

interface ApplicationState {
  userInfo: User;
}
const app = new Application<ApplicationState>();
const PORT = parsedArgs.p || parsedArgs.port || 4000;

app.use(errorHandler);
app.use(oakCors());
app.use(logMiddleware)
  .use(logger.logger)
  .use(logger.responseTime);
app.use(unprotectedRouter.routes())
  .use(unprotectedRouter.allowedMethods({ throw: true }));
app.use(protectedRouter.routes())
  .use(protectedRouter.allowedMethods({ throw: true }));

app.listen({ port: PORT });
console.log(
  `${colors.bgGreen(colors.black("Success"))} Server is running at ${
    colors.blue(`http://localhost:${PORT}`)
  }`,
);

export default app;
