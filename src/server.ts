// Copyright 2022 the Dolan authors. All rights reserved. MIT license.
import "https://deno.land/x/xhr@0.1.2/mod.ts"; // XMLHttpRequest的Polyfill
import { Application, colors, parse } from "../deps.ts";
import { unprotectedRouter } from "./unprotected_routes.ts";
import { protectedRouter } from "./protected_routes.ts";
import { errorHandler } from "./middleware/mod.ts";
import { User } from "./types/mod.ts";

const parsedArgs = parse(Deno.args);

interface ApplicationState {
  userInfo: User;
}
const app = new Application<ApplicationState>();
const PORT = parsedArgs.p || parsedArgs.port || 4000;

app.use(errorHandler);
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
