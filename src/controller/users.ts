import * as log from "$log";
import { RouterMiddleware, Status } from "oak";
import { create as createJwt } from "djwt";

import { getStorage, jwtKey } from "../lib/mod.ts";
import {
  argon2id,
  argon2Verify,
  cr,
  ensureRequestBody,
  md5,
  prettyJSON,
} from "../utils/mod.ts";

import { User } from "../types/mod.ts";

const storage = getStorage("Users");

/** POST /users/signup */
export const signupUser: RouterMiddleware<"/users/signup"> = async (ctx) => {
  // TODO(@so1ve): 多用户支持
  // TODO(@so1ve): 邮箱验证
  // TODO(@so1ve): 头像
  log.info("Users: Sign up");
  if (await storage.count({}) > 0) {
    log.error("Users: Sign up - Admin already exists");
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
    log.error("Username or password is missing");
    return;
  }
  data.type = "admin"; // 测试版 唯一的用户（最先注册的）为管理员
  data.displayName = data.displayName || data.username;
  data.password = await argon2id(data.password);
  await storage.add(data);
  ctx.response.body = cr.success();
  log.info("Users: Signing up - success");
};

/** PUT /users */
export const updateUser: RouterMiddleware<"/users"> = async (ctx) => {
  const { username } = ctx.state.userInfo;
  log.info("Users: Updating user " + username);
  let data;
  try {
    data = await ctx.request.body({ type: "json" }).value;
  } catch {
    data = {};
  }
  log.info("Users: Updating user - data " + prettyJSON(data));
  const updateData: Partial<User> = {};
  const { displayName, password } = data;
  if (displayName) {
    updateData.displayName = displayName;
  }
  if (password) {
    updateData.password = await argon2id(password);
  }
  await storage.update(updateData, { username });
  ctx.response.body = cr.success();
  log.info("Users: Updating user - success");
};

/** GET /users/info */
export const getUserInfo: RouterMiddleware<"/users/info"> = (ctx) => {
  log.info("Users: Getting user info " + ctx.state.userInfo);
  ctx.response.body = cr.success({ data: ctx.state.userInfo });
  log.info("Users: Getting user info - success");
};

/** POST /users/login */
export const loginUser: RouterMiddleware<"/users/login"> = async (ctx) => {
  const requestBody = await ensureRequestBody(ctx);
  const { username, password } = requestBody;
  log.info("Users: Logging in - user " + username);
  const user: User = (await storage.select({ username }))[0];
  if (!user) {
    ctx.throw(Status.BadRequest, `User(UserName: ${username}) does not exist`);
    log.error(
      `Users: Logging in - User(UserName: ${username}) does not exist`,
    );
    return;
  }
  if (!await argon2Verify({ password, hash: user.password })) {
    ctx.throw(
      Status.BadRequest,
      `User(UserName: ${username})'s password is incorrect`,
    );
    log.error(
      `Users: Logging in - User(UserName: ${username})'s password is incorrect`,
    );
    return;
  }

  ctx.response.body = cr.success({
    data: {
      ...user,
      password: null,
      usernameMd5: await md5(user.username.toLowerCase()),
      token: await createJwt(
        { alg: "HS512", typ: "JWT" },
        {
          username: user.username,
          // Never expire
          // exp: getNumericDate(12 * 60 * 60), // 12 Hours
        },
        jwtKey,
      ),
    },
  });
  log.info("Users: Logging in - success");
};
