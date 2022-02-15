import { createJwt, md5, RouterMiddleware, sha3 } from "../../deps.ts";

import { createResponse, jwtKey } from "../lib/mod.ts";
import { getStorage } from "../service/storage/mod.ts";
import { User } from "../types/mod.ts";

const storage = getStorage({ tableName: "Users" })!;

/** POST /{VERSION}/users/signup */
export const signupUser: RouterMiddleware<string> = async (ctx) => {
  // TODO(@so1ve): 多用户支持
  // TODO(@so1ve): 邮箱验证
  // TODO(@so1ve): 头像
  if (await storage.count({}) > 0) {
    ctx.throw(403, "Admin already exists"); // 这里暂且这么写，目前版本只允许一个用户
    return;
  }
  let data;
  try {
    data = await ctx.request.body({ type: "json" }).value;
  } catch {
    data = {};
  }
  if (!data.username || !data.password) {
    ctx.throw(400, "Username or password is missing");
    return;
  }
  data.type = "admin"; // 测试版 唯一的用户（最先注册的）为管理员
  data.displayName = data.displayName || data.username;
  data.password = await sha3(data.password);
  await storage.add(data);
  ctx.response.body = createResponse({ data: {} });
};

/** PUT /{VERSION}/users */
export const updateUser: RouterMiddleware<string> = async (ctx) => {
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
    updateData.password = await sha3(password);
  }
  await storage.update(updateData, { username });
  ctx.response.body = createResponse({ data: {} });
};

/** GET /{VERSION}/users/whoAmI */
export const getUserInfo: RouterMiddleware<string> = (ctx) => {
  ctx.response.body = createResponse({ data: ctx.state.userInfo });
};

/** POST /{VERSION}/users/login */
export const loginUser: RouterMiddleware<string> = async (ctx) => {
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
      usernameMd5: await md5(user.username.toLowerCase()),
      token: await createJwt(
        { alg: "HS512", typ: "JWT" },
        { username: user.username },
        jwtKey,
      ),
    },
  });
};