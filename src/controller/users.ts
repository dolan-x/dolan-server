import { createJwt, md5, RouterMiddleware, Status } from "../../deps.ts";

import { getStorage, jwtKey } from "../lib/mod.ts";
import {
  argon2id,
  argon2Verify,
  createResponse,
  validateRequestBody,
} from "../utils/mod.ts";

import { User } from "../types/mod.ts";

const storage = getStorage("Users");

/** POST /{VERSION}/users/signup */
export const signupUser: RouterMiddleware<"/users/signup"> = async (ctx) => {
  // TODO(@so1ve): 多用户支持
  // TODO(@so1ve): 邮箱验证
  // TODO(@so1ve): 头像
  if (await storage.count({}) > 0) {
    ctx.throw(Status.Forbidden, "Admin already exists"); // 这里暂且这么写，目前版本只允许一个用户
    return;
  }
  let data;
  try {
    data = await ctx.request.body({ type: "json" }).value;
  } catch {
    data = {};
  }
  if (!data.username || !data.password) {
    ctx.throw(Status.BadRequest, "Username or password is missing");
    return;
  }
  data.type = "admin"; // 测试版 唯一的用户（最先注册的）为管理员
  data.displayName = data.displayName || data.username;
  data.password = await argon2id(data.password);
  await storage.add(data);
  ctx.response.body = createResponse({ data: {} });
};

/** PUT /{VERSION}/users */
export const updateUser: RouterMiddleware<"/users"> = async (ctx) => {
  const { username } = ctx.state.userInfo;
  let data;
  try {
    data = await ctx.request.body({ type: "json" }).value;
  } catch {
    data = {};
  }
  const updateData: Partial<User> = {};
  const { displayName, password } = data;
  if (displayName) {
    updateData.displayName = displayName;
  }
  if (password) {
    updateData.password = await argon2id(password);
  }
  await storage.update(updateData, { username });
  ctx.response.body = createResponse({ data: {} });
};

/** GET /{VERSION}/users/info */
export const getUserInfo: RouterMiddleware<"/users/info"> = (ctx) => {
  ctx.response.body = createResponse({ data: ctx.state.userInfo });
};

/** POST /{VERSION}/users/login */
export const loginUser: RouterMiddleware<"/users/login"> = async (ctx) => {
  const requestBody = await validateRequestBody(ctx);
  const { username, password } = requestBody;
  const user: User = (await storage.select({ username }))[0];
  if (!user) {
    ctx.throw(Status.BadRequest, `User(UserName: ${username}) does not exist`);
    return;
  }
  if (!await argon2Verify({ password, hash: user.password })) {
    ctx.throw(
      Status.BadRequest,
      `User(UserName: ${username})'s password is incorrect`,
    );
    return;
  }

  ctx.response.body = createResponse({
    data: {
      ...user,
      password: null,
      usernameMd5: await md5(user.username.toLowerCase()),
      token: await createJwt(
        { alg: "HS512", typ: "JWT" },
        { username: user.username },
        jwtKey,
      ),
    },
  });
};
