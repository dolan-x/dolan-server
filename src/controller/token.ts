import { createJwt, md5, RouterMiddleware, sha3 } from "../../deps.ts";

import { createResponse, jwtKey } from "../lib/mod.ts";
import { getStorage } from "../service/storage/mod.ts";
import { User } from "../types/mod.ts";

const storage = getStorage({ tableName: "Users" })!;

/** GET /{VERSION}/token */
export const getUserInfo: RouterMiddleware<string> = (ctx) => {
  ctx.response.body = createResponse({ data: ctx.state.userInfo });
};

/** POST /{VERSION}/token */
export const userLogin: RouterMiddleware<string> = async (ctx) => {
  let requestBody;
  try {
    requestBody = await ctx.request.body({ type: "json" }).value;
  } catch {
    requestBody = {};
  }
  const { username, password } = requestBody;
  const user: User = (await storage.select({ username }))[0];
  if (!user) {
    ctx.throw(400, `User(UserName: ${username}) does not exist`);
    return;
  }
  if (user.password !== await sha3(password)) {
    ctx.throw(400, `User(UserName: ${username})'s password is incorrect`);
    return;
  }

  ctx.response.body = createResponse({
    data: {
      ...user,
      password: null,
      userNameMd5: await md5(user.username.toLowerCase()),
      token: await createJwt(
        { alg: "HS512", typ: "JWT" },
        { username: user.username },
        jwtKey,
      ),
    },
  });
};
